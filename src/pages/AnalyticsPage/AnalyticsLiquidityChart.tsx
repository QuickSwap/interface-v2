import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import dayjs from 'dayjs';
import { useGlobalData } from 'state/application/hooks';
import {
  formatCompact,
  getChartData,
  getPriceColor,
  getChartDates,
  getChartStartTime,
  getLimitedData,
} from 'utils';
import { GlobalConst, GlobalData } from 'constants/index';
import { AreaChart, ChartType } from 'components';

const AnalyticsLiquidityChart: React.FC = () => {
  const { palette } = useTheme();
  const { globalData } = useGlobalData();
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.analyticChart.ONE_MONTH_CHART,
  );
  const [globalChartData, updateGlobalChartData] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      updateGlobalChartData(null);
      const [newChartData] = await getChartData(
        durationIndex === GlobalConst.analyticChart.ALL_CHART
          ? 0
          : getChartStartTime(durationIndex),
      );
      if (newChartData) {
        const chartData = getLimitedData(
          newChartData,
          GlobalConst.analyticChart.CHART_COUNT,
        );
        updateGlobalChartData(chartData);
      }
    };
    fetchChartData();
  }, [updateGlobalChartData, durationIndex]);

  const liquidityPercentColor = getPriceColor(
    globalData ? Number(globalData.liquidityChangeUSD) : 0,
    palette,
  );

  const yAxisValues = useMemo(() => {
    if (globalChartData) {
      const dailyVolumes: number[] = globalChartData.map((value: any) =>
        Number(value.totalLiquidityUSD),
      );
      // this is for defining the scale for the liquidity values to present in graph. Liquidity values are more than 100M so set the min and max amount with rounding after dividing into 20000000 to show all liquidity values into the graph
      const minVolume =
        Math.floor(Math.min(...dailyVolumes) / 20000000) * 20000000;
      const maxVolume =
        Math.ceil(Math.max(...dailyVolumes) / 20000000) * 20000000;
      const values = [];
      // show 10 values in the y axis of the graph
      const step = (maxVolume - minVolume) / 10;
      for (let i = maxVolume; i >= minVolume; i -= step) {
        values.push(i);
      }
      return values;
    } else {
      return undefined;
    }
  }, [globalChartData]);

  return (
    <>
      <Box display='flex' justifyContent='space-between'>
        <Typography
          variant='caption'
          style={{ color: palette.text.disabled, fontWeight: 'bold' }}
        >
          LIQUIDITY
        </Typography>
        <ChartType
          typeTexts={GlobalData.analytics.CHART_DURATION_TEXTS}
          chartTypes={GlobalData.analytics.CHART_DURATIONS}
          chartType={durationIndex}
          setChartType={setDurationIndex}
        />
      </Box>
      {globalData ? (
        <Box mt={0.5} display='flex' alignItems='center'>
          <Typography variant='h5' style={{ color: palette.text.primary }}>
            ${formatCompact(globalData.totalLiquidityUSD)}
          </Typography>
          <Box
            ml={1}
            height={23}
            px={1}
            borderRadius={40}
            bgcolor={liquidityPercentColor.bgColor}
            color={liquidityPercentColor.textColor}
          >
            <Typography variant='caption'>
              {`${globalData.liquidityChangeUSD > 0 ? '+' : ''}
                      ${globalData.liquidityChangeUSD.toLocaleString()}`}
              %
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box my={0.5}>
          <Skeleton variant='rect' width='100%' height={24} />
        </Box>
      )}
      <Box>
        <Typography style={{ color: palette.text.disabled }} variant='caption'>
          {dayjs().format('MMM DD, YYYY')}
        </Typography>
      </Box>
      <Box mt={2}>
        {globalChartData ? (
          <AreaChart
            data={globalChartData.map((value: any) =>
              Number(value.totalLiquidityUSD),
            )}
            yAxisValues={yAxisValues}
            dates={globalChartData.map((value: any) =>
              dayjs(value.date * 1000)
                .add(1, 'day')
                .unix(),
            )}
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
