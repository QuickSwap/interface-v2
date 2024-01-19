import { Box, Button, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { CurrencyLogo, CustomMenu } from 'components';
import RangeBadge from 'components/v3/Badge/RangeBadge';
import { useActiveWeb3React } from 'hooks';
import { useMerklContract } from 'hooks/useContract';
import { useICHIPosition } from 'hooks/useICHIData';
import { useDefiEdgePosition } from 'hooks/v3/useDefiedgeStrategyData';
import { useGammaPosition } from 'hooks/v3/useGammaData';
import { usePool } from 'hooks/v3/usePools';
import { useSteerPosition } from 'hooks/v3/useSteerData';
import { useV3PositionsFromPool } from 'hooks/v3/useV3Farms';
import IncreaseDefiedgeLiquidityModal from 'pages/PoolsPage/v3/MyDefiedgePoolsV3/IncreaseDefiedgeLiquidityModal';
import WithdrawDefiedgeLiquidityModal from 'pages/PoolsPage/v3/MyDefiedgePoolsV3/WithdrawDefiedgeLiquidityModal';
import IncreaseGammaLiquidityModal from 'pages/PoolsPage/v3/MyGammaPoolsV3/IncreaseGammaLiquidityModal';
import WithdrawGammaLiquidityModal from 'pages/PoolsPage/v3/MyGammaPoolsV3/WithdrawGammaLiquidityModal';
import IncreaseICHILiquidityModal from 'pages/PoolsPage/v3/MyICHIPools/IncreaseICHILiquidityModal';
import WithdrawICHILiquidityModal from 'pages/PoolsPage/v3/MyICHIPools/WithdrawICHILiquidityModal';
import V3IncreaseLiquidityModal from 'pages/PoolsPage/v3/MyQuickswapPoolsV3/components/V3IncreaseLiquidityModal';
import V3RemoveLiquidityModal from 'pages/PoolsPage/v3/MyQuickswapPoolsV3/components/V3RemoveLiquidityModal';
import IncreaseSteerLiquidityModal from 'pages/PoolsPage/v3/MySteerPoolsV3/IncreaseSteerLiquidityModal';
import WithdrawSteerLiquidityModal from 'pages/PoolsPage/v3/MySteerPoolsV3/WithdrawSteerLiquidityModal';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectedTokenList } from 'state/lists/hooks';
import { calculateGasMargin, formatNumber, getTokenFromAddress } from 'utils';
import {
  useUSDCPriceFromAddress,
  useUSDCPricesFromAddresses,
} from 'utils/useUSDCPrice';
import { Position } from 'v3lib/entities';
import { TransactionResponse } from '@ethersproject/providers';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import TotalAPRTooltip from 'components/TotalAPRToolTip';
import APRHover from 'assets/images/aprHover.png';
import { toV3Token } from 'constants/v3/addresses';

interface Props {
  farm: any;
}

export const MerklPairFarmCardDetails: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const farmType = farm.label.split(' ')[0];
  const isICHI = !!farm.label.includes('Ichi');
  const isGamma = !!farm.label.includes('Gamma');
  const isDefiEdge = !!farm.label.includes('DefiEdge');
  const isQuickswap = farm.label === 'QuickSwap';
  const isSteer = !!farm.label.includes('Steer');

  const { loading: loadingICHI, vault: ichiPosition } = useICHIPosition(
    isICHI ? farm.almAddress : undefined,
    isICHI ? farm?.token0?.address : undefined,
    isICHI ? farm?.token1?.address : undefined,
  );
  const { loading: loadingGamma, data: gammaPosition } = useGammaPosition(
    isGamma ? farm.almAddress : undefined,
    farm?.token0,
    farm?.token1,
  );
  const {
    loading: loadingDefiEdge,
    data: defiEdgePosition,
  } = useDefiEdgePosition(
    isDefiEdge ? farm.almAddress : undefined,
    farm?.token0,
    farm?.token1,
  );
  const { loading: loadingSteer, data: steerPosition } = useSteerPosition(
    isSteer ? farm.almAddress : undefined,
  );

  const { loading: loadingQS, positions: qsPositions } = useV3PositionsFromPool(
    farm?.token0?.address,
    farm?.token1?.address,
  );

  const [selectedQSNFTId, setSelectedQSNFTId] = useState('');
  const selectedQSPosition = qsPositions.find(
    (item) => item.tokenId.toString() === selectedQSNFTId,
  );

  useEffect(() => {
    if (isQuickswap && qsPositions.length > 0) {
      setSelectedQSNFTId(qsPositions[0].tokenId.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuickswap, qsPositions.length]);

  const v3FarmToken0 = farm?.token0 ? toV3Token(farm?.token0) : undefined;
  const v3FarmToken1 = farm?.token1 ? toV3Token(farm?.token1) : undefined;
  const [_, pool] = usePool(
    isQuickswap ? v3FarmToken0 : undefined,
    isQuickswap ? v3FarmToken1 : undefined,
    selectedQSPosition?.fee,
    selectedQSPosition?.isUni,
  );

  const qsPosition = useMemo(() => {
    if (
      pool &&
      selectedQSPosition &&
      selectedQSPosition.liquidity &&
      typeof selectedQSPosition.tickLower === 'number' &&
      typeof selectedQSPosition.tickUpper === 'number'
    ) {
      return new Position({
        pool: pool,
        liquidity: selectedQSPosition.liquidity.toString(),
        tickLower: selectedQSPosition.tickLower,
        tickUpper: selectedQSPosition.tickUpper,
      });
    }
    return;
  }, [pool, selectedQSPosition]);
  const outOfRange: boolean =
    pool && qsPosition
      ? pool.tickCurrent < qsPosition.tickLower ||
        pool.tickCurrent >= qsPosition.tickUpper
      : false;

  const loading = isICHI
    ? loadingICHI
    : isGamma
    ? loadingGamma
    : isDefiEdge
    ? loadingDefiEdge
    : isQuickswap
    ? loadingQS
    : isSteer
    ? loadingSteer
    : false;
  const token0Amount = useMemo(() => {
    if (isICHI) {
      return ichiPosition?.token0Balance ?? 0;
    }
    if (isGamma) {
      return gammaPosition?.balance0 ?? 0;
    }
    if (isDefiEdge) {
      return defiEdgePosition?.balance0 ?? 0;
    }
    if (isQuickswap) {
      return Number(qsPosition?.amount0.toExact() ?? 0);
    }
    if (isSteer) {
      return steerPosition?.token0BalanceWallet ?? 0;
    }
    return 0;
  }, [
    isICHI,
    isGamma,
    isDefiEdge,
    isQuickswap,
    isSteer,
    ichiPosition?.token0Balance,
    gammaPosition?.balance0,
    defiEdgePosition?.balance0,
    qsPosition?.amount0,
    steerPosition?.token0BalanceWallet,
  ]);

  const token1Amount = useMemo(() => {
    if (isICHI) {
      return ichiPosition?.token1Balance ?? 0;
    }
    if (isGamma) {
      return gammaPosition?.balance1 ?? 0;
    }
    if (isDefiEdge) {
      return defiEdgePosition?.balance1 ?? 0;
    }
    if (isQuickswap) {
      return Number(qsPosition?.amount1.toExact() ?? 0);
    }
    if (isSteer) {
      return Number(steerPosition?.token1BalanceWallet ?? 0);
    }
    return 0;
  }, [
    isICHI,
    isGamma,
    isDefiEdge,
    isQuickswap,
    isSteer,
    ichiPosition?.token1Balance,
    gammaPosition?.balance1,
    defiEdgePosition?.balance1,
    qsPosition?.amount1,
    steerPosition?.token1BalanceWallet,
  ]);

  const {
    loading: loadingToken0Price,
    price: token0Price,
  } = useUSDCPriceFromAddress(farm?.token0?.address ?? '');
  const {
    loading: loadingToken1Price,
    price: token1Price,
  } = useUSDCPriceFromAddress(farm?.token1?.address ?? '');
  const usdAmount = token0Price * token0Amount + token1Price * token1Amount;

  const [openAdd, setOpenAdd] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const ichiPositionToPass = ichiPosition
    ? {
        ...ichiPosition,
        token0: farm?.token0 ? toV3Token(farm?.token0) : undefined,
        token1: farm?.token1 ? toV3Token(farm?.token1) : undefined,
      }
    : undefined;

  const tokenMap = useSelectedTokenList();

  const {
    loading: loadingRewardTokenPrices,
    prices: rewardTokenPrices,
  } = useUSDCPricesFromAddresses(
    farm.rewards.map((reward: any) => reward.address),
  );

  const farmTypeReward =
    farmType === 'QuickSwap' ? 'QuickswapAlgebra' : farmType;

  const [claiming, setClaiming] = useState(false);
  const rewardUSD = farm.rewards.reduce(
    (total: number, reward: any) =>
      total +
      (rewardTokenPrices?.find(
        (item) => item.address.toLowerCase() === reward.address.toLowerCase(),
      )?.price ?? 0) *
        reward.breakdownOfUnclaimed[farmTypeReward],
    0,
  );

  const isClaimable =
    farm.rewards.length > 0 &&
    farm.rewards.filter(
      (reward: any) => reward.breakdownOfUnclaimed[farmTypeReward] > 0,
    ).length > 0 &&
    !claiming;

  const merklDistributorContract = useMerklContract();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const claimReward = async () => {
    if (!merklDistributorContract || !account) return;
    setClaiming(true);
    let data: any;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_MERKL_API_URL}?chainIds[]=${chainId}&AMMs[]=quickswapalgebra&user=${account}`,
      );
      const merklData = await res.json();
      data =
        merklData && merklData[chainId]
          ? merklData[chainId].transactionData
          : undefined;
    } catch {
      setClaiming(false);
      throw 'Angle API not responding';
    }
    // Distributor address is the same across different chains
    const tokens = Object.keys(data).filter((k) => data[k].proof !== undefined);
    const claims = tokens.map((t) => data[t].claim);
    const proofs = tokens.map((t) => data[t].proof);

    try {
      const estimatedGas = await merklDistributorContract.estimateGas.claim(
        tokens.map((t) => account),
        tokens,
        claims,
        proofs as string[][],
      );
      const response: TransactionResponse = await merklDistributorContract.claim(
        tokens.map((t) => account),
        tokens,
        claims,
        proofs as string[][],
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      );
      addTransaction(response, {
        summary: t('claimingReward'),
      });
      const receipt = await response.wait();
      finalizedTransaction(receipt, {
        summary: t('claimedReward'),
      });
      setClaiming(false);
    } catch {
      setClaiming(false);
    }
  };

  return (
    <Box padding={2} className='v3PairFarmCardDetailsWrapper'>
      {ichiPositionToPass && openAdd && (
        <IncreaseICHILiquidityModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          position={ichiPositionToPass}
        />
      )}
      {ichiPositionToPass && openWithdraw && (
        <WithdrawICHILiquidityModal
          open={openWithdraw}
          onClose={() => setOpenWithdraw(false)}
          position={ichiPositionToPass}
        />
      )}
      {gammaPosition && openAdd && (
        <IncreaseGammaLiquidityModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          position={gammaPosition}
        />
      )}
      {gammaPosition && openWithdraw && (
        <WithdrawGammaLiquidityModal
          open={openWithdraw}
          onClose={() => setOpenWithdraw(false)}
          position={gammaPosition}
        />
      )}
      {defiEdgePosition && openAdd && (
        <IncreaseDefiedgeLiquidityModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          position={defiEdgePosition}
        />
      )}
      {defiEdgePosition && openWithdraw && (
        <WithdrawDefiedgeLiquidityModal
          open={openWithdraw}
          onClose={() => setOpenWithdraw(false)}
          position={defiEdgePosition}
        />
      )}
      {steerPosition && openAdd && (
        <IncreaseSteerLiquidityModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          position={steerPosition}
        />
      )}
      {steerPosition && openWithdraw && (
        <WithdrawSteerLiquidityModal
          open={openWithdraw}
          onClose={() => setOpenWithdraw(false)}
          position={steerPosition}
        />
      )}
      {selectedQSPosition && openAdd && (
        <V3IncreaseLiquidityModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          positionDetails={selectedQSPosition}
        />
      )}
      {selectedQSPosition && openWithdraw && (
        <V3RemoveLiquidityModal
          open={openWithdraw}
          onClose={() => setOpenWithdraw(false)}
          position={selectedQSPosition}
        />
      )}
      {isMobile && (
        <>
          <Box className='flex items-center justify-between'>
            <p className='small text-secondary'>{t('tvl')}</p>
            <p className='small'>${formatNumber(farm.almTVL)}</p>
          </Box>
          <Box className='flex items-center justify-between' my={2}>
            <p className='small text-secondary'>{t('totalAPR')}</p>
            <Box className='flex items-center' gridGap={4}>
              <p className='small text-success'>
                {formatNumber(farm.poolAPR + farm.almAPR)}%
              </p>
              <TotalAPRTooltip farmAPR={farm.almAPR} poolAPR={farm.poolAPR}>
                <img src={APRHover} alt='farm APR' height={16} />
              </TotalAPRTooltip>
            </Box>
          </Box>
        </>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6}>
          <Box
            width='100%'
            height='100%'
            padding={2}
            borderRadius='10px'
            className='bg-palette flex flex-col justify-between'
            gridGap={16}
          >
            {isQuickswap && qsPositions.length > 0 && (
              <Box className='flex border-bottom' pb='8px'>
                <Box
                  className='flex items-center border-right'
                  gridGap={6}
                  pr='8px'
                >
                  <small className='secondary'>{t('nftID')}:</small>
                  <Box className='flex'>
                    <CustomMenu
                      menuItems={qsPositions.map((item) => ({
                        text: item.tokenId.toString(),
                        onClick: () =>
                          setSelectedQSNFTId(item.tokenId.toString()),
                      }))}
                      title={''}
                      selectedValue={selectedQSNFTId}
                    />
                  </Box>
                </Box>
                <Box px='8px' className='border-right'>
                  <RangeBadge removed={false} inRange={!outOfRange} />
                </Box>
                <Box pl='8px' className='flex items-center'>
                  <a
                    href={`/#/pool/${selectedQSNFTId}`}
                    target='_blank'
                    rel='noreferrer'
                    className='flex no-decoration text-primary'
                    style={{ height: 20 }}
                  >
                    {t('viewPosition')}
                  </a>
                </Box>
              </Box>
            )}
            <Box className='flex justify-between items-center'>
              <small>{t('myLiquidity')}</small>
              {loading || loadingToken0Price || loadingToken1Price ? (
                <Skeleton width={100} height={22} />
              ) : (
                <small
                  className='text-secondary'
                  style={{ lineHeight: '22px' }}
                >
                  ${formatNumber(usdAmount)}
                </small>
              )}
            </Box>
            {loading ? (
              <Skeleton height='56px' />
            ) : (
              <Box
                className='flex items-end justify-between flex-wrap'
                gridGap={8}
              >
                <Box>
                  <Box className='flex items-center' gridGap={8}>
                    <CurrencyLogo currency={farm.token0} />
                    <small>
                      {formatNumber(token0Amount)} {farm.token0?.symbol}
                    </small>
                  </Box>
                  <Box className='flex items-center' gridGap={8} mt={1}>
                    <CurrencyLogo currency={farm.token1} />
                    <small>
                      {formatNumber(token1Amount)} {farm.token1?.symbol}
                    </small>
                  </Box>
                </Box>
                {token0Amount > 0 || token1Amount > 0 ? (
                  <Box className='flex items-center' gridGap={6}>
                    <Button onClick={() => setOpenAdd(true)}>
                      + {t('add')}
                    </Button>
                    <Button onClick={() => setOpenWithdraw(true)}>
                      - {t('withdraw')}
                    </Button>
                  </Box>
                ) : (
                  <Button
                    onClick={() => {
                      let currencyStr = '';
                      if (isICHI) {
                        const farmToken = farm?.allowToken0
                          ? farm?.token0
                          : farm?.token1;
                        if (farmToken) {
                          currencyStr += `currency=${farmToken.address}`;
                        }
                      } else {
                        if (farm?.token0) {
                          currencyStr += `currency0=${farm.token0.address}`;
                        }
                        if (farm?.token1) {
                          if (farm?.token0) {
                            currencyStr += '&';
                          }
                          currencyStr += `currency1=${farm.token1.address}`;
                        }
                      }
                      window.open(
                        `#/pools${isICHI ? '/singleToken' : ''}?${currencyStr}`,
                        '_blank',
                      );
                    }}
                  >
                    {t('getLP')}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box
            width='100%'
            height='100%'
            padding={2}
            borderRadius='10px'
            className='bg-palette flex flex-col justify-between'
            gridGap={16}
          >
            <Box className='flex justify-between'>
              <small>{t('myrewards')}</small>
              {loadingRewardTokenPrices ? (
                <Skeleton width={100} height={22} />
              ) : (
                <small className='text-secondary'>
                  ${formatNumber(rewardUSD)}
                </small>
              )}
            </Box>
            <Box className='flex items-end justify-between'>
              <Box className='flex flex-col' gridGap={8}>
                {farm.rewards.map((reward: any) => {
                  const token = getTokenFromAddress(
                    reward.address,
                    chainId,
                    tokenMap,
                    [],
                  );
                  return (
                    <Box
                      className='flex items-center'
                      gridGap={8}
                      key={reward.address}
                    >
                      <CurrencyLogo currency={token} />
                      <small>
                        {formatNumber(
                          reward.breakdownOfUnclaimed[farmTypeReward],
                        )}{' '}
                        {token?.symbol}
                      </small>
                    </Box>
                  );
                })}
              </Box>
              <Button onClick={claimReward} disabled={!isClaimable}>
                {claiming ? t('claiming') : t('claim')}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
