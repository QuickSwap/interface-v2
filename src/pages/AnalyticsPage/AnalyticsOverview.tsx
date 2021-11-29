import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowForwardIos } from '@material-ui/icons';
import dayjs from 'dayjs';
import moment from 'moment';
import utc from 'dayjs/plugin/utc';
import { useGlobalChartData, useTopTokens } from 'state/application/hooks';
import { formatCompact, getChartData, getEthPrice, getTopTokens } from 'utils';
import { AreaChart, BarChart } from 'components';
import AnalyticsInfo from './AnalyticsInfo';
import TokensTable from 'components/TokensTable';

dayjs.extend(utc);

const useStyles = makeStyles(({}) => ({
  panel: {
    background: '#1b1d26',
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
      color: '#ebecf2',
    },
  },
  headingWrapper: {
    display: 'flex',
    alignItems: 'center',
    '& h6': {
      color: '#626680',
    },
    '& svg': {
      height: 16,
      marginLeft: 2,
      color: '#3d71ff',
    },
  },
}));

interface AnalyticsOverViewProps {
  showAllTokens: () => void;
  showAllPairs: () => void;
}

const AnalyticsOverview: React.FC<AnalyticsOverViewProps> = ({
  showAllTokens,
  showAllPairs,
}) => {
  const classes = useStyles();
  const [volumeIndex, setVolumeIndex] = useState(0);
  const [selectedVolumeIndex, setSelectedVolumeIndex] = useState(-1);

  const { globalChartData, updateGlobalChartData } = useGlobalChartData();
  const { topTokens, updateTopTokens } = useTopTokens();

  const utcEndTime = dayjs.utc();
  const startTime =
    utcEndTime
      .subtract(2, 'month')
      .endOf('day')
      .unix() - 1;

  useEffect(() => {
    const fetchChartData = async () => {
      const [newChartData, newWeeklyData] = await getChartData(startTime);
      if (newChartData && newWeeklyData) {
        updateGlobalChartData({ day: newChartData, week: newWeeklyData });
        setSelectedVolumeIndex(newChartData.length - 1);
      }
    };
    const fetchTopTokens = async () => {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const topTokensData = await getTopTokens(newPrice, oneDayPrice, 8);
      if (topTokensData) {
        updateTopTokens({ data: topTokensData });
      }
    };
    fetchChartData();
    fetchTopTokens();
  }, [startTime, updateGlobalChartData]);

  const liquidityDates = useMemo(() => {
    if (globalChartData) {
      const dates: string[] = [];
      globalChartData.day.forEach((value: any, ind: number) => {
        const month = moment(Number(value.date) * 1000).format('MMM');
        const monthLastDate =
          ind > 0
            ? moment(Number(globalChartData.day[ind - 1].date) * 1000).format(
                'MMM',
              )
            : '';
        if (monthLastDate !== month) {
          dates.push(month);
        }
        const dateStr = moment(Number(value.date) * 1000).format('D');
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
        const month = moment(Number(value.date) * 1000).format('MMM');
        const monthLastDate =
          ind > 0
            ? moment(Number(globalChartData.week[ind - 1].date) * 1000).format(
                'MMM',
              )
            : '';
        if (monthLastDate !== month) {
          dates.push(month);
        }
        const dateStr = moment(Number(value.date) * 1000).format('D');
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

  const liquidityPercent = useMemo(() => {
    if (globalChartData) {
      const currentLiquidity = Number(
        globalChartData.day[globalChartData.day.length - 1].totalLiquidityUSD,
      );
      const prevLiquidity = Number(
        globalChartData.day[globalChartData.day.length - 2].totalLiquidityUSD,
      );
      if (prevLiquidity > 0) {
        return (currentLiquidity / prevLiquidity) * 100 - 100;
      } else {
        return 0;
      }
    } else {
      return 0;
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
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    } else {
      return 0;
    }
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
          <Box className={classes.panel} padding={3} width={1}>
            <Typography
              variant='caption'
              style={{ color: '#626680', fontWeight: 'bold' }}
            >
              LIQUIDITY
            </Typography>
            {globalChartData ? (
              <>
                <Box mt={0.5} display='flex' alignItems='center'>
                  <Typography variant='h5' style={{ color: '#ebecf2' }}>
                    $
                    {formatCompact(
                      globalChartData.day[globalChartData.day.length - 1]
                        .totalLiquidityUSD,
                    )}
                  </Typography>
                  <Box
                    ml={1}
                    height={23}
                    px={1}
                    borderRadius={40}
                    bgcolor={
                      liquidityPercent > 0
                        ? 'rgba(15, 198, 121, 0.1)'
                        : liquidityPercent < 0
                        ? 'rgba(255, 82, 82, 0.1)'
                        : 'rgba(99, 103, 128, 0.1)'
                    }
                  >
                    <Typography
                      style={{
                        color:
                          liquidityPercent > 0
                            ? '#0fc679'
                            : liquidityPercent < 0
                            ? '#ff5252'
                            : '#636780',
                      }}
                      variant='caption'
                    >
                      {`${liquidityPercent > 0 ? '+' : ''}
                      ${liquidityPercent.toLocaleString()}`}
                      %
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography style={{ color: '#626680' }} variant='caption'>
                    {moment(
                      globalChartData.day[globalChartData.day.length - 1].date *
                        1000,
                    ).format('MMM DD, YYYY')}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <AreaChart
                    data={globalChartData.day.map((value: any) =>
                      Number(value.totalLiquidityUSD),
                    )}
                    yAxisValues={yAxisValues}
                    dates={globalChartData.day.map((value: any) => value.date)}
                    width='100%'
                    height={240}
                    categories={liquidityDates}
                  />
                </Box>
              </>
            ) : (
              <Box mt={2}>
                <Skeleton variant='rect' width='100%' height={72} />
              </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box className={classes.panel} padding={3} width={1}>
            <Box display='flex' justifyContent='space-between'>
              <Typography
                variant='caption'
                style={{ color: '#626680', fontWeight: 'bold' }}
              >
                VOLUME
              </Typography>
              <Box display='flex' alignItems='center'>
                <Box
                  className={classes.volumeType}
                  bgcolor={volumeIndex === 0 ? '#3e4252' : 'transparent'}
                  onClick={() => setVolumeIndex(0)}
                >
                  <Typography variant='caption'>D</Typography>
                </Box>
                <Box
                  className={classes.volumeType}
                  ml={0.5}
                  bgcolor={volumeIndex === 1 ? '#3e4252' : 'transparent'}
                  onClick={() => setVolumeIndex(1)}
                >
                  <Typography variant='caption'>W</Typography>
                </Box>
              </Box>
            </Box>
            {globalChartData && selectedVolumeIndex > -1 ? (
              <>
                <Box mt={0.5} display='flex' alignItems='center'>
                  <Typography variant='h5' style={{ color: '#ebecf2' }}>
                    $
                    {formatCompact(
                      globalChartData.day[selectedVolumeIndex].dailyVolumeUSD,
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
                            ? '#0fc679'
                            : volumePercent < 0
                            ? '#ff5252'
                            : '#636780',
                      }}
                      variant='caption'
                    >
                      {`${volumePercent > 0 ? '+' : ''}
                      ${volumePercent.toLocaleString()}`}
                      %
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography style={{ color: '#626680' }} variant='caption'>
                    {moment(
                      globalChartData.day[selectedVolumeIndex].date * 1000,
                    ).format('MMM DD, YYYY')}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <BarChart
                    height={188.97}
                    data={barChartData}
                    categories={
                      volumeIndex === 1 ? liquidityWeeks : liquidityDates
                    }
                    onHover={(ind) => setSelectedVolumeIndex(ind)}
                  />
                </Box>
              </>
            ) : (
              <Box mt={2}>
                <Skeleton variant='rect' width='100%' height={72} />
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
      <Box mt={4}>
        <AnalyticsInfo />
      </Box>
      <Box mt={4}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box className={classes.headingWrapper}>
            <Typography variant='h6'>Top Tokens</Typography>
          </Box>
          <Box
            className={classes.headingWrapper}
            style={{ cursor: 'pointer' }}
            onClick={showAllTokens}
          >
            <Typography variant='h6'>See All</Typography>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} paddingX={4} paddingY={3} className={classes.panel}>
        {topTokens && <TokensTable data={topTokens} />}
      </Box>
      <Box mt={4}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box className={classes.headingWrapper}>
            <Typography variant='h6'>Top Pairs</Typography>
          </Box>
          <Box
            className={classes.headingWrapper}
            style={{ cursor: 'pointer' }}
            onClick={showAllPairs}
          >
            <Typography variant='h6'>See All</Typography>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} paddingX={4} paddingY={3} className={classes.panel}></Box>
    </>
  );
};

export default AnalyticsOverview;
