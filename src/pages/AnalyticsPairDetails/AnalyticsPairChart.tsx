import React, { useState, useEffect, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import dayjs from 'dayjs';
import {
  formatCompact,
  getPairChartData,
  getFormattedPrice,
  getPriceClass,
  getChartDates,
  getChartStartTime,
  getLimitedData,
  getYAXISValuesAnalytics,
} from 'utils';
import { AreaChart, ChartType } from 'components';
import { GlobalConst, GlobalData } from 'constants/index';
import { useTranslation } from 'react-i18next';
import { useIsV2 } from 'state/application/hooks';
import { getPairChartDataV3, getPairChartFees } from 'utils/v3-graph';
import AnalyticsPairLiquidityChartV3 from './AnalyticsPairLiquidityChartV3';
import '../styles/analytics.scss';

const CHART_VOLUME = 0;
const CHART_TVL = 1;
const CHART_FEES = 2;
const CHART_LIQUIDITY = 3;
const CHART_POOL_FEE = 4;
const CHART_PRICE = 5;

const AnalyticsPairChart: React.FC<{
  pairData: any;
  token0Rate?: any;
  token1Rate?: any;
}> = ({ pairData, token0Rate, token1Rate }) => {
  const { t } = useTranslation();
  const match = useRouteMatch<{ id: string }>();
  const pairAddress = match.params.id;
  const [pairChartData, setPairChartData] = useState<any[] | null>(null);
  const [pairFeeData, setPairFeeData] = useState<any[] | null>(null);
  const [durationIndex, setDurationIndex] = useState(
    GlobalConst.analyticChart.ONE_MONTH_CHART,
  );

  const { isV2 } = useIsV2();

  const [priceChartTokenIdx, setPriceChartTokenIdx] = useState(0);

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
          ).toLocaleString('us')
        : (
            Number(pairData.oneDayVolumeUSD) * GlobalConst.utils.FEEPERCENT
          ).toLocaleString('us')
      : '-';
  const [chartIndex, setChartIndex] = useState(CHART_VOLUME);
  const chartIndexes = useMemo(() => [CHART_VOLUME, CHART_TVL, CHART_FEES], []);

  const chartIndexesV3 = useMemo(
    () => [CHART_LIQUIDITY, CHART_POOL_FEE, CHART_PRICE],
    [],
  );

  const chartIndexTexts = useMemo(() => [t('volume'), t('tvl'), t('fees')], [
    t,
  ]);

  const chartIndexTextsV3 = useMemo(
    () => [t('liquidity'), t('poolFee'), t('price')],
    [t],
  );

  const _chartIndexes = useMemo(
    () => chartIndexes.concat(isV2 ? [] : chartIndexesV3),
    [isV2, chartIndexes, chartIndexesV3],
  );
  const _chartIndexesTexts: any = useMemo(
    () => chartIndexTexts.concat(isV2 ? [] : chartIndexTextsV3),
    [isV2, chartIndexTexts, chartIndexTextsV3],
  );

  const chartData = useMemo(() => {
    if (!pairChartData) return;

    if (chartIndex === CHART_POOL_FEE) {
      if (!pairFeeData) return;
      return pairFeeData.map((item: any) => {
        return Number(item.fee) / 10000;
      });
    }

    return pairChartData.map((item: any) => {
      switch (chartIndex) {
        case CHART_VOLUME:
          return Number(item.dailyVolumeUSD);
        case CHART_TVL:
          return Number(item.reserveUSD);
        case CHART_FEES:
          return isV2
            ? Number(item.dailyVolumeUSD) * GlobalConst.utils.FEEPERCENT
            : Number(item.feesUSD);
        case CHART_PRICE:
          return priceChartTokenIdx
            ? Number(item.token1Price)
            : Number(item.token0Price);
        default:
          return;
      }
    });
  }, [pairChartData, pairFeeData, chartIndex, isV2, priceChartTokenIdx]);

  const currentData = useMemo(() => {
    if (!pairData) return;
    switch (chartIndex) {
      case CHART_VOLUME:
        return pairData.oneDayVolumeUSD;
      case CHART_TVL:
        return pairData.reserveUSD ?? pairData.trackedReserveUSD;
      case CHART_FEES:
        return isV2 ? fees : pairData.feesUSD;
      case CHART_POOL_FEE:
        return pairData.fee / 10000;
      case CHART_PRICE:
        return `1 ${
          priceChartTokenIdx ? pairData.token1.symbol : pairData.token0.symbol
        } = ${
          priceChartTokenIdx ? pairData.token1Price : pairData.token0Price
        } ${
          priceChartTokenIdx ? pairData.token0.symbol : pairData.token1.symbol
        }`;
      default:
        return;
    }
  }, [pairData, chartIndex, fees, isV2, priceChartTokenIdx]);

  const currentPercent = useMemo(() => {
    if (!pairData) return;
    switch (chartIndex) {
      case CHART_VOLUME:
        return pairData.volumeChangeUSD;
      case CHART_TVL:
        return pairData.liquidityChangeUSD;
      case CHART_FEES:
        return !isV2
          ? pairData.feesUSDChange
          : usingUtVolume
          ? pairData.volumeChangeUntracked
          : pairData.volumeChangeUSD;
      case CHART_POOL_FEE:
        return pairData.poolFeeChange;
      case CHART_PRICE:
        return pairData.token0PriceChange;
      default:
        return;
    }
  }, [pairData, chartIndex, usingUtVolume, isV2]);

  const chartYTicker = useMemo(() => {
    if (!pairData) return;

    switch (chartIndex) {
      case CHART_POOL_FEE:
        return '%';
      case CHART_PRICE:
        return '';
      default:
        return '$';
    }
  }, [chartIndex, pairData]);

  useEffect(() => {
    async function fetchPairChartData() {
      setPairChartData(null);
      const duration =
        durationIndex === GlobalConst.analyticChart.ALL_CHART
          ? 0
          : getChartStartTime(durationIndex);

      const pairChartDataFn = !isV2
        ? getPairChartDataV3(pairAddress, duration)
        : getPairChartData(pairAddress, duration);

      Promise.all(
        [pairChartDataFn].concat(
          !isV2 ? [getPairChartFees(pairAddress, duration)] : [],
        ),
      ).then(([chartData, feeChartData]) => {
        if (chartData && chartData.length > 0) {
          const newChartData = getLimitedData(
            chartData,
            GlobalConst.analyticChart.CHART_COUNT,
          );
          setPairChartData(newChartData);
        }
        if (feeChartData && feeChartData.length > 0) {
          const newFeeData = getLimitedData(
            feeChartData,
            GlobalConst.analyticChart.CHART_COUNT,
          );
          setPairFeeData(newFeeData);
        }
      });
    }
    if (isV2 !== undefined) {
      fetchPairChartData();
    }
  }, [pairAddress, durationIndex, isV2]);

  const _chartData = useMemo(() => {
    if (!pairData || !pairChartData) return;
    if (!isV2 && !pairFeeData) return;
    switch (chartIndex) {
      case CHART_POOL_FEE:
        return pairFeeData;
      default:
        return pairChartData;
    }
  }, [pairData, chartIndex, pairFeeData, pairChartData, isV2]);

  const currentPercentClass = getPriceClass(Number(currentPercent));

  return (
    <Box className='flex flex-col' height='100%'>
      <Box className='flex flex-wrap justify-between' position={'relative'}>
        <Box mt={1.5}>
          <span>{chartIndexTexts[chartIndex]}</span>
          <Box mt={1}>
            {(currentData || currentData === 0) &&
            (currentPercent || currentPercent === 0) ? (
              <>
                <Box className='flex items-center'>
                  <h4>
                    {`${chartYTicker === '$' ? chartYTicker : ''}${
                      currentData > 100000
                        ? formatCompact(currentData)
                        : currentData.toLocaleString('us')
                    }${chartYTicker === '%' ? chartYTicker : ''}`}
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
            ) : chartIndex === CHART_LIQUIDITY ? (
              <Box>
                <Box className='flex items-center' mb={0.5}>
                  <Box
                    width={8}
                    height={8}
                    borderRadius={'50%'}
                    bgcolor={'#64FBD3'}
                  />
                  <Box ml={1}>Current price</Box>
                </Box>
                <Box
                  mb={0.5}
                >{`1 ${pairData.token0.symbol} = ${token0Rate} ${pairData.token1.symbol}`}</Box>
                <Box
                  mb={0.5}
                >{`1 ${pairData.token1.symbol} = ${token1Rate} ${pairData.token0.symbol}`}</Box>
              </Box>
            ) : (
              <Skeleton variant='rect' width='120px' height='30px' />
            )}
            {chartIndex === CHART_PRICE ? (
              <Box
                className='flex analyticsPriceChartToggler'
                position={'absolute'}
                right={40}
                onClick={() =>
                  setPriceChartTokenIdx(Number(!priceChartTokenIdx))
                }
              >
                <Box className={`${!priceChartTokenIdx && 'active'}`}>
                  {pairData.token0.symbol}
                </Box>
                <Box className={`${priceChartTokenIdx && 'active'}`}>
                  {pairData.token1.symbol}
                </Box>
              </Box>
            ) : null}
          </Box>
        </Box>
        <Box className='flex flex-col items-end'>
          <Box mt={1.5}>
            <ChartType
              chartTypes={_chartIndexes}
              typeTexts={_chartIndexesTexts}
              chartType={chartIndex}
              setChartType={setChartIndex}
            />
          </Box>
          {chartIndex !== CHART_LIQUIDITY && (
            <Box mt={1.5}>
              <ChartType
                chartTypes={GlobalData.analytics.CHART_DURATIONS}
                typeTexts={GlobalData.analytics.CHART_DURATION_TEXTS}
                chartType={durationIndex}
                setChartType={setDurationIndex}
              />
            </Box>
          )}
        </Box>
      </Box>
      <Box mt={2} width={1} flex={1}>
        {chartData && _chartData ? (
          chartIndex === CHART_LIQUIDITY ? (
            <AnalyticsPairLiquidityChartV3
              pairData={pairData}
              pairAddress={pairAddress}
            />
          ) : (
            <AreaChart
              data={chartData}
              yAxisValues={getYAXISValuesAnalytics(chartData)}
              dates={_chartData.map((value: any) => value.date)}
              width='100%'
              strokeColor={!isV2 ? '#3e92fe' : '#00dced'}
              gradientColor={!isV2 ? '#448aff' : undefined}
              height={!isV2 ? 275 : 240}
              categories={getChartDates(_chartData, durationIndex)}
              yAxisTicker={chartYTicker}
            />
          )
        ) : (
          <Skeleton variant='rect' width='100%' height={217} />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsPairChart;
