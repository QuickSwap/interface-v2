import React, { useEffect, useState, useMemo } from 'react';
import { Box } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useGlobalData } from 'state/application/hooks';
import {
  formatCompact,
  getChartData,
  getPriceClass,
  getChartDates,
  getChartStartTime,
  getLimitedData,
} from 'utils';
import { GlobalConst, GlobalData } from 'constants/index';
import { AreaChart, ChartType } from 'components';
import { useTranslation } from 'react-i18next';
import { useIsV3 } from 'state/application/hooks';
import { getChartDataV3 } from 'utils/v3-graph';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
dayjs.extend(utc);

const AnalyticsLiquidityChart: React.FC = () => {
  const { t } = useTranslation();
  const { globalData } = useGlobalData();
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.analyticChart.ONE_MONTH_CHART,
  );
  const [globalChartData, updateGlobalChartData] = useState<any[] | null>(null);
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const { isV3 } = useIsV3();

  useEffect(() => {
    if (isV3 === undefined) return;
    const fetchChartData = async () => {
      updateGlobalChartData(null);

      const duration =
        durationIndex === GlobalConst.analyticChart.ALL_CHART
          ? 0
          : getChartStartTime(durationIndex);

      const chartDataFn = isV3
        ? getChartDataV3(duration, chainIdToUse)
        : getChartData(duration, chainIdToUse);

      chartDataFn.then(([newChartData]) => {
        if (newChartData) {
          const chartData = getLimitedData(
            newChartData,
            GlobalConst.analyticChart.CHART_COUNT,
          );
          updateGlobalChartData(chartData);
        }
      });
    };
    fetchChartData();
  }, [updateGlobalChartData, durationIndex, isV3]);

  const liquidityPercentClass = getPriceClass(
    globalData ? Number(globalData.liquidityChangeUSD) : 0,
  );

  const yAxisValues = useMemo(() => {
    if (globalChartData) {
      const dailyVolumes: number[] = globalChartData.map((value: any) =>
        Number(value.totalLiquidityUSD),
      );
      // this is for defining the scale for the liquidity values to present in graph. Liquidity values are more than 100M so set the min and max amount with rounding after dividing into 20000000 to show all liquidity values into the graph
      // const minVolume =
      //   Math.floor(Math.min(...dailyVolumes) / 20000000) * 20000000;
      // const maxVolume =
      //   Math.ceil(Math.max(...dailyVolumes) / 20000000) * 20000000;

      const minVolume = Math.floor(Math.min(...dailyVolumes));
      const maxVolume = Math.ceil(Math.max(...dailyVolumes));

      const values = [];
      // show 10 values in the y axis of the graph
      const step = (maxVolume - minVolume) / 10;
      if (step > 0) {
        for (let i = maxVolume; i >= minVolume; i -= step) {
          values.push(Math.floor(i));
        }
      } else {
        values.push(minVolume);
      }
      return values;
    } else {
      return undefined;
    }
  }, [globalChartData]);

  return (
    <>
      <Box className='flex justify-between'>
        <span className='text-disabled text-bold text-uppercase'>
          {t('liquidity')}
        </span>
        <ChartType
          typeTexts={GlobalData.analytics.CHART_DURATION_TEXTS}
          chartTypes={GlobalData.analytics.CHART_DURATIONS}
          chartType={durationIndex}
          setChartType={setDurationIndex}
        />
      </Box>
      {globalData ? (
        <Box mt={0.5} className='flex items-center'>
          <h5>${formatCompact(globalData.totalLiquidityUSD)}</h5>
          <Box
            ml={1}
            height={23}
            px={1}
            borderRadius={40}
            className={liquidityPercentClass}
          >
            <span>
              {`${(globalData.liquidityChangeUSD ?? 0) > 0 ? '+' : ''}
                      ${(globalData.liquidityChangeUSD ?? 0).toLocaleString()}`}
              %
            </span>
          </Box>
        </Box>
      ) : (
        <Box my={0.5}>
          <Skeleton variant='rect' width='100%' height={24} />
        </Box>
      )}
      <Box>
        <span className='text-disabled'>
          {dayjs.utc().format('MMM DD, YYYY')}
        </span>
      </Box>
      <Box mt={2}>
        {globalChartData ? (
          <AreaChart
            data={globalChartData.map((value: any) =>
              Number(value.totalLiquidityUSD),
            )}
            strokeColor={isV3 ? '#3e92fe' : '#00dced'}
            gradientColor={isV3 ? '#448aff' : undefined}
            yAxisValues={yAxisValues}
            dates={globalChartData.map((value: any) => value.date)}
            width='100%'
            height={250}
            categories={getChartDates(globalChartData, durationIndex)}
          />
        ) : (
          <Skeleton variant='rect' width='100%' height={223} />
        )}
      </Box>
    </>
  );
};

export default AnalyticsLiquidityChart;
