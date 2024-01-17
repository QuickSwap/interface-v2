import React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { X } from 'react-feather';
import { useFarmPositionsForPool } from 'hooks/useIncentiveSubgraph';
import { useFarmingHandlers } from 'hooks/useStakerHandlers';
import { useChunkedRows } from 'utils/chunkForRows';
import { FarmingType } from 'models/enums';
import styles from 'styles/components/StakeModal.module.scss';
import FarmModalFarmingTiers from 'components/StakeModalFarmingTiers';
import { IsActive } from 'components/StakerMyStakes/IsActive';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useV3ApproveCallback';
import { CurrencyAmount } from '@uniswap/sdk-core';
import { FARMING_CENTER } from 'constants/v3/addresses';
import { useActiveWeb3React } from 'hooks';
import { formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { ChainId } from '@uniswap/sdk';
import { Box, Button, CircularProgress } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { Check } from '@mui/icons-material';
import { useV3StakeData } from 'state/farms/hooks';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

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
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const { t } = useTranslation();
  const router = useRouter();

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

  const [selectedNFT, setSelectedNFT] = useState('');
  const {
    data: positionsForPool,
    isLoading: positionsForPoolLoading,
  } = useFarmPositionsForPool(pool, minRangeLength);

  const { v3Stake } = useV3StakeData();
  const { txType, selectedTokenId, txConfirmed, txHash, txError } =
    v3Stake ?? {};

  const { approveHandler, farmHandler } = useFarmingHandlers() || {};

  const [selectedTier, setSelectedTier] = useState<string | null>(null);

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

  const _chunked = useChunkedRows(positionsForStake, 1000);

  const [submitState, setSubmitState] = useState(0);
  const [submitLoader, setSubmitLoader] = useState(false);

  const chunkedPositions = useMemo(() => {
    if (
      submitState === (txType === 'farmApprove' ? 0 : 2) &&
      !txError &&
      txHash &&
      txConfirmed &&
      selectedTokenId
    ) {
      const _newChunked: any[][] = [];

      if (_chunked) {
        for (const row of _chunked) {
          const _newRow: any[] = [];

          for (const position of row) {
            if (position.id === selectedTokenId) {
              position.onFarmingCenter = true;
            }
            _newRow.push(position);
          }
          _newChunked.push(_newRow);
        }
      }

      return _newChunked;
    }
    return _chunked;
  }, [
    _chunked,
    selectedTokenId,
    submitState,
    txConfirmed,
    txError,
    txHash,
    txType,
  ]);

  const nftApproved = useMemo(() => {
    if (!selectedNFT) return false;

    const selectedPosition = positionsForStake?.find(
      (position) => position.id.toLowerCase() === selectedNFT.toLowerCase(),
    );

    return selectedPosition ? selectedPosition.onFarmingCenter : false;
  }, [positionsForStake, selectedNFT]);

  useEffect(() => {
    if (submitState !== (txType === 'farmApprove' ? 0 : 2)) return;
    if (txError) {
      setSubmitLoader(false);
    } else if (txHash && txConfirmed && selectedTokenId) {
      setSubmitLoader(false);
      if (txType === 'farmApprove') {
        setSubmitState(1);
      } else if (txType === 'farm') {
        setSubmitState(3);
      }
    }
  }, [selectedTokenId, submitState, txConfirmed, txError, txHash, txType]);

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
          pool: pool?.id,
          rewardToken: rewardToken?.address,
          bonusRewardToken: bonusRewardToken?.address,
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
      pool,
      rewardToken,
      bonusRewardToken,
      startTime,
      endTime,
      selectedTier,
    ],
  );

  const balance = useCurrencyBalance(account ?? undefined, multiplierToken);

  const isEnoughTokenForLock = useMemo(() => {
    if (!balance) return false;

    const _balance = +balance.toSignificant(4);

    switch (selectedTier) {
      case tokenAmountForTier1:
        return (
          +_balance >=
          +formatUnits(
            BigNumber.from(tokenAmountForTier1),
            multiplierToken?.decimals,
          )
        );
      case tokenAmountForTier2:
        return (
          +_balance >=
          +formatUnits(
            BigNumber.from(tokenAmountForTier2),
            multiplierToken?.decimals,
          )
        );
      case tokenAmountForTier3:
        return (
          +_balance >=
          +formatUnits(
            BigNumber.from(tokenAmountForTier3),
            multiplierToken?.decimals,
          )
        );
      default:
        return true;
    }
  }, [
    balance,
    multiplierToken?.decimals,
    selectedTier,
    tokenAmountForTier1,
    tokenAmountForTier2,
    tokenAmountForTier3,
  ]);

  const tierSelectionHandler = useCallback(
    (tier: any) => {
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

      if (!isEnoughTokenForLock || tier === '') setSelectedNFT('');
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

    return CurrencyAmount.fromRawAmount(multiplierToken, selectedTier);
  }, [selectedTier, multiplierToken]);

  const [approval, approveCallback] = useApproveCallback(
    _amountForApprove,
    FARMING_CENTER[chainIdToUse],
  );

  const showApproval =
    approval !== ApprovalState.APPROVED && !!_amountForApprove;

  const linkToProviding = `/add/${pool.token0.id ?? pool.token0.address}/${pool
    .token1.id ?? pool.token1.address}/v3`;

  return (
    <Box padding='20px 16px'>
      {submitState === 3 ? (
        <Box width='100%'>
          <Box className='flex justify-end'>
            <Box className='cursor-pointer' onClick={closeHandler}>
              <X size={18} stroke={'white'} />
            </Box>
          </Box>
          <Box className='flex flex-col items-center'>
            <picture>
              <img
                src='/assets/images/TransactionSubmitted.png'
                alt='Deposited Successfully'
              />
            </picture>
            <Box mt={3}>
              <p>
                {t('positionDepositedSuccessfully', { nftID: selectedNFT })}!
              </p>
            </Box>
          </Box>
        </Box>
      ) : positionsForPoolLoading ? (
        <Box
          className='flex items-center justify-center'
          width='100%'
          height='400px'
        >
          <CircularProgress size={'25px'} />
        </Box>
      ) : (
        <div className={styles.v3FarmStakeModalWrapper}>
          <Box mb={1} className='flex justify-between'>
            <h6 className='weight-600'>{t('selectPosition')}</h6>
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
          <Box mt={3}>
            {chunkedPositions && chunkedPositions.length === 0 ? (
              <Box textAlign='center'>
                <picture>
                  <img
                    src='/assets/images/TransactionFailed.png'
                    alt='No NFT'
                  />
                </picture>
                <Box mt={3} mb={1.5}>
                  <p>
                    {t('noNFTFound', {
                      symbol: `${pool.token0.symbol}/${pool.token1.symbol}`,
                    })}
                  </p>
                </Box>
                <p className='text-secondary'>{t('takePartinFarmNeedTo')}</p>
                <Box mt={4} className='flex items-center justify-center'>
                  <Button onClick={() => router.push(linkToProviding)}>
                    {t('addLiquidity')}
                  </Button>
                </Box>
              </Box>
            ) : chunkedPositions && chunkedPositions.length !== 0 ? (
              chunkedPositions.map((row, i) => (
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
                      className={`${styles.v3FarmStakeModalPosition} ${
                        selectedNFT === el.id
                          ? styles.v3FarmStakeModalPositionSelected
                          : ''
                      }`}
                      key={j}
                      onClick={(e: any) => {
                        if (!isEnoughTokenForLock && selectedTier) return;
                        if (e.target.tagName !== 'A' && !submitLoader) {
                          setSelectedNFT((old) => (old === el.id ? '' : el.id));
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
                        className={`${styles.v3FarmStakePositionCheck} ${
                          selectedNFT === el.id
                            ? styles.v3FarmStakePositionChecked
                            : styles.v3FarmStakePositionUnchecked
                        }`}
                      >
                        {selectedNFT === el.id && <Check />}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))
            ) : (
              <Box className='flex'>
                {[0, 1, 2].map((i) => (
                  <Box
                    padding='8px'
                    borderRadius='12px'
                    mr={1}
                    position='relative'
                    className='flex items-center border'
                    key={i}
                  >
                    <Skeleton variant='circular' width='40px' height='40px' />
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
                        <CircularProgress size='16px' />
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
                  disabled={submitLoader || nftApproved}
                  onClick={approveNFTs}
                >
                  {submitLoader && submitState === 0 ? (
                    <Box className='flex items-center'>
                      <CircularProgress size={24} />
                      <Box ml='4px'>{t('approving')}</Box>
                    </Box>
                  ) : nftApproved ? (
                    t('positionApproved')
                  ) : (
                    t('approvePosition')
                  )}
                </Button>
              </Box>
              <Box width={selectedTier ? '32%' : '49%'}>
                <Button
                  disabled={submitLoader || !nftApproved}
                  onClick={() => farmNFTs(farmingType)}
                >
                  {submitLoader && submitState === 2 ? (
                    <Box className='flex items-center'>
                      <CircularProgress size={24} />
                      <Box ml='4px'>{t('depositing')}</Box>
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
