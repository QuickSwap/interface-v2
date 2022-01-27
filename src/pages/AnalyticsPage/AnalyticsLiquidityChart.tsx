import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import moment from 'moment';
import { useGlobalData } from 'state/application/hooks';
import {
  formatCompact,
  getChartData,
  getPriceColor,
  getChartDates,
  getChartStartTime,
  getLimitedData,
} from 'utils';
import { GlobalConst } from 'constants/index';
import { AreaChart } from 'components';

const useStyles = makeStyles(({ palette }) => ({
  durationItem: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    padding: '0 8px',
    borderRadius: 10,
    cursor: 'pointer',
    '& span': {
      color: palette.text.primary,
    },
  },
}));

const AnalyticsLiquidityChart: React.FC = () => {
  const classes = useStyles();
  const { palette } = useTheme();
  const { globalData } = useGlobalData();
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.utils.ONE_MONTH_CHART,
  );
  const [globalChartData, updateGlobalChartData] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      updateGlobalChartData(null);
      const [newChartData] = await getChartData(
        durationIndex === GlobalConst.utils.ALL_CHART
          ? 0
          : getChartStartTime(durationIndex),
      );
      if (newChartData) {
        const chartData = getLimitedData(
          newChartData,
          GlobalConst.utils.CHART_COUNT,
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
      const minVolume =
        Math.floor(Math.min(...dailyVolumes) / 20000000) * 20000000;
      const maxVolume =
        Math.ceil(Math.max(...dailyVolumes) / 20000000) * 20000000;
      const values = [];
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
        <Box display='flex' alignItems='center'>
          <Box
            className={classes.durationItem}
            bgcolor={
              durationIndex === GlobalConst.utils.ONE_MONTH_CHART
                ? palette.grey.A400
                : 'transparent'
            }
            onClick={() => setDurationIndex(GlobalConst.utils.ONE_MONTH_CHART)}
          >
            <Typography variant='caption'>1M</Typography>
          </Box>
          <Box
            className={classes.durationItem}
            ml={0.5}
            bgcolor={
              durationIndex === GlobalConst.utils.THREE_MONTH_CHART
                ? palette.grey.A400
                : 'transparent'
            }
            onClick={() =>
              setDurationIndex(GlobalConst.utils.THREE_MONTH_CHART)
            }
          >
            <Typography variant='caption'>3M</Typography>
          </Box>
          <Box
            className={classes.durationItem}
            ml={0.5}
            bgcolor={
              durationIndex === GlobalConst.utils.ONE_YEAR_CHART
                ? palette.grey.A400
                : 'transparent'
            }
            onClick={() => setDurationIndex(GlobalConst.utils.ONE_YEAR_CHART)}
          >
            <Typography variant='caption'>1Y</Typography>
          </Box>
          <Box
            className={classes.durationItem}
            ml={0.5}
            bgcolor={
              durationIndex === GlobalConst.utils.ALL_CHART
                ? palette.grey.A400
                : 'transparent'
            }
            onClick={() => setDurationIndex(GlobalConst.utils.ALL_CHART)}
          >
            <Typography variant='caption'>All</Typography>
          </Box>
        </Box>
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
          {moment().format('MMM DD, YYYY')}
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
              moment(value.date * 1000)
                .add(1, 'day')
                .unix(),
            )}
            width='100%'
            height={250}
            categories={getChartDates(globalChartData, durationIndex)}
          />
        ) : (
          <Skeleton variant='rect' width='100%' height={250} />
        )}
      </Box>
    </>
  );
};

export default AnalyticsLiquidityChart;
