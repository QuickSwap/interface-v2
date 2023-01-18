import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Frown } from 'react-feather';
import { useActiveWeb3React } from 'hooks';
import Loader from '../Loader';
import { Deposit } from '../../models/interfaces';
import { FarmingType } from '../../models/enums';
import { Link, useLocation } from 'react-router-dom';
import './index.scss';
import FarmCard from './FarmCard';
import { Box, Divider } from '@material-ui/core';
import { useV3StakeData } from 'state/farms/hooks';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import { useTranslation } from 'react-i18next';
import { GlobalConst } from 'constants/index';
import SortColumns from 'components/SortColumns';

export function FarmingMyFarms() {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const {
    fetchTransferredPositions: {
      fetchTransferredPositionsFn,
      transferredPositions,
      transferredPositionsLoading,
    },
    fetchEternalFarmPoolAprs: {
      fetchEternalFarmPoolAprsFn,
      eternalFarmPoolAprs,
      eternalFarmPoolAprsLoading,
    },
    fetchEternalFarmAprs: {
      fetchEternalFarmAprsFn,
      eternalFarmAprs,
      eternalFarmAprsLoading,
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
    fetchEternalFarmPoolAprsFn();
    fetchEternalFarmAprsFn();
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

  const [sortByQuick, setSortByQuick] = useState(
    GlobalConst.utils.v3FarmSortBy.pool,
  );

  const [sortDescQuick, setSortDescQuick] = useState(false);

  const sortColumnsQuickSwap = [
    {
      text: t('pool'),
      index: GlobalConst.utils.v3FarmSortBy.pool,
      width: 0.5,
      justify: 'flex-start',
    },
    {
      text: t('poolAPR'),
      index: GlobalConst.utils.v3FarmSortBy.poolAPR,
      width: 0.15,
      justify: 'flex-start',
    },
    {
      text: t('farmAPR'),
      index: GlobalConst.utils.v3FarmSortBy.farmAPR,
      width: 0.15,
      justify: 'flex-start',
    },
    {
      text: t('earnedRewards'),
      index: GlobalConst.utils.v3FarmSortBy.rewards,
      width: 0.2,
      justify: 'flex-start',
    },
  ];

  const sortByDesktopItemsQuick = sortColumnsQuickSwap.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortByQuick === item.index) {
          setSortDescQuick(!sortDescQuick);
        } else {
          setSortByQuick(item.index);
          setSortDescQuick(false);
        }
      },
    };
  });

  return (
    <>
      {transferredPositionsLoading ||
      eternalFarmPoolAprsLoading ||
      eternalFarmAprsLoading ||
      !shallowPositions ? (
        <Box py={5} className='flex justify-center'>
          <Loader stroke={'white'} size={'1.5rem'} />
        </Box>
      ) : shallowPositions && shallowPositions.length === 0 ? (
        <Box py={5} className='flex flex-col items-center'>
          <Frown size={35} stroke={'white'} />
          <Box mb={3} mt={1}>
            {t('nofarms')}
          </Box>
        </Box>
      ) : shallowPositions && shallowPositions.length !== 0 ? (
        <Box padding='24px'>
          {farmedNFTs && farmedNFTs.length > 0 && (
            <Box mt={2} pb={2}>
              <Box mb={2}>
                <Divider />
              </Box>
              <h6>QuickSwap {t('farms')}</h6>
              <Box mt={2} px={3.5}>
                <Box width='85%'>
                  <SortColumns
                    sortColumns={sortByDesktopItemsQuick}
                    selectedSort={sortByQuick}
                    sortDesc={sortDescQuick}
                  />
                </Box>
              </Box>
              <Box mt={2}>
                {farmedNFTs.map((el, i) => {
                  return (
                    <div
                      className={'v3-my-farms-position-card'}
                      key={i}
                      data-navigatedto={hash == `#${el.id}`}
                    >
                      <FarmCard
                        el={el}
                        poolApr={
                          eternalFarmPoolAprs
                            ? eternalFarmPoolAprs[el.pool.id]
                            : undefined
                        }
                        farmApr={
                          eternalFarmAprs ? eternalFarmAprs[el.id] : undefined
                        }
                      />
                    </div>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      ) : null}
    </>
  );
}
