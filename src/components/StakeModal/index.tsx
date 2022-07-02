import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, CheckCircle, Frown, X } from 'react-feather';
import { useIncentiveSubgraph } from '../../hooks/useIncentiveSubgraph';
import { useStakerHandlers } from '../../hooks/useStakerHandlers';
import { useAllTransactions } from '../../state/transactions/hooks';
import { useChunkedRows } from '../../utils/chunkForRows';
import Loader from '../Loader';
import { FarmingType } from '../../models/enums';
import {
  NFTPosition,
  NFTPositionDescription,
  NFTPositionIcon,
  NFTPositionIndex,
  NFTPositionLink,
  NFTPositionSelectCircle,
  NFTPositionsRow,
} from './styled';
import { useSortedRecentTransactions } from '../../hooks/useSortedRecentTransactions';
import { NTFInterface } from '../../models/interfaces';
import { NavLink } from 'react-router-dom';
import './index.scss';
import StakeModalFarmingTiers from 'components/StakeModalFarmingTiers';
import { IsActive } from 'components/StakerMyStakes/IsActive';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { CurrencyAmount } from '@uniswap/sdk-core';
import { FARMING_CENTER } from 'constants/addresses';
import { useActiveWeb3React } from 'hooks';

import { Token } from '@uniswap/sdk-core';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { ChainId } from '@uniswap/sdk';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';

interface StakeModalProps {
  event: {
    pool: any;
    startTime: string;
    endTime: string;
    id: string;
    rewardToken: any;
    bonusRewardToken: any;
    level1multiplier: string;
    level2multiplier: string;
    level3multiplier: string;
    algbAmountForLevel1: string;
    algbAmountForLevel2: string;
    algbAmountForLevel3: string;
    lockedToken: any;
  };
  closeHandler: () => void;
  farmingType: FarmingType;
}

export function StakeModal({
  event: {
    pool,
    startTime,
    endTime,
    rewardToken,
    bonusRewardToken,
    level1multiplier,
    level2multiplier,
    level3multiplier,
    lockedToken,
    algbAmountForLevel1,
    algbAmountForLevel2,
    algbAmountForLevel3,
  },
  closeHandler,
  farmingType,
}: StakeModalProps) {
  const { account } = useActiveWeb3React();

  const [selectedNFT, setSelectedNFT] = useState<null | NTFInterface>(null);
  const {
    fetchPositionsForPool: {
      positionsForPool,
      positionsForPoolLoading,
      fetchPositionsForPoolFn,
    },
  } = useIncentiveSubgraph() || {};

  const { approveHandler, approvedHash, stakeHandler, stakedHash } =
    useStakerHandlers() || {};

  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    fetchPositionsForPoolFn(pool);
  }, []);

  const positionsForStake = useMemo(() => {
    if (!positionsForPool) return [];

    return positionsForPool.filter((position) => {
      if (position.pool !== pool.id) return;

      if (farmingType === FarmingType.ETERNAL && position.eternalFarming)
        return;

      if (farmingType === FarmingType.FINITE && position.incentive) return;

      return true;
    });
  }, [positionsForPool]);
  const [chunkedPositions, setChunkedPositions] = useState<
    any[][] | null | undefined
  >(null);

  //TODO
  const _chunked = useChunkedRows(positionsForStake, 1000);

  const [submitState, setSubmitState] = useState(0);
  const [submitLoader, setSubmitLoader] = useState(false);

  useEffect(() => setChunkedPositions(_chunked), [_chunked]);

  const allTransactions = useAllTransactions();

  const sortedRecentTransactions = useSortedRecentTransactions();

  const confirmed = useMemo(
    () =>
      sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash),
    [sortedRecentTransactions, allTransactions],
  );

  const filterNFTs = useCallback(
    (fn) => {
      if (!selectedNFT) return;

      const _filtered = [selectedNFT].filter(fn);

      return _filtered.length > 0 ? _filtered[0] : null;
    },
    [selectedNFT],
  );

  const NFTsForApprove = useMemo(
    () => filterNFTs((v: NTFInterface) => !v.onFarmingCenter),
    [selectedNFT, submitState],
  );

  const NFTsForStake = useMemo(
    () => filterNFTs((v: NTFInterface) => v.onFarmingCenter),
    [selectedNFT, submitState],
  );

  useEffect(() => {
    if (!approvedHash || (approvedHash && submitState !== 0)) return;

    if (typeof approvedHash === 'string') {
      setSubmitLoader(false);
    } else if (approvedHash.hash && confirmed.includes(approvedHash.hash)) {
      const _newChunked: any[] = [];

      if (chunkedPositions) {
        for (const row of chunkedPositions) {
          const _newRow: any[] = [];

          for (const position of row) {
            if (position.id === approvedHash.id) {
              position.onFarmingCenter = true;
              setSelectedNFT((old) => ({
                ...old,
                onFarmingCenter: true,
              }));
            }
            _newRow.push(position);
          }
          _newChunked.push(_newRow);
        }
      }

      setChunkedPositions(_newChunked);
      setSubmitState(1);
      setSubmitLoader(false);
    }
  }, [approvedHash, confirmed]);

  useEffect(() => {
    if (!stakedHash || (stakedHash && submitState !== 2)) return;

    if (typeof stakedHash === 'string') {
      setSubmitLoader(false);
    } else if (stakedHash.hash && confirmed.includes(stakedHash.hash)) {
      const _newChunked: any[] = [];

      if (chunkedPositions) {
        for (const row of chunkedPositions) {
          const _newRow: any[] = [];

          for (const position of row) {
            if (position.id === stakedHash.id) {
              position.onFarmingCenter = true;
              setSelectedNFT((old) => ({
                ...old,
                onFarmingCenter: true,
              }));
            }
            _newRow.push(position);
          }
          _newChunked.push(_newRow);
        }
      }
      setChunkedPositions(_newChunked);
      setSubmitState(3);
      setSubmitLoader(false);
    }
  }, [stakedHash, confirmed]);

  const approveNFTs = useCallback(() => {
    setSubmitLoader(true);
    setSubmitState(0);
    approveHandler(selectedNFT);
  }, [selectedNFT, submitState]);

  const stakeNFTs = useCallback(
    (eventType: FarmingType) => {
      setSubmitLoader(true);
      setSubmitState(2);
      stakeHandler(
        selectedNFT,
        {
          pool: pool.id,
          rewardToken: rewardToken.id,
          bonusRewardToken: bonusRewardToken.id,
          startTime,
          endTime,
        },
        eventType,
        selectedTier || 0,
      );
    },
    [selectedNFT, submitState, selectedTier],
  );

  const balance = useCurrencyBalance(
    account ?? undefined,
    lockedToken
      ? new Token(
          ChainId.MATIC,
          lockedToken.id,
          +lockedToken.decimals,
          lockedToken.symbol,
          lockedToken.name,
        )
      : undefined,
  );

  const isEnoughALGB = useMemo(() => {
    if (farmingType === FarmingType.ETERNAL) return true;

    if (!balance) return false;

    const _balance = +balance.toSignificant(4);

    switch (selectedTier) {
      case algbAmountForLevel1:
        return (
          +_balance >=
          +formatUnits(
            BigNumber.from(algbAmountForLevel1),
            lockedToken.decimals,
          )
        );
      case algbAmountForLevel2:
        return (
          +_balance >=
          +formatUnits(
            BigNumber.from(algbAmountForLevel2),
            lockedToken.decimals,
          )
        );
      case algbAmountForLevel3:
        return (
          +_balance >=
          +formatUnits(
            BigNumber.from(algbAmountForLevel3),
            lockedToken.decimals,
          )
        );
      default:
        return true;
    }
  }, [
    balance,
    selectedTier,
    algbAmountForLevel1,
    algbAmountForLevel2,
    algbAmountForLevel3,
  ]);

  const tierSelectionHandler = useCallback(
    (tier) => {
      switch (tier) {
        case 0:
          setSelectedTier(null);
          break;
        case 1:
          setSelectedTier(algbAmountForLevel1);
          break;
        case 2:
          setSelectedTier(algbAmountForLevel2);
          break;
        case 3:
          setSelectedTier(algbAmountForLevel3);
          break;
        case '':
          setSelectedTier('');
      }

      if (!isEnoughALGB || tier === '') setSelectedNFT(null);
    },
    [isEnoughALGB, selectedTier],
  );

  const _amountForApprove = useMemo(() => {
    if (!selectedTier || !lockedToken) return undefined;

    return CurrencyAmount.fromRawAmount(
      new Token(
        ChainId.MATIC,
        lockedToken.id,
        +lockedToken.decimals,
        lockedToken.symbol,
        lockedToken.name,
      ),
      selectedTier,
    );
  }, [selectedTier, lockedToken]);

  const [approval, approveCallback] = useApproveCallback(
    _amountForApprove,
    FARMING_CENTER[ChainId.MATIC],
  );

  const showApproval =
    approval !== ApprovalState.APPROVED && !!_amountForApprove;

  const linkToProviding = `/add/${pool.token0.id}/${pool.token1.id}`;

  return (
    <>
      {submitState === 3 ? (
        <div className={'w-100 p-1 c-w cur-d'}>
          <div className={'f f-je mb-1 w-100'}>
            <button className={'bg-t br-0'} onClick={closeHandler}>
              <X size={18} stroke={'var(--white)'} />
            </button>
          </div>
          <div className={'h-400 f c f-ac f-jc'}>
            <CheckCircle size={55} stroke={'var(--green)'} />
            <p
              className={'mt-05'}
            >{`Position #${selectedNFT?.id} deposited successfully!`}</p>
          </div>
        </div>
      ) : positionsForPoolLoading ? (
        <div className={'w-100 p-1 c-w h-400 f c f-ac f-jc cur-p'}>
          <Loader stroke={'var(--white)'} size={'25px'} />
        </div>
      ) : (
        <div className={'w-100 c-w'}>
          <div className={'mb-1 flex-s-between'}>
            <div>Select NFT for farming</div>
            <button className={'bg-t br-0'} onClick={closeHandler}>
              <X size={18} stroke={'var(--white)'} />
            </button>
          </div>
          {farmingType === FarmingType.FINITE &&
            chunkedPositions &&
            chunkedPositions.length !== 0 && (
              <StakeModalFarmingTiers
                tiersLimits={{
                  low: algbAmountForLevel1,
                  medium: algbAmountForLevel2,
                  high: algbAmountForLevel3,
                }}
                tiersMultipliers={{
                  low: level1multiplier,
                  medium: level2multiplier,
                  high: level3multiplier,
                }}
                lockedToken={lockedToken}
                selectTier={tierSelectionHandler}
              />
            )}
          {farmingType === FarmingType.FINITE &&
            chunkedPositions &&
            chunkedPositions.length !== 0 && (
              <div className='mv-1 f w-100'>
                <span className='b' style={{ fontSize: '18px' }}>{`${
                  farmingType === FarmingType.FINITE ? '2. ' : ''
                }Select a Position`}</span>
              </div>
            )}
          <div
            style={{
              height: farmingType === FarmingType.ETERNAL ? '400px' : 'unset',
              marginLeft: '-1rem',
              position: 'relative',
              marginRight: '-1rem',
            }}
            className='mb-1 pl-1 pr-1'
          >
            {chunkedPositions && chunkedPositions.length === 0 ? (
              <div className={'h-400 f c f-ac f-jc'}>
                <Frown size={30} stroke={'var(--white)'} />
                <p className={'mt-1 mb-05'}>No NFT-s for this pool</p>
                <p>To take part in this farming event, you need to</p>
                <NavLink
                  className={
                    'flex-s-between c-w ph-1 pv-05 bg-p br-8 mt-1 hover-c-ph'
                  }
                  to={linkToProviding}
                >
                  <span>{`Provide liquidity for ${pool.token0.symbol} / ${pool.token1.symbol}`}</span>
                  <ArrowRight className={'ml-05'} size={16} />
                </NavLink>
              </div>
            ) : chunkedPositions && chunkedPositions.length !== 0 ? (
              chunkedPositions.map((row, i, arr) => (
                <div
                  style={{
                    opacity: !isEnoughALGB && selectedTier ? '0.5' : '1',
                  }}
                  className='f mb-1 pl-1 pb-1 pr-1 mxs_pb-0 stake-modal__nft-position-row'
                  key={i}
                >
                  {row.map((el, j) => (
                    <div
                      className={'stake-modal__nft-position p-1 br-8 c-w'}
                      key={j}
                      data-selected={!!selectedNFT && selectedNFT.id === el.id}
                      onClick={(e: any) => {
                        if (!isEnoughALGB && selectedTier) return;
                        if (e.target.tagName !== 'A' && !submitLoader) {
                          setSelectedNFT((old) =>
                            old && old.id === el.id
                              ? null
                              : {
                                  onFarmingCenter: el.onFarmingCenter,
                                  id: el.id,
                                },
                          );
                        }
                      }}
                    >
                      <NFTPositionIcon name={el.id}>{el.id}</NFTPositionIcon>
                      <div className='ml-1'>
                        <IsActive el={el} />
                        <div
                          className={'stake-modal__nft-position__description'}
                        >
                          <a
                            className={'fs-085 c-w hover-cp'}
                            href={`https://app.algebra.finance/#/pool/${+el.id}`}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            View position
                          </a>
                        </div>
                      </div>
                      {/* <div className={"stake-modal__nft-position__circle f f-ac f-jc"} data-selected={!!selectedNFT && selectedNFT.id === el.id}>
                                                <Check data-selected={!!selectedNFT && selectedNFT.id === el.id} size={"1rem"} stroke={"white"} />
                                            </div> */}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <NFTPositionsRow>
                {[0, 1, 2].map((el, i) => (
                  <NFTPosition key={i} skeleton>
                    <NFTPositionIcon skeleton />
                    <NFTPositionDescription skeleton>
                      <NFTPositionIndex skeleton />
                      <NFTPositionLink skeleton />
                    </NFTPositionDescription>
                    <NFTPositionSelectCircle />
                  </NFTPosition>
                ))}
              </NFTPositionsRow>
            )}
          </div>
          {selectedTier === '' &&
          farmingType === FarmingType.FINITE &&
          chunkedPositions &&
          chunkedPositions.length !== 0 ? (
            <button
              disabled
              id={'farming-select-tier'}
              className={'btn primary w-100 p-1 farming-select-tier'}
            >
              Select Tier
            </button>
          ) : selectedTier &&
            !isEnoughALGB &&
            farmingType === FarmingType.FINITE &&
            chunkedPositions &&
            chunkedPositions.length !== 0 ? (
            <button
              disabled
              className='btn primary w-100 p-1'
            >{`Not enough ${lockedToken.symbol}`}</button>
          ) : selectedNFT ? (
            <div className={'f mxs_fd-c w-100'}>
              {farmingType === FarmingType.FINITE && selectedTier && (
                <button
                  disabled={!showApproval || !selectedTier}
                  onClick={approveCallback}
                  id={'farming-approve-algb'}
                  className={
                    'btn primary w-100 mr-1 mxs_mr-0 p-1 mxs_mb-1 farming-approve-algb'
                  }
                >
                  {approval === ApprovalState.PENDING ? (
                    <span className={'f f-ac f-jc'}>
                      <Loader stroke={'white'} />
                      <span className={'ml-05'}>Approving</span>
                    </span>
                  ) : !showApproval ? (
                    `${lockedToken.symbol} Approved`
                  ) : (
                    `Approve ${lockedToken.symbol}`
                  )}
                </button>
              )}
              <button
                disabled={submitLoader || !NFTsForApprove}
                onClick={approveNFTs}
                id={'farming-approve-nft'}
                className={
                  'btn primary w-100 mr-1 mxs_mr-0 mxs_mb-1 p-1 farming-approve-nft'
                }
              >
                {submitLoader && submitState === 0 ? (
                  <span className={'f f-ac f-jc'}>
                    <Loader stroke={'white'} />
                    <span className={'ml-05'}>Approving</span>
                  </span>
                ) : NFTsForStake && !NFTsForApprove ? (
                  `Position Approved`
                ) : (
                  `Approve Position`
                )}
              </button>
              <button
                disabled={submitLoader || !NFTsForStake}
                onClick={() => stakeNFTs(farmingType)}
                id={'farming-deposit-nft'}
                className={'btn primary w-100 mxs_mb-1 p-1 farming-deposit-nft'}
              >
                {submitLoader && submitState === 2 ? (
                  <span className={'f f-ac f-jc'}>
                    <Loader stroke={'white'} />
                    <span className={'ml-05'}>Depositing</span>
                  </span>
                ) : (
                  `Deposit`
                )}
              </button>
            </div>
          ) : chunkedPositions && chunkedPositions.length !== 0 ? (
            <button
              disabled
              id={'farming-select-nft'}
              className={'btn primary w-100 p-1 farming-select-nft'}
            >
              Select Position
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}
