import { JSBI } from '@uniswap/sdk';
import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { Pool } from 'v3lib/entities/pool';
import { TickMath } from 'v3lib/utils/tickMath';
import { BigNumber } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { isAddress } from 'utils';
import Chart from 'react-apexcharts';
import { Box } from '@material-ui/core';
import '../styles/analytics.scss';
import { useActiveWeb3React } from 'hooks';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

const AnalyticsPairLiquidityChartV3: React.FC<{
  pairData: any;
  pairAddress: string;
  isUni?: boolean;
}> = ({ pairData, pairAddress, isUni }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();

  const fetchLiquidityChartData = async () => {
    try {
      const res = await fetch(
        `${
          process.env.REACT_APP_LEADERBOARD_APP_URL
        }/analytics/v3-pair-liquidity-chart/${pairAddress}?chainId=${chainId}${
          isUni ? '&isUni=true' : ''
        }`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      if (data && data.data && data.data.chartData) {
        const liquidityChartData = data.data.chartData;
        if (
          pairData &&
          liquidityChartData.ticksProcessed &&
          liquidityChartData.ticksProcessed.length > 0
        ) {
          const data = await Promise.all(
            liquidityChartData.ticksProcessed.map(async (t: any, i: number) => {
              const active = t.tickIdx === liquidityChartData.activeTickIdx;
              const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx);
              const mockTicks = [
                {
                  index: t.tickIdx - 60,
                  liquidityGross: JSBI.BigInt(t.liquidityGross),
                  liquidityNet: JSBI.multiply(
                    JSBI.BigInt(t.liquidityNet),
                    JSBI.BigInt('-1'),
                  ),
                },
                {
                  index: t.tickIdx,
                  liquidityGross: JSBI.BigInt(t.liquidityGross),
                  liquidityNet: JSBI.BigInt(t.liquidityNet),
                },
              ];
              const pool =
                _token0 && _token1
                  ? new Pool(
                      _token0,
                      _token1,
                      500,
                      sqrtPriceX96,
                      t.liquidityActive,
                      t.tickIdx,
                      mockTicks,
                      isUni,
                    )
                  : undefined;
              const nextSqrtX96 = liquidityChartData.ticksProcessed[i - 1]
                ? TickMath.getSqrtRatioAtTick(
                    liquidityChartData.ticksProcessed[i - 1].tickIdx,
                  )
                : undefined;

              const maxAmountToken0 = _token0
                ? CurrencyAmount.fromRawAmount(_token0, MAX_UINT128.toString())
                : undefined;
              let outputRes0;
              if (pool && maxAmountToken0) {
                try {
                  outputRes0 = await pool.getOutputAmount(
                    maxAmountToken0,
                    nextSqrtX96,
                  );
                } catch {}
              }

              const token1Amount = outputRes0?.[0] as
                | CurrencyAmount<Token>
                | undefined;

              const amount0 = token1Amount
                ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1)
                : 0;
              const amount1 = token1Amount
                ? parseFloat(token1Amount.toExact())
                : 0;

              return {
                index: i,
                isCurrent: active,
                activeLiquidity: parseFloat(t.liquidityActive.toString()),
                price0: parseFloat(t.price0),
                price1: parseFloat(t.price1),
                tvlToken0: amount0,
                tvlToken1: amount1,
                token0: pairData.token0,
                token1: pairData.token1,
              };
            }),
          );
          return data;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const {
    isLoading: loadingChartData,
    data: processedData,
    refetch,
  } = useQuery({
    queryKey: ['analyticsV3PairLiquidityChartData', pairAddress, chainId],
    queryFn: fetchLiquidityChartData,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  const [zoom, setZoom] = useState(5);

  const MAX_ZOOM = 10;

  const MAX_UINT128 = BigNumber.from(2)
    .pow(128)
    .sub(1);

  const formattedAddress0 = isAddress(pairData?.token0?.id);
  const formattedAddress1 = isAddress(pairData?.token1?.id);

  // parsed tokens
  const _token0 = useMemo(() => {
    return pairData && formattedAddress0 && formattedAddress1
      ? new Token(137, formattedAddress0, +pairData.token0.decimals)
      : undefined;
  }, [formattedAddress0, formattedAddress1, pairData]);

  const _token1 = useMemo(() => {
    return pairData && formattedAddress0 && formattedAddress1
      ? new Token(137, formattedAddress1, +pairData.token1.decimals)
      : undefined;
  }, [formattedAddress0, formattedAddress1, pairData]);

  const formattedData = useMemo(() => {
    if (!processedData) return undefined;
    if (processedData && processedData.length === 0) return undefined;

    if (zoom === 1) return processedData;

    const middle = Math.round(processedData.length / 2);
    const chunkLength = Math.round(processedData.length / zoom);

    return processedData.slice(middle - chunkLength, middle + chunkLength);
  }, [processedData, zoom]);

  const activeTickIdx = useMemo(() => {
    if (!formattedData) return;

    let idx;

    for (let i = 0; i < formattedData.length; i++) {
      if (formattedData[i].isCurrent) {
        idx = i;
      }
    }

    return idx;
  }, [formattedData]);

  const handleZoomIn = useCallback(() => {
    if (zoom < MAX_ZOOM) {
      setZoom(zoom + 1);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    if (zoom > 0) {
      setZoom(zoom - 1);
    }
  }, [zoom]);

  return (
    <Box position={'relative'} height='100%'>
      {loadingChartData ? (
        <Skeleton variant='rect' width='100%' height='100%' />
      ) : formattedData ? (
        <>
          <Chart
            type={'bar'}
            height={275}
            series={[
              {
                name: 'Liquidty',
                data: formattedData
                  ? formattedData.map((v) =>
                      v.activeLiquidity >= 0 ? v.activeLiquidity : 0,
                    )
                  : [],
              },
              {
                name: 'Liquidty 2',
                data: formattedData
                  ? formattedData.map((v) =>
                      v.isCurrent ? v.activeLiquidity : 0,
                    )
                  : [],
              },
            ]}
            options={{
              chart: {
                type: 'bar',
                height: 100,
                toolbar: {
                  show: false,
                },
                animations: {
                  enabled: false,
                },
              },
              legend: {
                show: false,
              },
              fill: {
                opacity: 1,
              },
              plotOptions: {
                bar: {
                  horizontal: false,
                },
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                show: false,
              },
              grid: {
                show: false,
              },
              yaxis: {
                labels: {
                  show: false,
                },
                axisTicks: {
                  show: false,
                },
                axisBorder: {
                  show: false,
                },
              },
              xaxis: {
                axisBorder: {
                  show: true,
                },
                axisTicks: {
                  show: false,
                },
                labels: {
                  show: false,
                },
                categories: formattedData
                  ? formattedData.map((v) => v.price0)
                  : [],
              },
              tooltip: {
                enabled: true,
                theme: 'dark',
                fillSeriesColor: false,
                custom: ({ dataPointIndex }: any) => {
                  return `<div class="areaChartTooltipLiquidity">
              <small>${t('tickStats')}</small>
              <small>${pairData.token0.symbol} ${t('price')}: ${
                    formattedData
                      ? Number(
                          formattedData[dataPointIndex].price0,
                        ).toLocaleString(undefined, {
                          minimumSignificantDigits: 1,
                        })
                      : '-'
                  } ${pairData.token1.symbol}</small>
              <small>${pairData.token1.symbol} ${t('price')}: ${
                    formattedData
                      ? Number(
                          formattedData[dataPointIndex].price1,
                        ).toLocaleString(undefined, {
                          minimumSignificantDigits: 1,
                        })
                      : '-'
                  } ${pairData.token0.symbol}</small>
              ${
                activeTickIdx && dataPointIndex > activeTickIdx
                  ? `<small>${pairData.token0.symbol} ${t('locked')}: ${
                      formattedData
                        ? formattedData[dataPointIndex].tvlToken0
                        : '-'
                    } ${pairData.token0.symbol}</small>`
                  : `<small>${pairData.token1.symbol} ${t('locked')}: ${
                      formattedData
                        ? formattedData[dataPointIndex].tvlToken1
                        : '-'
                    } ${pairData.token1.symbol}</small>`
              }
              </div>`;
                },
              },
            }}
          />
          <Box className='flex' position={'absolute'} right={16} bottom={0}>
            <button
              disabled={zoom === MAX_ZOOM}
              className='liquidityChartButton'
              onClick={handleZoomIn}
            >
              +
            </button>
            <button
              disabled={zoom === 2}
              className='liquidityChartButton'
              onClick={handleZoomOut}
            >
              -
            </button>
          </Box>
        </>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default AnalyticsPairLiquidityChartV3;
