import React, { useState, useMemo } from 'react';
import { Box } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  formatCompact,
  getPriceClass,
  getChartDates,
  getLimitedData,
  getFormattedPercent,
} from 'utils';
import { GlobalConst, GlobalData } from 'constants/index';
import { AreaChart, ChartType } from 'components';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { useQuery } from '@tanstack/react-query';
dayjs.extend(utc);

const AnalyticsLiquidityChart: React.FC<{
  globalData: any;
}> = ({ globalData }) => {
  const { t } = useTranslation();
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.analyticChart.ONE_MONTH_CHART,
  );
  const { chainId } = useActiveWeb3React();
  const version = useAnalyticsVersion();

  const fetchChartData = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/chart-data/${durationIndex}/${version}?chainId=${chainId}`,
    );
    if (!res.ok) {
      return null;
    }
    const pairsData = await res.json();
    const chartData =
      pairsData && pairsData.data && pairsData.data.length > 0
        ? getLimitedData(
            pairsData.data[0],
            GlobalConst.analyticChart.CHART_COUNT,
          )
        : null;
    return chartData;
  };

  const { isLoading, data: globalChartData } = useQuery({
    queryKey: [
      'fetchAnalyticsLiquidityChartData',
      durationIndex,
      version,
      chainId,
    ],
    queryFn: fetchChartData,
    refetchInterval: 60000,
  });

  const liquidityPercentClass = getPriceClass(
    globalData ? Number(globalData.liquidityChangeUSD) : 0,
  );

  const yAxisValues = useMemo(() => {
    if (globalChartData) {
      const dailyVolumes: number[] = globalChartData.map((value: any) =>
        Number(value.totalLiquidityUSD),
      );

      const minVolume = Math.floor(Math.min(...dailyVolumes));
      const maxVolume = Math.ceil(Math.max(...dailyVolumes));

      const values: any[] = [];
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
      {globalData && (
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
              {getFormattedPercent(globalData.liquidityChangeUSD ?? 0)}
            </span>
          </Box>
        </Box>
      )}
      <Box>
        <span className='text-disabled'>
          {dayjs.utc().format('MMM DD, YYYY')}
        </span>
      </Box>
      <Box mt={2}>
        {isLoading ? (
          <Skeleton variant='rect' width='100%' height={223} />
        ) : globalChartData ? (
          <AreaChart
            data={globalChartData.map((value: any) =>
              Number(value.totalLiquidityUSD),
            )}
            strokeColor={version === 'v2' ? '#00dced' : '#3e92fe'}
            gradientColor={version === 'v2' ? undefined : '#448aff'}
            yAxisValues={yAxisValues}
            dates={globalChartData.map((value: any) => value.date)}
            width='100%'
            height={250}
            categories={getChartDates(globalChartData, durationIndex)}
          />
        ) : (
          <></>
        )}
      </Box>
    </>
  );
};

export default AnalyticsLiquidityChart;
