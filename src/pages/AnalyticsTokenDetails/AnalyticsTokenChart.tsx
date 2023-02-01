import React, { useState, useEffect, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import dayjs from 'dayjs';
import {
  formatCompact,
  getFormattedPrice,
  getPriceClass,
  formatNumber,
  getChartDates,
  getChartStartTime,
  getLimitedData,
  getYAXISValuesAnalytics,
} from 'utils';
import { AreaChart, ChartType } from 'components';
import { getTokenChartData } from 'utils';
import { GlobalConst, GlobalData } from 'constants/index';
import { useTranslation } from 'react-i18next';
import { getTokenChartDataTotal, getTokenChartDataV3 } from 'utils/v3-graph';
import { useParams } from 'react-router-dom';

const CHART_VOLUME = 0;
const CHART_LIQUIDITY = 1;
const CHART_PRICE = 2;

const AnalyticsTokenChart: React.FC<{
  token: any;
}> = ({ token }) => {
  const { t } = useTranslation();
  const match = useRouteMatch<{ id: string }>();
  const tokenAddress = match.params.id;
  const [tokenChartData, updateTokenChartData] = useState<any>(null);
  const chartIndexes = [CHART_VOLUME, CHART_LIQUIDITY, CHART_PRICE];
  const chartIndexTexts = [t('volume'), t('liquidity'), t('price')];
  const [chartIndex, setChartIndex] = useState(CHART_VOLUME);
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.analyticChart.ONE_MONTH_CHART,
  );

  const chartData = useMemo(() => {
    if (!tokenChartData) return;
    return tokenChartData.map((item: any) => {
      switch (chartIndex) {
        case CHART_VOLUME:
          return Number(item.dailyVolumeUSD);
        case CHART_LIQUIDITY:
          return Number(item.totalLiquidityUSD);
        case CHART_PRICE:
          return Number(item.priceUSD);
        default:
          return;
      }
    });
  }, [tokenChartData, chartIndex]);

  const currentData = useMemo(() => {
    if (!token) return;
    switch (chartIndex) {
      case CHART_VOLUME:
        return token.oneDayVolumeUSD;
      case CHART_LIQUIDITY:
        return token.totalLiquidityUSD;
      case CHART_PRICE:
        return token.priceUSD;
      default:
        return;
    }
  }, [token, chartIndex]);

  const currentPercent = useMemo(() => {
    if (!token) return;
    switch (chartIndex) {
      case CHART_VOLUME:
        return token.volumeChangeUSD;
      case CHART_LIQUIDITY:
        return token.liquidityChangeUSD;
      case CHART_PRICE:
        return token.priceChangeUSD;
      default:
        return;
    }
  }, [token, chartIndex]);

  const params: any = useParams();
  const version = params && params.version ? params.version : 'total';

  useEffect(() => {
    async function fetchTokenChartData() {
      updateTokenChartData(null);

      const duration =
        durationIndex === GlobalConst.analyticChart.ALL_CHART
          ? 0
          : getChartStartTime(durationIndex);

      const tokenChartDataFn =
        version === 'v3'
          ? getTokenChartDataV3(tokenAddress, duration)
          : version === 'v2'
          ? getTokenChartData(tokenAddress, duration)
          : getTokenChartDataTotal(tokenAddress, duration);

      tokenChartDataFn.then((chartData) => {
        if (chartData) {
          const newChartData = getLimitedData(
            chartData,
            GlobalConst.analyticChart.CHART_COUNT,
          );
          updateTokenChartData(newChartData);
        }
      });
    }
    fetchTokenChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress, durationIndex, version]);

  const currentPercentClass = getPriceClass(Number(currentPercent));

  return (
    <>
      <Box className='flex flex-wrap justify-between'>
        <Box mt={1.5}>
          <span>{chartIndexTexts[chartIndex]}</span>
          <Box mt={1}>
            {(currentData || currentData === 0) &&
            (currentPercent || currentPercent === 0) ? (
              <>
                <Box className='flex items-center'>
                  <h4>
                    $
                    {currentData > 100000
                      ? formatCompact(currentData)
                      : formatNumber(currentData)}
                  </h4>
                  <Box
                    className={`priceChangeWrapper ${currentPercentClass}`}
                    ml={1}
                  >
                    <small>{getFormattedPrice(Number(currentPercent))}%</small>
                  </Box>
                </Box>
                <Box>
                  <span>{dayjs().format('MMM DD, YYYY')}</span>
                </Box>
              </>
            ) : (
              <Skeleton variant='rect' width='120px' height='30px' />
            )}
          </Box>
        </Box>
        <Box className='flex flex-col items-end'>
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
        {tokenChartData ? (
          <AreaChart
            data={chartData}
            yAxisValues={getYAXISValuesAnalytics(chartData)}
            dates={tokenChartData.map((value: any) => value.date)}
            width='100%'
            strokeColor={version !== 'v2' ? '#3e92fe' : '#00dced'}
            gradientColor={version !== 'v2' ? '#448aff' : undefined}
            height={version !== 'v2' ? 275 : 240}
            categories={getChartDates(tokenChartData, durationIndex)}
          />
        ) : (
          <Skeleton variant='rect' width='100%' height={217} />
        )}
      </Box>
    </>
  );
};

export default React.memo(AnalyticsTokenChart);
