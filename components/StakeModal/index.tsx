import React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle, Frown, X } from 'react-feather';
import { useFarmingSubgraph } from '../../hooks/useIncentiveSubgraph';
import { useFarmingHandlers } from '../../hooks/useStakerHandlers';
import { useChunkedRows } from '../../utils/chunkForRows';
import Loader from '../Loader';
import { FarmingType } from '../../models/enums';
import { NTFInterface } from '../../models/interfaces';
import { NavLink } from 'react-router-dom';
import './index.scss';
import FarmModalFarmingTiers from 'components/StakeModalFarmingTiers';
import { IsActive } from 'components/StakerMyStakes/IsActive';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { CurrencyAmount } from '@uniswap/sdk-core';
import { FARMING_CENTER } from 'constants/v3/addresses';
import { useActiveWeb3React } from 'hooks';

import { Token } from '@uniswap/sdk-core';
import { formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { ChainId } from '@uniswap/sdk';
import { Box, Button } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Check } from '@material-ui/icons';
import { useV3StakeData } from 'state/farms/hooks';
import { useTranslation } from 'react-i18next';

interface FarmModalProps {
  event: {
    pool: any;
    startTime: string;
    endTime: string;
    id: string;
    rewardToken: any;
    bonusRewardToken: any;
    tier1Multiplier: string;
    tier2Multiplier: string;
    tier3Multiplier: string;
    tokenAmountForTier1: string;
    tokenAmountForTier2: string;
    tokenAmountForTier3: string;
    multiplierToken: any;
    minRangeLength: string;
  };
  closeHandler: () => void;
  farmingType: FarmingType;
}

export function FarmModal({
  event: {
    pool,
    startTime,
    endTime,
    rewardToken,
    bonusRewardToken,
    tier1Multiplier,
    tier2Multiplier,
    tier3Multiplier,
    multiplierToken,
    tokenAmountForTier1,
    tokenAmountForTier2,
    tokenAmountForTier3,
    minRangeLength,
  },
  closeHandler,
  farmingType,
}: FarmModalProps) {
  const { account } = useActiveWeb3React();
  const { t } = useTranslation();

  const isTierFarming = useMemo(
    () =>
      Boolean(
        (+tier1Multiplier || +tier2Multiplier || +tier3Multiplier) &&
          (+tokenAmountForTier1 ||
            +tokenAmountForTier2 ||
            +tokenAmountForTier3),
      ),
    [
      tier1Multiplier,
      tier2Multiplier,
      tier3Multiplier,
      tokenAmountForTier1,
      tokenAmountForTier2,
      tokenAmountForTier3,
    ],
  );

  const [selectedNFT, setSelectedNFT] = useState<null | NTFInterface>(null);
  const {
    fetchPositionsForPool: {
      positionsForPool,
      positionsForPoolLoading,
      fetchPositionsForPoolFn,
    },
  } = useFarmingSubgraph() || {};

  const { v3Stake } = useV3StakeData();
  const { txType, selectedTokenId, txConfirmed, txHash, txError } =
    v3Stake ?? {};

  const { approveHandler, farmHandler } = useFarmingHandlers() || {};

  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  useEffect(() => {
    fetchPositionsForPoolFn(pool, minRangeLength);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (txType === 'farm' && txConfirmed) {
      fetchPositionsForPoolFn(pool, minRangeLength);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txType, txConfirmed]);

  const positionsForStake = useMemo(() => {
    if (!positionsForPool) return [];

    return positionsForPool.filter((position) => {
      if (position.pool !== pool.id) return;

      if (farmingType === FarmingType.ETERNAL && position.eternalFarming)
        return;

      if (farmingType === FarmingType.LIMIT && position.limitFarming) return;

      return true;
    });
  }, [farmingType, pool.id, positionsForPool]);
  const [chunkedPositions, setChunkedPositions] = useState<
    any[][] | null | undefined
  >(null);

  const _chunked = useChunkedRows(positionsForStake, 1000);

  const [submitState, setSubmitState] = useState(0);
  const [submitLoader, setSubmitLoader] = useState(false);

  useEffect(() => setChunkedPositions(_chunked), [_chunked]);

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
    [filterNFTs],
  );

  const NFTsForStake = useMemo(
    () => filterNFTs((v: NTFInterface) => v.onFarmingCenter),
    [filterNFTs],
  );

  useEffect(() => {
    if (!chunkedPositions || submitState !== (txType === 'farmApprove' ? 0 : 2))
      return;
    if (txError) {
      setSubmitLoader(false);
    } else if (txHash && txConfirmed && selectedTokenId) {
      const _newChunked: any = [];

      if (chunkedPositions) {
        for (const row of chunkedPositions) {
          const _newRow: any = [];

          for (const position of row) {
            if (position.id === selectedTokenId) {
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
      setSubmitLoader(false);
      if (txType === 'farmApprove') {
        setSubmitState(1);
      } else if (txType === 'farm') {
        setSubmitState(3);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chunkedPositions?.length,
    selectedTokenId,
    submitState,
    txConfirmed,
    txError,
    txHash,
    txType,
  ]);

  const approveNFTs = useCallback(() => {
    setSubmitLoader(true);
    setSubmitState(0);
    approveHandler(selectedNFT);
  }, [approveHandler, selectedNFT]);

  const farmNFTs = useCallback(
    (eventType: FarmingType) => {
      setSubmitLoader(true);
      setSubmitState(2);
      farmHandler(
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
    [
      farmHandler,
      selectedNFT,
      pool.id,
      rewardToken.id,
      bonusRewardToken.id,
      startTime,
      endTime,
      selectedTier,
    ],
  );

  const balance = useCurrencyBalance(
    account ?? undefined,
    multiplierToken
      ? new Token(
          ChainId.MATIC,
          multiplierToken.id,
          +multiplierToken.decimals,
          multiplierToken.symbol,
          multiplierToken.name,
        )
      : undefined,
  );

  const isEnoughTokenForLock = useMemo(() => {
    if (!balance) return false;

    const _balance = +balance.toSignificant(4);

    switch (selectedTier) {
      case tokenAmountForTier1:
        return (
          +_balance >=
          +formatUnits(
            BigNumber.from(tokenAmountForTier1),
            multiplierToken.decimals,
          )
        );
      case tokenAmountForTier2:
        return (
          +_balance >=
          +formatUnits(
            BigNumber.from(tokenAmountForTier2),
            multiplierToken.decimals,
          )
        );
      case tokenAmountForTier3:
        return (
          +_balance >=
          +formatUnits(
            BigNumber.from(tokenAmountForTier3),
            multiplierToken.decimals,
          )
        );
      default:
        return true;
    }
  }, [
    balance,
    multiplierToken.decimals,
    selectedTier,
    tokenAmountForTier1,
    tokenAmountForTier2,
    tokenAmountForTier3,
  ]);

  const tierSelectionHandler = useCallback(
    (tier) => {
      switch (tier) {
        case 0:
          setSelectedTier(null);
          break;
        case 1:
          setSelectedTier(tokenAmountForTier1);
          break;
        case 2:
          setSelectedTier(tokenAmountForTier2);
          break;
        case 3:
          setSelectedTier(tokenAmountForTier3);
          break;
        case '':
          setSelectedTier('');
      }

      if (!isEnoughTokenForLock || tier === '') setSelectedNFT(null);
    },
    [
      isEnoughTokenForLock,
      tokenAmountForTier1,
      tokenAmountForTier2,
      tokenAmountForTier3,
    ],
  );

  const _amountForApprove = useMemo(() => {
    if (!selectedTier || !multiplierToken) return undefined;

    return CurrencyAmount.fromRawAmount(
      new Token(
        ChainId.MATIC,
        multiplierToken.id,
        +multiplierToken.decimals,
        multiplierToken.symbol,
        multiplierToken.name,
      ),
      selectedTier,
    );
  }, [selectedTier, multiplierToken]);

  const [approval, approveCallback] = useApproveCallback(
    _amountForApprove,
    FARMING_CENTER[ChainId.MATIC],
  );

  const showApproval =
    approval !== ApprovalState.APPROVED && !!_amountForApprove;

  const linkToProviding = `/add/${pool.token0.id}/${pool.token1.id}/v3`;

  return (
    <Box padding='20px 16px'>
      {submitState === 3 ? (
        <Box width='100%'>
          <button onClick={closeHandler}>
            <X size={18} stroke={'white'} />
          </button>
          <Box className='flex'>
            <CheckCircle size={55} stroke={'var(--green)'} />
            <p>
              {t('positionDepositedSuccessfully', { nftID: selectedNFT?.id })}!
            </p>
          </Box>
        </Box>
      ) : positionsForPoolLoading ? (
        <Box
          className='flex justify-center items-center'
          width='100%'
          height='400px'
        >
          <Loader size={'25px'} />
        </Box>
      ) : (
        <div className='v3-farm-stake-modal-wrapper'>
          <Box mb={1} className='flex justify-between'>
            <h6 className='weight-600'>{t('selectNFTFarm')}</h6>
            <Box className='cursor-pointer' onClick={closeHandler}>
              <X size={18} />
            </Box>
          </Box>
          {isTierFarming && chunkedPositions && chunkedPositions.length !== 0 && (
            <FarmModalFarmingTiers
              tiersLimits={{
                low: tokenAmountForTier1,
                medium: tokenAmountForTier2,
                high: tokenAmountForTier3,
              }}
              tiersMultipliers={{
                low: tier1Multiplier,
                medium: tier2Multiplier,
                high: tier3Multiplier,
              }}
              multiplierToken={multiplierToken}
              selectTier={tierSelectionHandler}
            />
          )}
          {isTierFarming && chunkedPositions && chunkedPositions.length !== 0 && (
            <Box width='100%'>
              <b style={{ fontSize: '18px' }}>{`2. ${t('selectPosition')}`}</b>
            </Box>
          )}
          <Box mt={2}>
            {chunkedPositions && chunkedPositions.length === 0 ? (
              <Box textAlign='center'>
                <Frown size={32} />
                <Box mt={2} mb={1}>
                  <p>{t('noNFTForPool')}</p>
                </Box>
                <p>{t('takePartinFarmNeedTo')}</p>
                <Box mt={1} className='flex justify-center items-center'>
                  <NavLink
                    className='v3-stake-liquidity-link'
                    to={linkToProviding}
                  >
                    <small>{`${t('provideLiquidity')} ${pool.token0.symbol} / ${
                      pool.token1.symbol
                    }`}</small>
                    <ArrowRight size={16} />
                  </NavLink>
                </Box>
              </Box>
            ) : chunkedPositions && chunkedPositions.length !== 0 ? (
              chunkedPositions.map((row, i, arr) => (
                <Box
                  style={{
                    opacity:
                      !isEnoughTokenForLock && selectedTier ? '0.5' : '1',
                  }}
                  className='flex flex-wrap'
                  key={i}
                >
                  {row.map((el, j) => (
                    <Box
                      className={`v3-farm-stake-modal-position${
                        selectedNFT?.id === el.id
                          ? ' v3-farm-stake-modal-position-selected'
                          : ''
                      }`}
                      key={j}
                      onClick={(e: any) => {
                        if (!isEnoughTokenForLock && selectedTier) return;
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
                      <Box className='flex items-center'>
                        <Box className='v3-tokenId-wrapper' mr={2}>
                          <span>{el.id}</span>
                        </Box>
                        <Box className='flex-col' ml={0.5}>
                          <Box mb='4px'>
                            <IsActive el={el} />
                          </Box>

                          <a
                            href={`/#/pool/${+el.id}?onFarming=true`}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            <small>{t('viewPosition')}</small>
                          </a>
                        </Box>
                      </Box>
                      <Box
                        className={`v3-farm-stake-position-check ${
                          selectedNFT?.id === el.id
                            ? 'v3-farm-stake-position-checked'
                            : 'v3-farm-stake-position-unchecked'
                        }`}
                      >
                        {selectedNFT?.id === el.id && <Check />}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))
            ) : (
              <Box className='flex'>
                {[0, 1, 2].map((el, i) => (
                  <Box
                    padding='8px'
                    borderRadius={12}
                    mr={1}
                    position='relative'
                    className='flex items-center border'
                    key={i}
                  >
                    <Skeleton variant='circle' width='40px' height='40px' />
                    <Box ml={1}>
                      <Skeleton width={50} height={16} />
                      <Skeleton width={60} height={20} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          {selectedTier === '' &&
          chunkedPositions &&
          chunkedPositions.length !== 0 ? (
            <Button disabled>{t('selectTier')}</Button>
          ) : selectedTier &&
            !isEnoughTokenForLock &&
            chunkedPositions &&
            chunkedPositions.length !== 0 ? (
            <Button disabled>{`${t('notEnough')} ${
              multiplierToken.symbol
            }`}</Button>
          ) : selectedNFT ? (
            <Box className='flex justify-between'>
              {selectedTier && (
                <Box width='32%'>
                  <Button
                    disabled={!showApproval || !selectedTier}
                    onClick={approveCallback}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <Box className='flex items-center'>
                        <Loader stroke={'white'} />
                        <div>{t('approving')}</div>
                      </Box>
                    ) : !showApproval ? (
                      `${multiplierToken.symbol} ${t('approved')}`
                    ) : (
                      `${t('approve')} ${multiplierToken.symbol}`
                    )}
                  </Button>
                </Box>
              )}
              <Box width={selectedTier ? '32%' : '49%'}>
                <Button
                  disabled={submitLoader || !NFTsForApprove}
                  onClick={approveNFTs}
                >
                  {submitLoader && submitState === 0 ? (
                    <Box className='flex items-center'>
                      <Loader stroke={'white'} />
                      <div>{t('approving')}</div>
                    </Box>
                  ) : NFTsForStake && !NFTsForApprove ? (
                    t('positionApproved')
                  ) : (
                    t('approvePosition')
                  )}
                </Button>
              </Box>
              <Box width={selectedTier ? '32%' : '49%'}>
                <Button
                  disabled={submitLoader || !NFTsForStake}
                  onClick={() => farmNFTs(farmingType)}
                >
                  {submitLoader && submitState === 2 ? (
                    <Box className='flex items-center'>
                      <Loader stroke={'white'} />
                      <div>{t('depositing')}</div>
                    </Box>
                  ) : (
                    t('deposit')
                  )}
                </Button>
              </Box>
            </Box>
          ) : chunkedPositions && chunkedPositions.length !== 0 ? (
            <Button disabled>{t('selectPosition')}</Button>
          ) : null}
        </div>
      )}
    </Box>
  );
}
