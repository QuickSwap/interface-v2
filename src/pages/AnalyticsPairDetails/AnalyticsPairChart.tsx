import React, { useState, useEffect, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import moment from 'moment';
import {
  formatCompact,
  getPairChartData,
  getFormattedPrice,
  getPriceColor,
  getChartDates,
  getChartStartTime,
  getLimitedData,
} from 'utils';
import { AreaChart } from 'components';
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
const CHART_FEES = 2;

const AnalyticsPairChart: React.FC<{ pairData: any }> = ({ pairData }) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const match = useRouteMatch<{ id: string }>();
  const pairAddress = match.params.id;
  const [pairChartData, setPairChartData] = useState<any[] | null>(null);
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.analyticChart.ONE_MONTH_CHART,
  );

  const usingUtVolume =
    pairData &&
    pairData.oneDayVolumeUSD === 0 &&
    !!pairData.oneDayVolumeUntracked;
  const fees =
    pairData && (pairData.oneDayVolumeUSD || pairData.oneDayVolumeUSD === 0)
      ? usingUtVolume
        ? (
            Number(pairData.oneDayVolumeUntracked) *
            GlobalConst.utils.FEEPERCENT
          ).toLocaleString()
        : (
            Number(pairData.oneDayVolumeUSD) * GlobalConst.utils.FEEPERCENT
          ).toLocaleString()
      : '-';
  const [chartIndex, setChartIndex] = useState(CHART_VOLUME);

  const chartData = useMemo(() => {
    if (pairChartData) {
      return pairChartData.map((item: any) =>
        chartIndex === CHART_VOLUME
          ? Number(item.dailyVolumeUSD)
          : chartIndex === CHART_LIQUIDITY
          ? Number(item.reserveUSD)
          : Number(item.dailyVolumeUSD) * GlobalConst.utils.FEEPERCENT,
      );
    } else {
      return null;
    }
  }, [pairChartData, chartIndex]);

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
      pairData
        ? chartIndex === CHART_VOLUME
          ? pairData.oneDayVolumeUSD
          : chartIndex === CHART_LIQUIDITY
          ? pairData.reserveUSD
            ? pairData.reserveUSD
            : pairData.trackedReserveUSD
          : fees
        : null,
    [pairData, chartIndex, fees],
  );
  const currentPercent = useMemo(
    () =>
      pairData
        ? chartIndex === CHART_VOLUME
          ? pairData.volumeChangeUSD
          : chartIndex === CHART_LIQUIDITY
          ? pairData.liquidityChangeUSD
          : (usingUtVolume
              ? pairData.volumeChangeUntracked
              : pairData.volumeChangeUSD) * GlobalConst.utils.FEEPERCENT
        : null,
    [pairData, chartIndex, usingUtVolume],
  );

  useEffect(() => {
    async function fetchPairChartData() {
      setPairChartData(null);
      const chartData = await getPairChartData(
        pairAddress,
        durationIndex === GlobalConst.analyticChart.ALL_CHART
          ? 0
          : getChartStartTime(durationIndex),
      );
      if (chartData && chartData.length > 0) {
        const newChartData = getLimitedData(
          chartData,
          GlobalConst.analyticChart.CHART_COUNT,
        );
        setPairChartData(newChartData);
      }
    }
    fetchPairChartData();
  }, [pairAddress, durationIndex]);

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
            {currentPercent && currentData ? (
              <>
                <Box display='flex' alignItems='center'>
                  <Typography
                    variant='h4'
                    style={{ color: palette.text.primary }}
                  >
                    $
                    {currentData > 100000
                      ? formatCompact(currentData)
                      : currentData.toLocaleString()}
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
                chartIndex === CHART_FEES ? palette.grey.A400 : 'transparent'
              }
              className={classes.chartType}
              onClick={() => setChartIndex(CHART_FEES)}
            >
              <Typography variant='caption'>Fees</Typography>
            </Box>
          </Box>
          <Box mt={1.5} display='flex' alignItems='center'>
            <Box
              className={classes.chartType}
              bgcolor={
                durationIndex === GlobalConst.analyticChart.ONE_MONTH_CHART
                  ? palette.grey.A400
                  : 'transparent'
              }
              onClick={() =>
                setDurationIndex(GlobalConst.analyticChart.ONE_MONTH_CHART)
              }
            >
              <Typography variant='caption'>1M</Typography>
            </Box>
            <Box
              className={classes.chartType}
              ml={0.5}
              bgcolor={
                durationIndex === GlobalConst.analyticChart.THREE_MONTH_CHART
                  ? palette.grey.A400
                  : 'transparent'
              }
              onClick={() =>
                setDurationIndex(GlobalConst.analyticChart.THREE_MONTH_CHART)
              }
            >
              <Typography variant='caption'>3M</Typography>
            </Box>
            <Box
              className={classes.chartType}
              ml={0.5}
              bgcolor={
                durationIndex === GlobalConst.analyticChart.ONE_YEAR_CHART
                  ? palette.grey.A400
                  : 'transparent'
              }
              onClick={() =>
                setDurationIndex(GlobalConst.analyticChart.ONE_YEAR_CHART)
              }
            >
              <Typography variant='caption'>1Y</Typography>
            </Box>
            <Box
              className={classes.chartType}
              ml={0.5}
              bgcolor={
                durationIndex === GlobalConst.analyticChart.ALL_CHART
                  ? palette.grey.A400
                  : 'transparent'
              }
              onClick={() =>
                setDurationIndex(GlobalConst.analyticChart.ALL_CHART)
              }
            >
              <Typography variant='caption'>All</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box mt={2} width={1}>
        {chartData && pairChartData ? (
          <AreaChart
            data={chartData}
            yAxisValues={yAxisValues}
            dates={pairChartData.map((value: any) =>
              moment(value.date * 1000)
                .add(1, 'day')
                .unix(),
            )}
            width='100%'
            height={240}
            categories={getChartDates(pairChartData, durationIndex)}
          />
        ) : (
          <Skeleton variant='rect' width='100%' height={217} />
        )}
      </Box>
    </>
  );
};

export default AnalyticsPairChart;
