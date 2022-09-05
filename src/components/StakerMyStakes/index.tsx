import { isAddress } from '@ethersproject/address';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Frown } from 'react-feather';
import { useFarmingHandlers } from '../../hooks/useStakerHandlers';
import { useActiveWeb3React } from 'hooks';
import { useAllTransactions } from '../../state/transactions/hooks';
import Loader from '../Loader';
import Modal from '../Modal';
import {
  Deposit,
  RewardInterface,
  UnfarmingInterface,
} from '../../models/interfaces';
import { FarmingType } from '../../models/enums';
import { getCountdownTime } from '../../utils/time';
import { getProgress } from '../../utils/getProgress';
import { CheckOut } from './CheckOut';
import { Link, useLocation } from 'react-router-dom';
import { useSortedRecentTransactions } from '../../hooks/useSortedRecentTransactions';
import ModalBody from './ModalBody';
import PositionCardBodyStat from './PositionCardBodyStat';
import './index.scss';
import {
  TransactionErrorContent,
  TransactionConfirmationModal,
  ConfirmationModalContent,
  DoubleCurrencyLogo,
} from 'components';
import FarmModal from './FarmModalContent';
import { useTranslation } from 'react-i18next';
import FarmModalContent from './FarmModalContent';
import FarmCard from './FarmCard';
import { Box } from '@material-ui/core';

interface FarmingMyFarmsProps {
  data: Deposit[] | null;
  refreshing: boolean;
  now: number;
  fetchHandler: () => any;
}

export function FarmingMyFarms({
  data,
  refreshing,
  now,
  fetchHandler,
}: FarmingMyFarmsProps) {
  const { account } = useActiveWeb3React();

  const {
    getRewardsHash,
    sendNFTL2Handler,
    eternalCollectRewardHandler,
    withdrawHandler,
    exitHandler,
    claimRewardsHandler,
    claimRewardHash,
    eternalCollectRewardHash,
    withdrawnHash,
  } = useFarmingHandlers() || {};

  const [sending, setSending] = useState<UnfarmingInterface>({
    id: null,
    state: null,
  });
  const [shallowPositions, setShallowPositions] = useState<Deposit[] | null>(
    null,
  );
  const [gettingReward, setGettingReward] = useState<RewardInterface>({
    id: null,
    state: null,
    farmingType: null,
  });
  const [eternalCollectReward, setEternalCollectReward] = useState<
    UnfarmingInterface
  >({ id: null, state: null });
  const [unfarming, setUnfarming] = useState<UnfarmingInterface>({
    id: null,
    state: null,
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [txHash, setTxHash] = useState('');

  const [addLiquidityErrorMessage, setAddLiquidityErrorMessage] = useState<
    string | null
  >(null);

  const { t } = useTranslation();

  const allTransactions = useAllTransactions();
  const sortedRecentTransactions = useSortedRecentTransactions();
  const { hash } = useLocation();

  const confirmed = useMemo(
    () =>
      sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash),
    [sortedRecentTransactions, allTransactions],
  );

  const farmedNFTs = useMemo(() => {
    if (!shallowPositions) return;
    const _positions = shallowPositions.filter((v) => v.onFarmingCenter);
    return _positions.length > 0 ? _positions : [];
  }, [shallowPositions]);

  useEffect(() => {
    fetchHandler();
  }, [account]);

  useEffect(() => {
    setShallowPositions(data);
  }, [data]);

  useEffect(() => {
    if (!eternalCollectReward.state) return;

    if (typeof eternalCollectRewardHash === 'string') {
      setEternalCollectReward({ id: null, state: null });
    } else if (
      eternalCollectRewardHash &&
      confirmed.includes(String(eternalCollectRewardHash.hash))
    ) {
      setEternalCollectReward({
        id: eternalCollectRewardHash.id,
        state: 'done',
      });
      if (!shallowPositions) return;
      setShallowPositions(
        shallowPositions.map((el) => {
          if (el.id === eternalCollectRewardHash.id) {
            el.eternalEarned = 0;
            el.eternalBonusEarned = 0;
          }
          return el;
        }),
      );
    }
  }, [eternalCollectRewardHash, confirmed]);

  useEffect(() => {
    if (!unfarming.state) return;

    if (typeof withdrawnHash === 'string') {
      setUnfarming({ id: null, state: null });
    } else if (
      withdrawnHash &&
      confirmed.includes(String(withdrawnHash.hash))
    ) {
      setUnfarming({ id: withdrawnHash.id, state: 'done' });
      if (!shallowPositions) return;
      setShallowPositions(
        shallowPositions.map((el) => {
          if (el.id === withdrawnHash.id) {
            el.onFarmingCenter = false;
          }
          return el;
        }),
      );
    }
  }, [withdrawnHash, confirmed]);

  useEffect(() => {
    if (!gettingReward.state) return;

    if (typeof claimRewardHash === 'string') {
      setGettingReward({ id: null, state: null, farmingType: null });
    } else if (
      claimRewardHash &&
      confirmed.includes(String(claimRewardHash.hash))
    ) {
      setGettingReward({
        id: claimRewardHash.id,
        state: 'done',
        farmingType: claimRewardHash.farmingType,
      });
      if (!shallowPositions) return;
      setShallowPositions(
        shallowPositions.map((el) => {
          if (el.id === claimRewardHash.id) {
            if (claimRewardHash.farmingType === FarmingType.LIMIT) {
              el.limitFarming = null;
            } else {
              el.eternalFarming = null;
            }
          }
          return el;
        }),
      );
    }
  }, [claimRewardHash, confirmed]);

  useEffect(() => {
    if (!gettingReward.state) return;

    if (typeof getRewardsHash === 'string') {
      setGettingReward({ id: null, state: null, farmingType: null });
    } else if (
      getRewardsHash &&
      confirmed.includes(String(getRewardsHash.hash))
    ) {
      setGettingReward({
        id: getRewardsHash.id,
        state: 'done',
        farmingType: getRewardsHash.farmingType,
      });
      if (!shallowPositions) return;
      setShallowPositions(
        shallowPositions.map((el) => {
          if (el.id === getRewardsHash.id) {
            if (getRewardsHash.farmingType === FarmingType.LIMIT) {
              el.limitFarming = null;
            } else {
              el.eternalFarming = null;
            }
          }
          return el;
        }),
      );
    }
  }, [getRewardsHash, confirmed]);

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // todo: handle dismiss
  }, []);

  const modalContent = () => {
    return <FarmModalContent />;
  };

  return (
    <>
      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          txPending={txPending}
          hash={txHash}
          modalWrapper='modalWrapperNftSelector'
          content={() =>
            addLiquidityErrorMessage ? (
              <TransactionErrorContent
                onDismiss={handleDismissConfirmation}
                message={addLiquidityErrorMessage}
              />
            ) : (
              <ConfirmationModalContent
                title={'Select NFT for farming'}
                onDismiss={handleDismissConfirmation}
                content={modalContent}
              />
            )
          }
          pendingText={'pendingText'}
          modalContent={
            txPending ? t('submittedTxLiquidity') : t('successAddedliquidity')
          }
        />
      )}

      {refreshing || !shallowPositions ? (
        <div className={'my-farms__loader flex-s-between f-jc'}>
          <Loader stroke={'white'} size={'1.5rem'} />
        </div>
      ) : shallowPositions && shallowPositions.length === 0 ? (
        <div className={' flex-s-between f c f-jc'}>
          <Frown size={35} stroke={'white'} />
          <Box mb={3} mt={1}>No farms</Box>
        </div>
      ) : shallowPositions && shallowPositions.length !== 0 ? (
        <>
          <div className={'my-farms__ad p-05 br-12 f f-ac f-jc mb-1'}>
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
                ).toLocaleString();
                return (
                  <div
                    className={'my-farms__position-card p-1 br-12 mb-1'}
                    key={i}
                    data-navigatedto={hash == `#${el.id}`}
                  >
                    <FarmCard
                      el={el}
                      withdrawHandler={withdrawHandler}
                      unstaking={unfarming}
                      setUnstaking={setUnfarming}
                      setGettingReward={setGettingReward}
                      setEternalCollectReward={setEternalCollectReward}
                      eternalCollectRewardHandler={eternalCollectRewardHandler}
                      claimRewardsHandler={claimRewardsHandler}
                      eternalCollectReward={eternalCollectReward}
                      gettingReward={gettingReward}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </>
  );
}
