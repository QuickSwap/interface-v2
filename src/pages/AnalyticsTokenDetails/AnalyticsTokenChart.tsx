import React, { useState, useEffect, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import moment from 'moment';
import {
  formatCompact,
  getFormattedPrice,
  getPriceColor,
  formatNumber,
  getChartDates,
  getChartStartTime,
  getLimitedData,
} from 'utils';
import { AreaChart } from 'components';
import { getTokenChartData } from 'utils';
import { GlobalConst } from 'constants/index';

const useStyles = makeStyles(() => ({
  priceChangeWrapper: {
    height: 25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: '0 8px',
  },
  chartType: {
    height: 20,
    padding: '0 6px',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
}));

const CHART_VOLUME = 0;
const CHART_LIQUIDITY = 1;
const CHART_PRICE = 2;

const AnalyticsTokenChart: React.FC<{ token: any }> = ({ token }) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const match = useRouteMatch<{ id: string }>();
  const tokenAddress = match.params.id;
  const [tokenChartData, updateTokenChartData] = useState<any>(null);
  const [chartIndex, setChartIndex] = useState(CHART_VOLUME);
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.utils.ONE_MONTH_CHART,
  );

  const chartData = useMemo(() => {
    if (tokenChartData) {
      return tokenChartData.map((item: any) =>
        chartIndex === CHART_VOLUME
          ? Number(item.dailyVolumeUSD)
          : chartIndex === CHART_LIQUIDITY
          ? Number(item.totalLiquidityUSD)
          : Number(item.priceUSD),
      );
    } else {
      return null;
    }
  }, [tokenChartData, chartIndex]);

  const yAxisValues = useMemo(() => {
    if (chartData) {
      const minValue = Math.min(...chartData) * 0.99;
      const maxValue = Math.max(...chartData) * 1.01;
      const step = (maxValue - minValue) / 8;
      const values = [];
      for (let i = 0; i < 9; i++) {
        values.push(maxValue - i * step);
      }
      return values;
    } else {
      return undefined;
    }
  }, [chartData]);

  const currentData = useMemo(
    () =>
      token
        ? chartIndex === CHART_VOLUME
          ? token.oneDayVolumeUSD
          : chartIndex === CHART_LIQUIDITY
          ? token.totalLiquidityUSD
          : token.priceUSD
        : null,
    [token, chartIndex],
  );
  const currentPercent = useMemo(
    () =>
      token
        ? chartIndex === CHART_VOLUME
          ? token.volumeChangeUSD
          : chartIndex === CHART_LIQUIDITY
          ? token.liquidityChangeUSD
          : token.priceChangeUSD
        : null,
    [token, chartIndex],
  );

  useEffect(() => {
    async function fetchTokenChartData() {
      updateTokenChartData(null);
      const chartData = await getTokenChartData(
        tokenAddress,
        durationIndex === GlobalConst.utils.ALL_CHART
          ? 0
          : getChartStartTime(durationIndex),
      );
      if (chartData) {
        const newChartData = getLimitedData(
          chartData,
          GlobalConst.utils.CHART_COUNT,
        );
        updateTokenChartData(newChartData);
      }
    }
    fetchTokenChartData();
  }, [updateTokenChartData, tokenAddress, durationIndex]);

  const currentPercentColor = getPriceColor(Number(currentPercent), palette);

  return (
    <>
      <Box display='flex' flexWrap='wrap' justifyContent='space-between'>
        <Box mt={1.5}>
          <Typography variant='caption'>
            {chartIndex === CHART_VOLUME
              ? 'Volume'
              : chartIndex === CHART_LIQUIDITY
              ? 'Liquidity'
              : 'Price'}
          </Typography>
          <Box mt={1}>
            {currentData && currentPercent ? (
              <>
                <Box display='flex' alignItems='center'>
                  <Typography
                    variant='h4'
                    style={{ color: palette.text.primary }}
                  >
                    $
                    {currentData > 100000
                      ? formatCompact(currentData)
                      : formatNumber(currentData)}
                  </Typography>
                  <Box
                    className={classes.priceChangeWrapper}
                    ml={1}
                    bgcolor={currentPercentColor.bgColor}
                    color={currentPercentColor.textColor}
                  >
                    <Typography variant='body2'>
                      {getFormattedPrice(Number(currentPercent))}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant='caption'>
                    {moment().format('MMM DD, YYYY')}
                  </Typography>
                </Box>
              </>
            ) : (
              <Skeleton variant='rect' width='120px' height='30px' />
            )}
          </Box>
        </Box>
        <Box display='flex' flexDirection='column' alignItems='flex-end'>
          <Box display='flex' mt={1.5}>
            <Box
              mr={1}
              bgcolor={
                chartIndex === CHART_VOLUME ? palette.grey.A400 : 'transparent'
              }
              className={classes.chartType}
              onClick={() => setChartIndex(CHART_VOLUME)}
            >
              <Typography variant='caption'>Volume</Typography>
            </Box>
            <Box
              mr={1}
              bgcolor={
                chartIndex === CHART_LIQUIDITY
                  ? palette.grey.A400
                  : 'transparent'
              }
              className={classes.chartType}
              onClick={() => setChartIndex(CHART_LIQUIDITY)}
            >
              <Typography variant='caption'>Liquidity</Typography>
            </Box>
            <Box
              bgcolor={
                chartIndex === CHART_PRICE ? palette.grey.A400 : 'transparent'
              }
              className={classes.chartType}
              onClick={() => setChartIndex(CHART_PRICE)}
            >
              <Typography variant='caption'>Price</Typography>
            </Box>
          </Box>
          <Box mt={1.5} display='flex' alignItems='center'>
            <Box
              className={classes.chartType}
              bgcolor={
                durationIndex === GlobalConst.utils.ONE_MONTH_CHART
                  ? palette.grey.A400
                  : 'transparent'
              }
              onClick={() =>
                setDurationIndex(GlobalConst.utils.ONE_MONTH_CHART)
              }
            >
              <Typography variant='caption'>1M</Typography>
            </Box>
            <Box
              className={classes.chartType}
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
              className={classes.chartType}
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
              className={classes.chartType}
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
      </Box>
      <Box mt={2} width={1}>
        {tokenChartData ? (
          <AreaChart
            data={chartData}
            yAxisValues={yAxisValues}
            dates={tokenChartData.map((value: any) =>
              moment(value.date * 1000)
                .add(1, 'day')
                .unix(),
            )}
            width='100%'
            height={240}
            categories={getChartDates(tokenChartData, durationIndex)}
          />
        ) : (
          <Skeleton variant='rect' width='100%' height={200} />
        )}
      </Box>
    </>
  );
};

export default AnalyticsTokenChart;
