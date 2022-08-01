import { JSBI } from '@uniswap/sdk';
import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { Pool, TickMath } from '@uniswap/v3-sdk';
import { BigNumber } from 'ethers';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isAddress } from 'utils';
import { getLiquidityChart } from 'utils/v3-graph';
import Chart from 'react-apexcharts';

const AnalyticsPairLiquidityChartV3: React.FC<{
  pairData: any;
  pairAddress: string;
}> = ({ pairData, pairAddress }) => {
  const [liquidityChartData, updateLiquidtyChartData] = useState<any | null>(
    null,
  );

  useEffect(() => {
    getLiquidityChart(pairAddress).then((data) => {
      if (!data.error) {
        updateLiquidtyChartData(data);
      }
    });
  }, [pairData]);

  const [zoom, setZoom] = useState(5);

  const MAX_ZOOM = 10;

  const MAX_UINT128 = BigNumber.from(2)
    .pow(128)
    .sub(1);

  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);

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
  }, [formattedAddress1, pairData]);

  useEffect(() => {
    if (!pairData || !liquidityChartData || !liquidityChartData.ticksProcessed)
      return;

    async function processTicks() {
      const _data = await Promise.all(
        liquidityChartData.ticksProcessed.map(async (t: any, i: number) => {
          const active = t.tickIdx === liquidityChartData.activeTickIdx;
          const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx);
          const mockTicks = [
            {
              index: t.tickIdx - 60,
              liquidityGross: t.liquidityGross,
              liquidityNet: JSBI.multiply(t.liquidityNet, JSBI.BigInt('-1')),
            },
            {
              index: t.tickIdx,
              liquidityGross: t.liquidityGross,
              liquidityNet: t.liquidityNet,
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
          const outputRes0 =
            pool && maxAmountToken0
              ? await pool.getOutputAmount(maxAmountToken0, nextSqrtX96)
              : undefined;

          const token1Amount = outputRes0?.[0] as
            | CurrencyAmount<Token>
            | undefined;

          const amount0 = token1Amount
            ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1)
            : 0;
          const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0;

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
      setProcessedData(_data);
    }

    processTicks();
  }, [liquidityChartData, pairAddress, pairData]);

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
    for (const i of formattedData) {
      if (i.isCurrent) {
        idx = i.index;
      }
    }

    return idx;
  }, [formattedData, zoom]);

  const handleZoomIn = useCallback(() => {
    if (zoom < MAX_ZOOM) {
      setZoom(zoom + 1);
    }
  }, [processedData, zoom]);

  const handleZoomOut = useCallback(() => {
    if (zoom > 0) {
      setZoom(zoom - 1);
    }
  }, [processedData, zoom]);

  return (
    <div>
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
            categories: formattedData ? formattedData.map((v) => v.price0) : [],
          },
          tooltip: {
            enabled: true,
            theme: 'dark',
            fillSeriesColor: false,
            custom: ({ series, seriesIndex, dataPointIndex }: any) => {
              console.log(series, seriesIndex, dataPointIndex);
              return `<div class="areaChartTooltip"><small>${
                series[seriesIndex][dataPointIndex]
              }</small><small><b>$${'12'}</b></small></div>`;
            },
          },
        }}
      />
      <button
        className={'liquidity-chart__zoom-buttons__button'}
        disabled={zoom === MAX_ZOOM}
        onClick={handleZoomIn}
      >
        +
      </button>
      <button
        className={'liquidity-chart__zoom-buttons__button'}
        disabled={zoom === 2}
        onClick={handleZoomOut}
      >
        -
      </button>
    </div>
    // <div className={"w-100 liquidity-chart"} ref={ref}>
    //     {refreshing ? (
    //         <div className={"liquidity-chart__mock-loader"}>
    //             <Loader stroke={"white"} size={"25px"} />
    //         </div>
    //     ) : (
    //         <>
    //             <div className={"liquidity-chart__zoom-buttons"}>
    //                 <button className={"liquidity-chart__zoom-buttons__button"} disabled={zoom === MAX_ZOOM} onClick={handleZoomIn}>
    //                     +
    //                 </button>
    //                 <button className={"liquidity-chart__zoom-buttons__button"} disabled={zoom === 2} onClick={handleZoomOut}>
    //                     -
    //                 </button>
    //             </div>
    //             <BarChart
    //                 data={formattedData || undefined}
    //                 activeTickIdx={activeTickIdx}
    //                 dimensions={{
    //                     width: isMobile ? (ref && ref.current && ref.current.offsetWidth - 10) || 0 : 1020,
    //                     height: 400,
    //                     margin: { top: isMobile ? 80 : 30, right: 20, bottom: isMobile ? 70 : 30, left: isMobile ? 0 : 50 },
    //                 }}
    //                 isMobile={isMobile}
    //             />
    //         </>
    //     )}
    // </div>
  );

  return <></>;
};

export default AnalyticsPairLiquidityChartV3;
