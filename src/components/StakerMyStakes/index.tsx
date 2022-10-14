import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Frown } from 'react-feather';
import { useActiveWeb3React } from 'hooks';
import Loader from '../Loader';
import { Deposit } from '../../models/interfaces';
import { FarmingType } from '../../models/enums';
import { Link, useLocation } from 'react-router-dom';
import './index.scss';
import FarmCard from './FarmCard';
import { Box } from '@material-ui/core';
import { useV3StakeData } from 'state/farms/hooks';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';

export function FarmingMyFarms() {
  const { account } = useActiveWeb3React();

  const {
    fetchTransferredPositions: {
      fetchTransferredPositionsFn,
      transferredPositions,
      transferredPositionsLoading,
    },
  } = useFarmingSubgraph() || {};

  const { v3Stake } = useV3StakeData();
  const { selectedTokenId, txType, txHash, txConfirmed, selectedFarmingType } =
    v3Stake ?? {};

  const [shallowPositions, setShallowPositions] = useState<Deposit[] | null>(
    null,
  );

  const { hash } = useLocation();

  const farmedNFTs = useMemo(() => {
    if (!shallowPositions) return;
    const _positions = shallowPositions.filter((v) => v.onFarmingCenter);
    return _positions.length > 0 ? _positions : [];
  }, [shallowPositions]);

  useEffect(() => {
    fetchTransferredPositionsFn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  useEffect(() => {
    if (txType === 'farm' && txConfirmed) {
      fetchTransferredPositionsFn(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txType, txConfirmed]);

  useEffect(() => {
    setShallowPositions(transferredPositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transferredPositions?.length]);

  useEffect(() => {
    if (!shallowPositions) return;
    if (txHash && txConfirmed && selectedTokenId) {
      if (txType === 'eternalCollectReward') {
        setShallowPositions(
          shallowPositions.map((el) => {
            if (el.id === selectedTokenId) {
              el.eternalEarned = 0;
              el.eternalBonusEarned = 0;
            }
            return el;
          }),
        );
      } else if (txType === 'withdraw') {
        setShallowPositions(
          shallowPositions.map((el) => {
            if (el.id === selectedTokenId) {
              el.onFarmingCenter = false;
            }
            return el;
          }),
        );
      } else if (txType === 'claimRewards') {
        setShallowPositions(
          shallowPositions.map((el) => {
            if (el.id === selectedTokenId) {
              if (selectedFarmingType === FarmingType.LIMIT) {
                el.limitFarming = null;
              } else {
                el.eternalFarming = null;
              }
            }
            return el;
          }),
        );
      } else if (txType === 'getRewards') {
        setShallowPositions(
          shallowPositions.map((el) => {
            if (el.id === selectedTokenId) {
              if (selectedFarmingType === FarmingType.LIMIT) {
                el.limitFarming = null;
              } else {
                el.eternalFarming = null;
              }
            }
            return el;
          }),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHash, txConfirmed, selectedTokenId, selectedFarmingType, txType]);

  return (
    <>
      {transferredPositionsLoading || !shallowPositions ? (
        <div className={'my-farms__loader flex-s-between f-jc'}>
          <Loader stroke={'white'} size={'1.5rem'} />
        </div>
      ) : shallowPositions && shallowPositions.length === 0 ? (
        <div className={' flex-s-between f c f-jc'}>
          <Frown size={35} stroke={'white'} />
          <Box mb={3} mt={1}>
            No farms
          </Box>
        </div>
      ) : shallowPositions && shallowPositions.length !== 0 ? (
        <Box padding='24px'>
          <div className={'my-farms__ad p-05 br-12 f f-ac f-jc'}>
            <div className={'mr-1'}>✨ Earn even more Rewards</div>
            <Link
              className={'my-farms__ad-link p-05 br-8 hover-cp'}
              to={'/dragons'}
            >
              Stake Rewards
            </Link>
          </div>
          {farmedNFTs && (
            <div>
              {farmedNFTs.map((el, i) => {
                const date = new Date(
                  +el.enteredInEternalFarming * 1000,
                ).toLocaleString('us');
                return (
                  <div
                    className={'my-farms__position-card p-1 br-12 mt-1'}
                    key={i}
                    data-navigatedto={hash == `#${el.id}`}
                  >
                    <FarmCard el={el} />
                  </div>
                );
              })}
            </div>
          )}
        </Box>
      ) : null}
    </>
  );
}
