import { Box, Button, Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Token } from '@uniswap/sdk-core';
import { CurrencyLogo } from 'components';
import { useActiveWeb3React } from 'hooks';
import { useICHIPosition } from 'hooks/useICHIData';
import { useDefiEdgePosition } from 'hooks/v3/useDefiedgeStrategyData';
import { useGammaPosition } from 'hooks/v3/useGammaData';
import IncreaseDefiedgeLiquidityModal from 'pages/PoolsPage/v3/MyDefiedgePoolsV3/IncreaseDefiedgeLiquidityModal';
import WithdrawDefiedgeLiquidityModal from 'pages/PoolsPage/v3/MyDefiedgePoolsV3/WithdrawDefiedgeLiquidityModal';
import IncreaseGammaLiquidityModal from 'pages/PoolsPage/v3/MyGammaPoolsV3/IncreaseGammaLiquidityModal';
import WithdrawGammaLiquidityModal from 'pages/PoolsPage/v3/MyGammaPoolsV3/WithdrawGammaLiquidityModal';
import IncreaseICHILiquidityModal from 'pages/PoolsPage/v3/MyICHIPools/IncreaseICHILiquidityModal';
import WithdrawICHILiquidityModal from 'pages/PoolsPage/v3/MyICHIPools/WithdrawICHILiquidityModal';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectedTokenList } from 'state/lists/hooks';
import { formatNumber, getTokenFromAddress } from 'utils';
import {
  useUSDCPriceFromAddress,
  useUSDCPricesFromAddresses,
} from 'utils/useUSDCPrice';

interface Props {
  farm: any;
}

export const V3PairFarmCardDetails: React.FC<Props> = ({ farm }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();

  const farmType = farm.label.split(' ')[0];
  const isICHI = !!farm.label.includes('Ichi');
  const isGamma = !!farm.label.includes('Gamma');
  const isDefiEdge = !!farm.label.includes('DefiEdge');
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

  const loading = isICHI
    ? loadingICHI
    : isGamma
    ? loadingGamma
    : isDefiEdge
    ? loadingDefiEdge
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
    return 0;
  }, [
    ichiPosition,
    isGamma,
    gammaPosition,
    isICHI,
    isDefiEdge,
    defiEdgePosition,
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
    return 0;
  }, [
    ichiPosition,
    isGamma,
    gammaPosition,
    isICHI,
    isDefiEdge,
    defiEdgePosition,
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
        token0: farm?.token0,
        token1: farm?.token1,
      }
    : undefined;

  const tokenMap = useSelectedTokenList();

  const {
    loading: loadingRewardTokenPrices,
    prices: rewardTokenPrices,
  } = useUSDCPricesFromAddresses(
    farm.rewards.map((reward: any) => reward.address),
  );

  const isClaimable =
    farm.rewards.filter(
      (reward: any) => reward.breakdownOfUnclaimed[farmType] > 0,
    ).length > 0;
  const rewardUSD = farm.rewards.reduce(
    (total: number, reward: any) =>
      total +
      (rewardTokenPrices?.find(
        (item) => item.address.toLowerCase() === reward.address.toLowerCase(),
      )?.price ?? 0) *
        reward.breakdownOfUnclaimed[farmType],
    0,
  );

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
              <Box className='flex items-end justify-between'>
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
                      if (farm?.token0) {
                        currencyStr += `currency0=${farm.token0.address}`;
                      }
                      if (farm?.token1) {
                        if (farm?.token0) {
                          currencyStr += '&';
                        }
                        currencyStr += `currency1=${farm.token1.address}`;
                      }
                      window.open(`#/pools?${currencyStr}`, '_blank');
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
              <Box>
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
                        {formatNumber(reward.breakdownOfUnclaimed[farmType])}{' '}
                        {token?.symbol}
                      </small>
                    </Box>
                  );
                })}
              </Box>
              <Button disabled={!isClaimable}>{t('claim')}</Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
