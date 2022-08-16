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
import PositionHeader from './PositionHeader';
import PositionCardBodyHeader from './PositionCardBodyHeader';
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
    sendNFTL2Hash,
    eternalCollectRewardHash,
    withdrawnHash,
  } = useFarmingHandlers() || {};

  const [sendModal, setSendModal] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<string>('');
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

  const sendNFTHandler = useCallback(
    (v) => {
      if (!isAddress(recipient) || recipient === account) {
        return;
      }

      sendNFTL2Handler(recipient, v);
    },
    [recipient],
  );

  useEffect(() => {
    fetchHandler();
  }, [account]);

  useEffect(() => {
    setShallowPositions(data);
  }, [data]);

  useEffect(() => {
    if (!sending.state) return;

    if (typeof sendNFTL2Hash === 'string') {
      setSending({ id: null, state: null });
    } else if (
      sendNFTL2Hash &&
      confirmed.includes(String(sendNFTL2Hash.hash))
    ) {
      setSending({ id: sendNFTL2Hash.id, state: 'done' });
      if (!shallowPositions) return;
      setShallowPositions(
        shallowPositions.filter((el) => el.L2tokenId !== sendNFTL2Hash.id),
      );
    }
  }, [sendNFTL2Hash, confirmed]);

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
          {/* <Frown size={35} stroke={'white'} /> */}
          {/* <div className={'mt-1'}>No farms</div> */}
          <FarmCard />
        </div>
      ) : shallowPositions && shallowPositions.length !== 0 ? (
        <>
          <div className={'my-farms__ad p-05 br-12 f f-ac f-jc mb-1'}>
            <div className={'mr-1'}>✨ Earn even more Rewards</div>
            <Link
              className={'my-farms__ad-link p-05 br-8 hover-cp'}
              to={'/staking'}
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
                    <PositionHeader
                      el={el}
                      setUnstaking={setUnfarming}
                      setSendModal={setSendModal}
                      unstaking={unfarming}
                      withdrawHandler={withdrawHandler}
                    />
                    <div className={'f cg-1 rg-1 mxs_fd-c'}>
                      <div
                        className={
                          'my-farms__position-card__body w-100 p-1 br-8'
                        }
                      >
                        <PositionCardBodyHeader
                          el={el}
                          farmingType={FarmingType.LIMIT}
                          date={date}
                        />
                        {el.limitFarming ? (
                          <>
                            <PositionCardBodyStat
                              rewardToken={el.limitRewardToken}
                              earned={el.limitEarned}
                              bonusEarned={el.limitBonusEarned}
                              bonusRewardToken={el.limitBonusRewardToken}
                            />
                            <div className={'f mxs_fd-c'}>
                              {!el.ended &&
                                el.limitEndTime * 1000 > Date.now() && (
                                  <div className={'f w-100'}>
                                    <div
                                      className={'w-100'}
                                      data-started={
                                        el.started ||
                                        el.limitStartTime * 1000 < Date.now()
                                      }
                                    >
                                      {!el.started &&
                                        el.limitStartTime * 1000 >
                                          Date.now() && (
                                          <div
                                            className={'mb-05 p-r fs-075'}
                                          >{`Starts in ${getCountdownTime(
                                            el.limitStartTime,
                                            now,
                                          )}`}</div>
                                        )}
                                      {(el.started ||
                                        el.limitStartTime * 1000 <
                                          Date.now()) && (
                                        <div
                                          className={'mb-05 p-r fs-075'}
                                        >{`Ends in ${getCountdownTime(
                                          el.limitEndTime,
                                          now,
                                        )}`}</div>
                                      )}
                                      <div
                                        className={
                                          'my-farms__position-card__body__event-progress w-100 br-8 p-025 mt-05'
                                        }
                                      >
                                        {!el.started &&
                                        el.limitStartTime * 1000 >
                                          Date.now() ? (
                                          <div
                                            className={'br-8'}
                                            style={{
                                              width: `${getProgress(
                                                el.createdAtTimestamp,
                                                el.limitStartTime,
                                                now,
                                              )}%`,
                                            }}
                                          />
                                        ) : (
                                          <div
                                            className={'br-8'}
                                            style={{
                                              width: `${getProgress(
                                                el.limitStartTime,
                                                el.limitEndTime,
                                                now,
                                              )}%`,
                                            }}
                                          />
                                        )}
                                      </div>
                                    </div>
                                    {!el.started &&
                                      el.limitStartTime * 1000 > Date.now() && (
                                        <button
                                          className={
                                            'btn primary w-100 ml-1 br-8 b pv-075'
                                          }
                                          disabled={
                                            gettingReward.id === el.id &&
                                            gettingReward.farmingType ===
                                              FarmingType.LIMIT &&
                                            gettingReward.state !== 'done'
                                          }
                                          onClick={() => {
                                            setGettingReward({
                                              id: el.id,
                                              state: 'pending',
                                              farmingType: FarmingType.LIMIT,
                                            });
                                            exitHandler(
                                              el.id,
                                              { ...el },
                                              FarmingType.LIMIT,
                                            );
                                          }}
                                        >
                                          {gettingReward &&
                                          gettingReward.farmingType ===
                                            FarmingType.LIMIT &&
                                          gettingReward.id === el.id &&
                                          gettingReward.state !== 'done' ? (
                                            <span>
                                              <Loader
                                                size={'13px'}
                                                stroke={'white'}
                                                style={{ margin: 'auto' }}
                                              />
                                            </span>
                                          ) : (
                                            <span>Undeposit</span>
                                          )}
                                        </button>
                                      )}
                                  </div>
                                )}
                              {(el.ended ||
                                el.limitEndTime * 1000 < Date.now()) && (
                                <button
                                  className={'btn primary b w-100 pv-075 ph-1'}
                                  disabled={
                                    (gettingReward.id === el.id &&
                                      gettingReward.farmingType ===
                                        FarmingType.LIMIT &&
                                      gettingReward.state !== 'done') ||
                                    +el.limitReward == 0
                                  }
                                  onClick={() => {
                                    setGettingReward({
                                      id: el.id,
                                      state: 'pending',
                                      farmingType: FarmingType.LIMIT,
                                    });
                                    claimRewardsHandler(
                                      el.id,
                                      { ...el },
                                      FarmingType.LIMIT,
                                    );
                                  }}
                                >
                                  {gettingReward &&
                                  gettingReward.farmingType ===
                                    FarmingType.LIMIT &&
                                  gettingReward.id === el.id &&
                                  gettingReward.state !== 'done' ? (
                                    <div className={'f f-jc f-ac cg-05'}>
                                      <Loader
                                        size={'18px'}
                                        stroke={'var(--white)'}
                                      />
                                      Collecting
                                    </div>
                                  ) : (
                                    <span>Collect rewards & Undeposit</span>
                                  )}
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div
                            className={
                              'my-farms__position-card__empty f c f-ac f-jc'
                            }
                          >
                            {el.limitAvailable ? (
                              <CheckOut link={'limit-farms'} />
                            ) : (
                              <span>No limit farms for now</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div
                        className={
                          'my-farms__position-card__body w-100 p-1 br-8'
                        }
                      >
                        <PositionCardBodyHeader
                          farmingType={FarmingType.ETERNAL}
                          date={date}
                          enteredInEternalFarming={el.enteredInEternalFarming}
                          eternalFarming={el.eternalFarming}
                          el={el}
                        />
                        {el.eternalFarming ? (
                          <>
                            <PositionCardBodyStat
                              rewardToken={el.eternalRewardToken}
                              earned={el.eternalEarned}
                              bonusEarned={el.eternalBonusEarned}
                              bonusRewardToken={el.eternalBonusRewardToken}
                            />
                            <div className={'f mxs_fd-c w-100'}>
                              <button
                                className={'btn primary w-100 b br-8 pv-075'}
                                disabled={
                                  (eternalCollectReward.id === el.id &&
                                    eternalCollectReward.state !== 'done') ||
                                  (el.eternalEarned == 0 &&
                                    el.eternalBonusEarned == 0)
                                }
                                onClick={() => {
                                  setEternalCollectReward({
                                    id: el.id,
                                    state: 'pending',
                                  });
                                  eternalCollectRewardHandler(el.id, { ...el });
                                }}
                              >
                                {eternalCollectReward &&
                                eternalCollectReward.id === el.id &&
                                eternalCollectReward.state !== 'done' ? (
                                  <div className={'f f-jc f-ac cg-05'}>
                                    <Loader
                                      size={'18px'}
                                      stroke={'var(--white)'}
                                    />
                                    Collecting
                                  </div>
                                ) : (
                                  <span>Collect rewards</span>
                                )}
                              </button>
                              <button
                                className={
                                  'btn primary w-100 b br-8 ml-1 mxs_ml-0 mxs_mt-1 pv-075'
                                }
                                disabled={
                                  gettingReward.id === el.id &&
                                  gettingReward.farmingType ===
                                    FarmingType.ETERNAL &&
                                  gettingReward.state !== 'done'
                                }
                                onClick={() => {
                                  setGettingReward({
                                    id: el.id,
                                    state: 'pending',
                                    farmingType: FarmingType.ETERNAL,
                                  });
                                  claimRewardsHandler(
                                    el.id,
                                    { ...el },
                                    FarmingType.ETERNAL,
                                  );
                                }}
                              >
                                {gettingReward &&
                                gettingReward.id === el.id &&
                                gettingReward.farmingType ===
                                  FarmingType.ETERNAL &&
                                gettingReward.state !== 'done' ? (
                                  <div className={'f f-jc f-ac cg-05'}>
                                    <Loader
                                      size={'18px'}
                                      stroke={'var(--white)'}
                                    />
                                    Undepositing
                                  </div>
                                ) : (
                                  <span>Undeposit</span>
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div
                            className={
                              'my-farms__position-card__empty f c f-ac f-jc'
                            }
                          >
                            {el.eternalAvailable ? (
                              <CheckOut link={'infinite-farms'} />
                            ) : (
                              <div>No infinite farms for now</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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
