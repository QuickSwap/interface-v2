import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, useMediaQuery } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowForwardIos } from '@material-ui/icons';
import dayjs from 'dayjs';
import moment from 'moment';
import utc from 'dayjs/plugin/utc';
import {
  useGlobalData,
  useGlobalChartData,
  useTopTokens,
  useTopPairs,
} from 'state/application/hooks';
import {
  formatCompact,
  getChartData,
  getEthPrice,
  getTopPairs,
  getTopTokens,
  getGlobalData,
  getBulkPairData,
} from 'utils';
import { AreaChart, BarChart, TokensTable, PairTable } from 'components';
import AnalyticsInfo from './AnalyticsInfo';

dayjs.extend(utc);

const useStyles = makeStyles(({ palette }) => ({
  panel: {
    background: palette.grey.A700,
    borderRadius: 20,
  },
  volumeType: {
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
  headingWrapper: {
    display: 'flex',
    alignItems: 'center',
    '& h6': {
      color: palette.text.disabled,
    },
    '& svg': {
      height: 16,
      marginLeft: 2,
      color: '#3d71ff',
    },
  },
}));

const AnalyticsOverview: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [volumeIndex, setVolumeIndex] = useState(0);
  const [selectedVolumeIndex, setSelectedVolumeIndex] = useState(-1);
  const { globalData, updateGlobalData } = useGlobalData();
  const { globalChartData, updateGlobalChartData } = useGlobalChartData();
  const { topTokens, updateTopTokens } = useTopTokens();
  const { topPairs, updateTopPairs } = useTopPairs();

  useEffect(() => {
    const fetchGlobalData = async () => {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const globalData = await getGlobalData(newPrice, oneDayPrice);
      if (globalData) {
        updateGlobalData({ data: globalData });
      }
    };

    const fetchChartData = async () => {
      const utcEndTime = dayjs.utc();
      const startTime = utcEndTime
        .subtract(2, 'month')
        .endOf('day')
        .unix();
      const [newChartData, newWeeklyData] = await getChartData(startTime);
      if (newChartData && newWeeklyData) {
        updateGlobalChartData({ day: newChartData, week: newWeeklyData });
      }
    };
    const fetchTopTokens = async () => {
      updateTopTokens(null);
      const [newPrice, oneDayPrice] = await getEthPrice();
      const topTokensData = await getTopTokens(newPrice, oneDayPrice, 10);
      if (topTokensData) {
        updateTopTokens(topTokensData);
      }
    };
    const fetchTopPairs = async () => {
      updateTopPairs(null);
      const [newPrice] = await getEthPrice();
      const pairs = await getTopPairs(10);
      const formattedPairs = pairs
        ? pairs.map((pair: any) => {
            return pair.id;
          })
        : [];
      const pairData = await getBulkPairData(formattedPairs, newPrice);
      if (pairData) {
        updateTopPairs(pairData);
      }
    };
    fetchChartData();
    fetchGlobalData();
    if (!topTokens || topTokens.length < 10) {
      fetchTopTokens();
    }
    if (!topPairs || topPairs.length < 10) {
      fetchTopPairs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    updateGlobalData,
    updateGlobalChartData,
    updateTopTokens,
    updateTopPairs,
  ]);

  const liquidityDates = useMemo(() => {
    if (globalChartData) {
      const dates: string[] = [];
      globalChartData.day.forEach((value: any, ind: number) => {
        const month = moment(Number(value.date) * 1000)
          .add('1', 'day')
          .format('MMM');
        const monthLastDate =
          ind > 0
            ? moment(Number(globalChartData.day[ind - 1].date) * 1000)
                .add('1', 'day')
                .format('MMM')
            : '';
        if (monthLastDate !== month) {
          dates.push(month);
        }
        const dateStr = moment(Number(value.date) * 1000)
          .add('1', 'day')
          .format('D');
        if (Number(dateStr) % 7 === 0) {
          dates.push(dateStr);
        }
      });
      return dates;
    } else {
      return [];
    }
  }, [globalChartData]);

  const liquidityWeeks = useMemo(() => {
    if (globalChartData) {
      const dates: string[] = [];
      globalChartData.week.forEach((value: any, ind: number) => {
        const month = moment(Number(value.date) * 1000)
          .add('1', 'day')
          .format('MMM');
        const monthLastDate =
          ind > 0
            ? moment(Number(globalChartData.week[ind - 1].date) * 1000)
                .add('1', 'day')
                .format('MMM')
            : '';
        if (monthLastDate !== month) {
          dates.push(month);
        }
        const dateStr = moment(Number(value.date) * 1000)
          .add('1', 'day')
          .format('D');
        if (Number(dateStr) % 2 === 0) {
          dates.push(dateStr);
        }
      });
      return dates;
    } else {
      return [];
    }
  }, [globalChartData]);

  const yAxisValues = useMemo(() => {
    if (globalChartData) {
      const dailyVolumes: number[] = globalChartData.day.map((value: any) =>
        Number(value.totalLiquidityUSD),
      );
      const minVolume =
        Math.floor(Math.min(...dailyVolumes) / 20000000) * 20000000;
      const maxVolume =
        Math.ceil(Math.max(...dailyVolumes) / 20000000) * 20000000;
      const values = [];
      for (let i = maxVolume / 20000000; i >= minVolume / 20000000; i--) {
        values.push(i * 20000000);
      }
      return values;
    } else {
      return undefined;
    }
  }, [globalChartData]);

  const volumePercent = useMemo(() => {
    if (globalChartData && selectedVolumeIndex > 0) {
      const volumeData =
        volumeIndex === 1 ? globalChartData.week : globalChartData.day;
      if (volumeData.length > 1) {
        const currentVolume = Number(
          volumeIndex === 1
            ? globalChartData.week[
                Math.min(selectedVolumeIndex, globalChartData.week.length - 1)
              ].weeklyVolumeUSD
            : globalChartData.day[
                Math.min(selectedVolumeIndex, globalChartData.day.length - 1)
              ].dailyVolumeUSD,
        );
        const prevVolume = Number(
          volumeIndex === 1
            ? globalChartData.week[
                Math.min(selectedVolumeIndex, globalChartData.week.length - 1) -
                  1
              ].weeklyVolumeUSD
            : globalChartData.day[
                Math.min(selectedVolumeIndex, globalChartData.day.length - 1) -
                  1
              ].dailyVolumeUSD,
        );
        if (prevVolume > 0) {
          return (currentVolume / prevVolume) * 100 - 100;
        }
        return 0;
      }
      return 0;
    } else {
      if (globalData && selectedVolumeIndex === -1) {
        return volumeIndex === 0
          ? globalData.volumeChangeUSD
          : globalData.weeklyVolumeChange;
      }
      return 0;
    }
  }, [globalChartData, globalData, selectedVolumeIndex, volumeIndex]);

  const volumeDates = useMemo(() => {
    if (selectedVolumeIndex > -1) {
      if (volumeIndex === 0) {
        return moment(globalChartData.day[selectedVolumeIndex].date * 1000)
          .add(1, 'day')
          .format('MMM DD, YYYY');
      } else {
        const weekStart =
          selectedVolumeIndex > 0
            ? moment(
                globalChartData.week[selectedVolumeIndex - 1].date * 1000,
              ).add(2, 'day')
            : moment(globalChartData.week[0].date * 1000).subtract(5, 'day');
        const weekEnd = moment(
          globalChartData.week[selectedVolumeIndex].date * 1000,
        ).add(1, 'day');
        return `${weekStart.format('MMM DD, YYYY')} - ${weekEnd.format(
          'MMM DD, YYYY',
        )}`;
      }
    }
    return '';
  }, [globalChartData, selectedVolumeIndex, volumeIndex]);

  const barChartData = useMemo(() => {
    if (globalChartData) {
      return volumeIndex === 1
        ? globalChartData.week.map((value: any) => value.weeklyVolumeUSD)
        : globalChartData.day.map((value: any) => value.dailyVolumeUSD);
    } else {
      return [];
    }
  }, [globalChartData, volumeIndex]);

  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={6}>
          <Box className={classes.panel} padding={isMobile ? 1.5 : 3} width={1}>
            <Typography
              variant='caption'
              style={{ color: palette.text.disabled, fontWeight: 'bold' }}
            >
              LIQUIDITY
            </Typography>
            {globalData ? (
              <Box mt={0.5} display='flex' alignItems='center'>
                <Typography
                  variant='h5'
                  style={{ color: palette.text.primary }}
                >
                  ${formatCompact(globalData.totalLiquidityUSD)}
                </Typography>
                <Box
                  ml={1}
                  height={23}
                  px={1}
                  borderRadius={40}
                  bgcolor={
                    globalData.liquidityChangeUSD > 0
                      ? 'rgba(15, 198, 121, 0.1)'
                      : globalData.liquidityChangeUSD < 0
                      ? 'rgba(255, 82, 82, 0.1)'
                      : 'rgba(99, 103, 128, 0.1)'
                  }
                >
                  <Typography
                    style={{
                      color:
                        globalData.liquidityChangeUSD > 0
                          ? palette.success.main
                          : globalData.liquidityChangeUSD < 0
                          ? palette.error.main
                          : palette.text.hint,
                    }}
                    variant='caption'
                  >
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
              <Typography
                style={{ color: palette.text.disabled }}
                variant='caption'
              >
                {moment().format('MMM DD, YYYY')}
              </Typography>
            </Box>
            <Box mt={2}>
              {globalChartData ? (
                <AreaChart
                  data={globalChartData.day.map((value: any) =>
                    Number(value.totalLiquidityUSD),
                  )}
                  yAxisValues={yAxisValues}
                  dates={globalChartData.day.map((value: any) =>
                    moment(value.date * 1000)
                      .add(1, 'day')
                      .unix(),
                  )}
                  width='100%'
                  height={240}
                  categories={liquidityDates}
                />
              ) : (
                <Skeleton variant='rect' width='100%' height={72} />
              )}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box
            className={classes.panel}
            padding={isMobile ? 1.5 : 3}
            width={1}
            height={1}
            display='flex'
            flexDirection='column'
            justifyContent='space-between'
          >
            <Box>
              <Box display='flex' justifyContent='space-between'>
                <Typography
                  variant='caption'
                  style={{ color: palette.text.disabled, fontWeight: 'bold' }}
                >
                  VOLUME
                </Typography>
                <Box display='flex' alignItems='center'>
                  <Box
                    className={classes.volumeType}
                    bgcolor={
                      volumeIndex === 0 ? palette.grey.A400 : 'transparent'
                    }
                    onClick={() => setVolumeIndex(0)}
                  >
                    <Typography variant='caption'>D</Typography>
                  </Box>
                  <Box
                    className={classes.volumeType}
                    ml={0.5}
                    bgcolor={
                      volumeIndex === 1 ? palette.grey.A400 : 'transparent'
                    }
                    onClick={() => setVolumeIndex(1)}
                  >
                    <Typography variant='caption'>W</Typography>
                  </Box>
                </Box>
              </Box>
              {globalChartData && globalData ? (
                <>
                  <Box mt={0.5} display='flex' alignItems='center'>
                    <Typography
                      variant='h5'
                      style={{ color: palette.text.primary }}
                    >
                      $
                      {formatCompact(
                        selectedVolumeIndex > -1
                          ? volumeIndex === 0
                            ? globalChartData.day[selectedVolumeIndex]
                                .dailyVolumeUSD
                            : globalChartData.week[selectedVolumeIndex]
                                .weeklyVolumeUSD
                          : volumeIndex === 0
                          ? globalData.oneDayVolumeUSD
                          : globalData.oneWeekVolume,
                      )}
                    </Typography>
                    <Box
                      ml={1}
                      height={23}
                      px={1}
                      borderRadius={40}
                      bgcolor={
                        volumePercent > 0
                          ? 'rgba(15, 198, 121, 0.1)'
                          : volumePercent < 0
                          ? 'rgba(255, 82, 82, 0.1)'
                          : 'rgba(99, 103, 128, 0.1)'
                      }
                    >
                      <Typography
                        style={{
                          color:
                            volumePercent > 0
                              ? palette.success.main
                              : volumePercent < 0
                              ? palette.error.main
                              : palette.text.hint,
                        }}
                        variant='caption'
                      >
                        {`${volumePercent > 0 ? '+' : ''}
                      ${volumePercent.toLocaleString()}`}
                        %
                      </Typography>
                    </Box>
                  </Box>
                  {selectedVolumeIndex > -1 && (
                    <Typography
                      style={{ color: palette.text.disabled }}
                      variant='caption'
                    >
                      {volumeDates}
                    </Typography>
                  )}
                </>
              ) : (
                <Box my={0.5}>
                  <Skeleton variant='rect' width='100%' height={24} />
                </Box>
              )}
            </Box>
            <Box mt={2}>
              {globalChartData ? (
                <BarChart
                  height={188.97}
                  data={barChartData}
                  categories={
                    volumeIndex === 1 ? liquidityWeeks : liquidityDates
                  }
                  onHover={(ind) => setSelectedVolumeIndex(ind)}
                  onMouseLeave={() => {
                    setSelectedVolumeIndex(-1);
                  }}
                />
              ) : (
                <Skeleton variant='rect' width='100%' height={72} />
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Box
          display='flex'
          flexWrap='wrap'
          paddingX={4}
          paddingY={1.5}
          className={classes.panel}
        >
          {globalData ? (
            <AnalyticsInfo data={globalData} />
          ) : (
            <Skeleton width='100%' height={20} />
          )}
        </Box>
      </Box>
      <Box mt={4}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box className={classes.headingWrapper}>
            <Typography variant='h6'>Top Tokens</Typography>
          </Box>
          <Box
            className={classes.headingWrapper}
            style={{ cursor: 'pointer' }}
            onClick={() => history.push(`/analytics?tabIndex=1`)}
          >
            <Typography variant='h6'>See All</Typography>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box
        mt={3}
        paddingX={isMobile ? 1.5 : 4}
        paddingY={isMobile ? 1.5 : 3}
        className={classes.panel}
      >
        {topTokens ? (
          <TokensTable data={topTokens} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
      <Box mt={4}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box className={classes.headingWrapper}>
            <Typography variant='h6'>Top Pairs</Typography>
          </Box>
          <Box
            className={classes.headingWrapper}
            style={{ cursor: 'pointer' }}
            onClick={() => history.push(`/analytics?tabIndex=2`)}
          >
            <Typography variant='h6'>See All</Typography>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box
        mt={3}
        paddingX={isMobile ? 1.5 : 4}
        paddingY={isMobile ? 1.5 : 3}
        className={classes.panel}
      >
        {topPairs ? (
          <PairTable data={topPairs} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </>
  );
};

export default AnalyticsOverview;
