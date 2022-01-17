import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, useMediaQuery } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowForwardIos } from '@material-ui/icons';
import dayjs from 'dayjs';
import moment from 'moment';
import utc from 'dayjs/plugin/utc';
import { useGlobalData, useGlobalChartData } from 'state/application/hooks';
import {
  formatCompact,
  getChartData,
  getEthPrice,
  getTopPairs,
  getTopTokens,
  getGlobalData,
  getBulkPairData,
  formatDateFromTimeStamp,
  getPriceColor,
} from 'utils';
import { GlobalConst } from 'constants/index';
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

const DAY_VOLUME = 0;
const WEEK_VOLUME = 1;

const AnalyticsOverview: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [volumeIndex, setVolumeIndex] = useState(DAY_VOLUME);
  const [selectedVolumeIndex, setSelectedVolumeIndex] = useState(-1);
  const { globalData, updateGlobalData } = useGlobalData();
  const { globalChartData, updateGlobalChartData } = useGlobalChartData();
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);

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
      const topTokensData = await getTopTokens(
        newPrice,
        oneDayPrice,
        GlobalConst.utils.ROWSPERPAGE,
      );
      if (topTokensData) {
        updateTopTokens(topTokensData);
      }
    };
    const fetchTopPairs = async () => {
      updateTopPairs(null);
      const [newPrice] = await getEthPrice();
      const pairs = await getTopPairs(GlobalConst.utils.ROWSPERPAGE);
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
    fetchTopTokens();
    fetchTopPairs();
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
        const month = formatDateFromTimeStamp(Number(value.date), 'MMM');
        const monthLastDate =
          ind > 0
            ? formatDateFromTimeStamp(
                Number(globalChartData.day[ind - 1].date),
                'MMM',
              )
            : '';
        if (monthLastDate !== month) {
          dates.push(month);
        }
        const dateStr = formatDateFromTimeStamp(Number(value.date), 'D');
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
        const month = formatDateFromTimeStamp(Number(value.date), 'MMM');
        const monthLastDate =
          ind > 0
            ? formatDateFromTimeStamp(
                Number(globalChartData.week[ind - 1].date),
                'MMM',
              )
            : '';
        if (monthLastDate !== month) {
          dates.push(month);
        }
        const dateStr = formatDateFromTimeStamp(Number(value.date), 'D');
        if (Number(dateStr) % 2 === 0) {
          //Select dates(one date per 2 weeks) for x axis values of volume chart on week mode
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
        volumeIndex === WEEK_VOLUME
          ? globalChartData.week
          : globalChartData.day;
      if (volumeData.length > 1) {
        const currentVolume = Number(
          volumeIndex === WEEK_VOLUME
            ? globalChartData.week[
                Math.min(selectedVolumeIndex, globalChartData.week.length - 1)
              ].weeklyVolumeUSD
            : globalChartData.day[
                Math.min(selectedVolumeIndex, globalChartData.day.length - 1)
              ].dailyVolumeUSD,
        );
        const prevVolume = Number(
          volumeIndex === WEEK_VOLUME
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
        return volumeIndex === DAY_VOLUME
          ? globalData.volumeChangeUSD
          : globalData.weeklyVolumeChange;
      }
      return 0;
    }
  }, [globalChartData, globalData, selectedVolumeIndex, volumeIndex]);

  const volumeDates = useMemo(() => {
    if (selectedVolumeIndex > -1) {
      if (volumeIndex === DAY_VOLUME) {
        return formatDateFromTimeStamp(
          Number(globalChartData.day[selectedVolumeIndex].date),
          'MMM DD, YYYY',
        );
      } else {
        const weekStart = formatDateFromTimeStamp(
          Number(
            globalChartData.week[Math.max(0, selectedVolumeIndex - 1)].date,
          ),
          'MMM DD, YYYY',
          selectedVolumeIndex > 0 ? 2 : -5,
        );
        const weekEnd = formatDateFromTimeStamp(
          Number(globalChartData.week[selectedVolumeIndex].date),
          'MMM DD, YYYY',
        );
        return `${weekStart} - ${weekEnd}`;
      }
    }
    return '';
  }, [globalChartData, selectedVolumeIndex, volumeIndex]);

  const barChartData = useMemo(() => {
    if (globalChartData) {
      return volumeIndex === WEEK_VOLUME
        ? globalChartData.week.map((value: any) => value.weeklyVolumeUSD)
        : globalChartData.day.map((value: any) => value.dailyVolumeUSD);
    } else {
      return [];
    }
  }, [globalChartData, volumeIndex]);

  const liquidityPercentColor = getPriceColor(
    globalData ? Number(globalData.liquidityChangeUSD) : 0,
    palette,
  );

  const volumePercentColor = getPriceColor(Number(volumePercent), palette);

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
                      volumeIndex === DAY_VOLUME
                        ? palette.grey.A400
                        : 'transparent'
                    }
                    onClick={() => setVolumeIndex(DAY_VOLUME)}
                  >
                    <Typography variant='caption'>D</Typography>
                  </Box>
                  <Box
                    className={classes.volumeType}
                    ml={0.5}
                    bgcolor={
                      volumeIndex === WEEK_VOLUME
                        ? palette.grey.A400
                        : 'transparent'
                    }
                    onClick={() => setVolumeIndex(WEEK_VOLUME)}
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
                          ? volumeIndex === DAY_VOLUME
                            ? globalChartData.day[selectedVolumeIndex]
                                .dailyVolumeUSD
                            : globalChartData.week[selectedVolumeIndex]
                                .weeklyVolumeUSD
                          : volumeIndex === DAY_VOLUME
                          ? globalData.oneDayVolumeUSD
                          : globalData.oneWeekVolume,
                      )}
                    </Typography>
                    <Box
                      ml={1}
                      height={23}
                      px={1}
                      borderRadius={40}
                      bgcolor={volumePercentColor.bgColor}
                      color={volumePercentColor.textColor}
                    >
                      <Typography variant='caption'>
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
                    volumeIndex === WEEK_VOLUME
                      ? liquidityWeeks
                      : liquidityDates
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
