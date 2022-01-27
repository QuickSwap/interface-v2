import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import { useGlobalData } from 'state/application/hooks';
import {
  formatCompact,
  getChartData,
  formatDateFromTimeStamp,
  getPriceColor,
  getChartDates,
  getChartStartTime,
  getLimitedData,
} from 'utils';
import { BarChart } from 'components';
import { GlobalConst } from 'constants/index';

const useStyles = makeStyles(({ palette }) => ({
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
}));

const DAY_VOLUME = 0;
const WEEK_VOLUME = 1;

const AnalyticsVolumeChart: React.FC = () => {
  const classes = useStyles();
  const { palette } = useTheme();
  const [volumeIndex, setVolumeIndex] = useState(DAY_VOLUME);
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.utils.ONE_MONTH_CHART,
  );
  const [selectedVolumeIndex, setSelectedVolumeIndex] = useState(-1);
  const { globalData } = useGlobalData();
  const [globalChartData, updateGlobalChartData] = useState<any>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      updateGlobalChartData(null);
      const [newChartData, newWeeklyData] = await getChartData(
        durationIndex === GlobalConst.utils.ALL_CHART
          ? 0
          : getChartStartTime(durationIndex),
      );
      if (newChartData && newWeeklyData) {
        const dayItems = getLimitedData(
          newChartData,
          GlobalConst.utils.CHART_COUNT,
        );
        const weekItems = getLimitedData(
          newWeeklyData,
          GlobalConst.utils.CHART_COUNT,
        );
        updateGlobalChartData({ day: dayItems, week: weekItems });
      }
    };
    fetchChartData();
  }, [updateGlobalChartData, durationIndex]);

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
        if (
          durationIndex === GlobalConst.utils.ONE_MONTH_CHART ||
          durationIndex === GlobalConst.utils.THREE_MONTH_CHART
        ) {
          const dateStr = formatDateFromTimeStamp(Number(value.date), 'D');
          if (Number(dateStr) % 2 === 0) {
            //Select dates(one date per 2 weeks) for x axis values of volume chart on week mode
            dates.push(dateStr);
          }
        }
      });
      return dates;
    } else {
      return [];
    }
  }, [globalChartData, durationIndex]);

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

  const volumePercentColor = getPriceColor(Number(volumePercent), palette);

  return (
    <>
      <Box>
        <Box display='flex' justifyContent='space-between'>
          <Typography
            variant='caption'
            style={{ color: palette.text.disabled, fontWeight: 'bold' }}
          >
            VOLUME {selectedVolumeIndex === -1 ? '(24hr)' : ''}
          </Typography>
          <Box display='flex' alignItems='center'>
            <Box
              className={classes.volumeType}
              bgcolor={
                volumeIndex === DAY_VOLUME ? palette.grey.A400 : 'transparent'
              }
              onClick={() => setVolumeIndex(DAY_VOLUME)}
            >
              <Typography variant='caption'>D</Typography>
            </Box>
            <Box
              className={classes.volumeType}
              ml={0.5}
              bgcolor={
                volumeIndex === WEEK_VOLUME ? palette.grey.A400 : 'transparent'
              }
              onClick={() => setVolumeIndex(WEEK_VOLUME)}
            >
              <Typography variant='caption'>W</Typography>
            </Box>
          </Box>
        </Box>
        <Box
          mt={0.5}
          display='flex'
          alignItems='flex-start'
          justifyContent='space-between'
        >
          {globalChartData && globalData ? (
            <Box flex={1} mr={2}>
              <Box display='flex' alignItems='center'>
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
              <Box height={21}>
                <Typography
                  style={{ color: palette.text.disabled }}
                  variant='caption'
                >
                  {volumeDates}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box mr={2} flex={1}>
              <Skeleton variant='rect' width='100%' height={24} />
            </Box>
          )}
          <Box display='flex' alignItems='center'>
            <Box
              className={classes.volumeType}
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
              className={classes.volumeType}
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
              className={classes.volumeType}
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
              className={classes.volumeType}
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
      <Box mt={2}>
        {globalChartData ? (
          <BarChart
            height={200}
            data={barChartData}
            categories={
              volumeIndex === WEEK_VOLUME
                ? liquidityWeeks
                : getChartDates(globalChartData.day, durationIndex)
            }
            onHover={(ind) => setSelectedVolumeIndex(ind)}
            onMouseLeave={() => {
              setSelectedVolumeIndex(-1);
            }}
          />
        ) : (
          <Skeleton variant='rect' width='100%' height={250} />
        )}
      </Box>
    </>
  );
};

export default AnalyticsVolumeChart;
