import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { Box, Divider, useMediaQuery, useTheme } from '@material-ui/core';
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
import { AreaChart, ChartType, MixedChart, ColumnChart } from 'components';
import { GlobalConst, GlobalData } from 'constants/index';
import { useTranslation } from 'react-i18next';
import { getPairChartDataV3, getPairChartFees } from 'utils/v3-graph';
import AnalyticsPairLiquidityChartV3 from './AnalyticsPairLiquidityChartV3';
import '../styles/analytics.scss';

const CHART_VOLUME = 0;
const CHART_TVL = 1;
const CHART_FEES = 2;
const CHART_LIQUIDITY = 3;
const CHART_POOL_FEE = 4;
const CHART_PRICE = 5;
const CHART_TXS = 6;
const CHART_APY_IL = 7;
const CHART_RESERVE = 8;
const CHART_ASSET = 9;

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

  const params: any = useParams();
  const version = params && params.version ? params.version : 'v3';
  const isV2 = version === 'v2';
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const [priceChartTokenIdx, setPriceChartTokenIdx] = useState(0);
  const [apyVisionData, setAPYVisionData] = useState<any>(undefined);
  const apyVisionURL = process.env.REACT_APP_APY_VISION_BASE_URL;
  const apyVisionAccessToken = process.env.REACT_APP_APY_VISION_ACCESS_TOKEN;

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

  const chartIndexesAPYVision = useMemo(
    () => [CHART_TXS, CHART_APY_IL, CHART_RESERVE, CHART_ASSET],
    [],
  );

  const chartIndexesV3 = useMemo(
    () => [CHART_LIQUIDITY, CHART_POOL_FEE, CHART_PRICE],
    [],
  );

  const chartIndexTexts = useMemo(() => [t('volume'), t('tvl'), t('fees')], [
    t,
  ]);

  const chartIndexTextsAPYVision = useMemo(
    () => [t('transactions'), t('apyIL'), t('reservevol'), t('assetGrowth')],
    [t],
  );

  const chartIndexTextsV3 = useMemo(
    () => [t('liquidity'), t('poolFee'), t('price')],
    [t],
  );

  const _chartIndexes = useMemo(
    () => chartIndexes.concat(isV2 ? chartIndexesAPYVision : chartIndexesV3),
    [chartIndexes, isV2, chartIndexesAPYVision, chartIndexesV3],
  );
  const _chartIndexesTexts: any = useMemo(
    () =>
      chartIndexTexts.concat(
        isV2 ? chartIndexTextsAPYVision : chartIndexTextsV3,
      ),
    [chartIndexTexts, isV2, chartIndexTextsAPYVision, chartIndexTextsV3],
  );

  const chartData = useMemo(() => {
    if (!pairChartData) return;

    if (chartIndexesAPYVision.includes(chartIndex)) return;

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
  }, [
    pairChartData,
    chartIndexesAPYVision,
    chartIndex,
    pairFeeData,
    isV2,
    priceChartTokenIdx,
  ]);

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
          priceChartTokenIdx ? pairData.token0Price : pairData.token1Price
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
        return priceChartTokenIdx
          ? pairData.token1PriceChange
          : pairData.token0PriceChange;
      default:
        return;
    }
  }, [pairData, chartIndex, usingUtVolume, isV2, priceChartTokenIdx]);

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
    fetchPairChartData();
  }, [pairAddress, durationIndex, isV2]);

  useEffect(() => {
    if (!apyVisionURL || !apyVisionAccessToken) return;
    (async () => {
      const apyResponse = await fetch(
        `${apyVisionURL}/api/v1/pools/${pairAddress.toLowerCase()}?accessToken=${apyVisionAccessToken}`,
      );
      const apyData = await apyResponse.json();
      if (apyData && apyData.length > 0) {
        setAPYVisionData(apyData[0]);
      }
    })();
  }, [apyVisionAccessToken, apyVisionURL, pairAddress]);

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

  const apyChartData = useMemo(() => {
    if (!apyVisionData) return;
    switch (chartIndex) {
      case CHART_APY_IL:
        const feeAPYs = [
          apyVisionData.fee_apys_inception ?? 0,
          apyVisionData.fee_apys_90d ?? 0,
          apyVisionData.fee_apys_60d ?? 0,
          apyVisionData.fee_apys_30d ?? 0,
          apyVisionData.fee_apys_14d ?? 0,
          apyVisionData.fee_apys_7d ?? 0,
          apyVisionData.fee_apys_1d ?? 0,
        ];
        const ilAPYs = [
          apyVisionData.il_apys_inception ?? 0,
          apyVisionData.il_apys_90d ?? 0,
          apyVisionData.il_apys_60d ?? 0,
          apyVisionData.il_apys_30d ?? 0,
          apyVisionData.il_apys_14d ?? 0,
          apyVisionData.il_apys_7d ?? 0,
          apyVisionData.il_apys_1d ?? 0,
        ];
        return [
          {
            name: 'Fees APY',
            data: feeAPYs,
          },
          {
            name: 'IL APY',
            data: ilAPYs,
          },
          {
            name: 'Net APY',
            data: feeAPYs.map((apy, index) => apy - ilAPYs[index]),
          },
        ];
      case CHART_ASSET:
        const apyVisionPrice0 =
          apyVisionData.prices && apyVisionData.prices.length > 0
            ? apyVisionData.prices[0]
            : undefined;
        const apyVisionPrice1 =
          apyVisionData.prices && apyVisionData.prices.length > 1
            ? apyVisionData.prices[1]
            : undefined;
        const asset0Prices = [
          apyVisionPrice0?.inception ?? 0,
          apyVisionPrice0?.usd_90d ?? 0,
          apyVisionPrice0?.usd_60d ?? 0,
          apyVisionPrice0?.usd_30d ?? 0,
          apyVisionPrice0?.usd_14d ?? 0,
          apyVisionPrice0?.usd_7d ?? 0,
          apyVisionPrice0?.usd_1d ?? 0,
        ];
        const asset1Prices = [
          apyVisionPrice1?.inception ?? 0,
          apyVisionPrice1?.usd_90d ?? 0,
          apyVisionPrice1?.usd_60d ?? 0,
          apyVisionPrice1?.usd_30d ?? 0,
          apyVisionPrice1?.usd_14d ?? 0,
          apyVisionPrice1?.usd_7d ?? 0,
          apyVisionPrice1?.usd_1d ?? 0,
        ];
        const hodlMinusIls = [
          apyVisionData.hodl_minus_il_return_pcts_inception ?? 0,
          apyVisionData.hodl_minus_il_return_pcts_90d ?? 0,
          apyVisionData.hodl_minus_il_return_pcts_60d ?? 0,
          apyVisionData.hodl_minus_il_return_pcts_30d ?? 0,
          apyVisionData.hodl_minus_il_return_pcts_14d ?? 0,
          apyVisionData.hodl_minus_il_return_pcts_7d ?? 0,
          apyVisionData.hodl_minus_il_return_pcts_1d ?? 0,
        ];
        return [
          {
            name: apyVisionData.prices[0].symbol,
            data: asset0Prices.map(
              (price: number) =>
                (1000 / price) * apyVisionData.prices[0].baseline_usd,
            ),
          },
          {
            name: apyVisionData.prices[1].symbol,
            data: asset1Prices.map(
              (price: number) =>
                (1000 / price) * apyVisionData.prices[1].baseline_usd,
            ),
          },
          {
            name: '50% 50%',
            data: asset0Prices.map(
              (price: number, index: number) =>
                (500 / price) * apyVisionData.prices[0].baseline_usd +
                (500 / asset1Prices[index]) *
                  apyVisionData.prices[1].baseline_usd,
            ),
          },
          {
            name: 'Curr Liq Pool Value',
            data: hodlMinusIls.map((value: number) => value * 10 + 1000),
          },
        ];
      case CHART_RESERVE:
        const apyReserves = [
          apyVisionData.avg_reserves_inception ?? 0,
          apyVisionData.avg_reserves_90d ?? 0,
          apyVisionData.avg_reserves_60d ?? 0,
          apyVisionData.avg_reserves_30d ?? 0,
          apyVisionData.avg_reserves_14d ?? 0,
          apyVisionData.avg_reserves_7d ?? 0,
          apyVisionData.avg_reserves_1d ?? 0,
        ];
        const apyVolumes = [
          apyVisionData.avg_volume_inception ?? 0,
          apyVisionData.avg_volume_90d ?? 0,
          apyVisionData.avg_volume_60d ?? 0,
          apyVisionData.avg_volume_30d ?? 0,
          apyVisionData.avg_volume_14d ?? 0,
          apyVisionData.avg_volume_7d ?? 0,
          apyVisionData.avg_volume_1d ?? 0,
        ];
        return [
          { name: 'Reserve', type: 'column', data: apyReserves },
          {
            name: 'Volume',
            type: 'line',
            data: apyVolumes.map((value) => Number(value.toFixed(3))),
          },
          {
            name: 'V/R Ratio',
            type: 'line',
            data: apyReserves.map((value, ind) =>
              value > 0 ? Number((apyVolumes[ind] / value).toFixed(3)) : 0,
            ),
          },
        ];
      case CHART_TXS:
        const apyTxs = [
          apyVisionData.avg_txns_inception ?? 0,
          apyVisionData.avg_txns_90d ?? 0,
          apyVisionData.avg_txns_60d ?? 0,
          apyVisionData.avg_txns_30d ?? 0,
          apyVisionData.avg_txns_14d ?? 0,
          apyVisionData.avg_txns_7d ?? 0,
          apyVisionData.avg_txns_1d ?? 0,
        ];
        const apySwapValues = [
          apyVisionData.avg_swap_value_usd_inception ?? 0,
          apyVisionData.avg_swap_value_usd_90d ?? 0,
          apyVisionData.avg_swap_value_usd_60d ?? 0,
          apyVisionData.avg_swap_value_usd_30d ?? 0,
          apyVisionData.avg_swap_value_usd_14d ?? 0,
          apyVisionData.avg_swap_value_usd_7d ?? 0,
          apyVisionData.avg_swap_value_usd_1d ?? 0,
        ];
        const apyMedianSwapValues = [
          apyVisionData.median_swap_value_inception ?? 0,
          apyVisionData.median_swap_value_90d ?? 0,
          apyVisionData.median_swap_value_60d ?? 0,
          apyVisionData.median_swap_value_30d ?? 0,
          apyVisionData.median_swap_value_14d ?? 0,
          apyVisionData.median_swap_value_7d ?? 0,
          apyVisionData.median_swap_value_1d ?? 0,
        ];
        return [
          {
            name: 'Avg # Txns',
            type: 'line',
            data: apyTxs.map((value) => Number(value.toFixed(2))),
          },
          {
            name: 'Avg Swap Size',
            type: 'line',
            data: apySwapValues.map((value) => Number(value.toFixed(2))),
          },
          {
            name: 'Median Swap Size',
            type: 'line',
            data: apyMedianSwapValues.map((value) => Number(value.toFixed(2))),
          },
        ];
      default:
        return;
    }
  }, [apyVisionData, chartIndex]);

  const apyChartCategories = [
    'Inception*',
    '90D Avg',
    '60D Avg',
    '30D Avg',
    '14D Avg',
    '7D Avg',
    'Yesterday',
  ];

  return (
    <>
      <ChartType
        chartTypes={_chartIndexes}
        typeTexts={_chartIndexesTexts}
        chartType={chartIndex}
        setChartType={setChartIndex}
        size='big'
        textClass='text-secondary'
      />
      <Box mt={2} mx={isMobile ? -1.5 : -3}>
        <Divider />
      </Box>
      {!chartIndexesAPYVision.includes(chartIndex) && (
        <Box className='flex flex-wrap justify-between' position='relative'>
          <Box mt={2}>
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
                      <small>
                        {getFormattedPrice(Number(currentPercent))}%
                      </small>
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
      )}
      {chartIndexesAPYVision.includes(chartIndex) ? (
        apyChartData && (
          <>
            {(chartIndex === CHART_APY_IL || chartIndex === CHART_ASSET) && (
              <ColumnChart
                categories={apyChartCategories}
                data={apyChartData}
                width='100%'
                height='100%'
                valueSuffix={
                  chartIndex === CHART_ASSET
                    ? 'USD'
                    : chartIndex === CHART_APY_IL
                    ? '%'
                    : ''
                }
              />
            )}
            {(chartIndex === CHART_RESERVE || chartIndex === CHART_TXS) && (
              <MixedChart
                categories={apyChartCategories}
                data={apyChartData}
                width='100%'
                height='100%'
              />
            )}
          </>
        )
      ) : (
        <Box mt={2} width={1}>
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
                strokeColor='#3e92fe'
                gradientColor='#448aff'
                height={!isV2 ? 275 : 240}
                categories={getChartDates(_chartData, durationIndex)}
                yAxisTicker={chartYTicker}
              />
            )
          ) : (
            <Skeleton variant='rect' width='100%' height={217} />
          )}
        </Box>
      )}
    </>
  );
};

export default AnalyticsPairChart;
