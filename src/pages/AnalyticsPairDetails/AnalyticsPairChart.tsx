import React, { useState, useEffect, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
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
  getYAXISValuesAnalytics,
} from 'utils';
import { AreaChart, ChartType } from 'components';
import { GlobalConst, GlobalData } from 'constants/index';

const CHART_VOLUME = 0;
const CHART_LIQUIDITY = 1;
const CHART_FEES = 2;

const AnalyticsPairChart: React.FC<{ pairData: any }> = ({ pairData }) => {
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
  const chartIndexes = [CHART_VOLUME, CHART_LIQUIDITY, CHART_FEES];
  const chartIndexTexts = ['Volume', 'Liquidity', 'Fees'];

  const chartData = useMemo(() => {
    if (!pairChartData) return;
    return pairChartData.map((item: any) => {
      switch (chartIndex) {
        case CHART_VOLUME:
          return Number(item.dailyVolumeUSD);
        case CHART_LIQUIDITY:
          return Number(item.reserveUSD);
        case CHART_FEES:
          return Number(item.dailyVolumeUSD) * GlobalConst.utils.FEEPERCENT;
        default:
          return;
      }
    });
  }, [pairChartData, chartIndex]);

  const currentData = useMemo(() => {
    if (!pairData) return;
    switch (chartIndex) {
      case CHART_VOLUME:
        return pairData.oneDayVolumeUSD;
      case CHART_LIQUIDITY:
        return pairData.reserveUSD ?? pairData.trackedReserveUSD;
      case CHART_FEES:
        return fees;
      default:
        return;
    }
  }, [pairData, chartIndex, fees]);

  const currentPercent = useMemo(() => {
    if (!pairData) return;
    switch (chartIndex) {
      case CHART_VOLUME:
        return pairData.volumeChangeUSD;
      case CHART_LIQUIDITY:
        return pairData.liquidityChangeUSD;
      case CHART_FEES:
        return usingUtVolume
          ? pairData.volumeChangeUntracked
          : pairData.volumeChangeUSD;
      default:
        return;
    }
  }, [pairData, chartIndex, usingUtVolume]);

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
          <caption>{chartIndexTexts[chartIndex]}</caption>
          <Box mt={1}>
            {currentPercent && currentData ? (
              <>
                <Box display='flex' alignItems='center'>
                  <h4>
                    $
                    {currentData > 100000
                      ? formatCompact(currentData)
                      : currentData.toLocaleString()}
                  </h4>
                  <Box
                    className='priceChangeWrapper'
                    ml={1}
                    bgcolor={currentPercentColor.bgColor}
                    color={currentPercentColor.textColor}
                  >
                    <small>{getFormattedPrice(Number(currentPercent))}%</small>
                  </Box>
                </Box>
                <Box>
                  <caption>{moment().format('MMM DD, YYYY')}</caption>
                </Box>
              </>
            ) : (
              <Skeleton variant='rect' width='120px' height='30px' />
            )}
          </Box>
        </Box>
        <Box display='flex' flexDirection='column' alignItems='flex-end'>
          <Box mt={1.5}>
            <ChartType
              chartTypes={chartIndexes}
              typeTexts={chartIndexTexts}
              chartType={chartIndex}
              setChartType={setChartIndex}
            />
          </Box>
          <Box mt={1.5}>
            <ChartType
              chartTypes={GlobalData.analytics.CHART_DURATIONS}
              typeTexts={GlobalData.analytics.CHART_DURATION_TEXTS}
              chartType={durationIndex}
              setChartType={setDurationIndex}
            />
          </Box>
        </Box>
      </Box>
      <Box mt={2} width={1}>
        {chartData && pairChartData ? (
          <AreaChart
            data={chartData}
            yAxisValues={getYAXISValuesAnalytics(chartData)}
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
