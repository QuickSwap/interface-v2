import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Box, Grid } from '@material-ui/core';
import { CustomMenu } from 'components';
import { useTranslation } from 'react-i18next';
import JumpRateModel from 'utils/marketxyz/interestRateModel';
import { PoolData } from 'utils/marketxyz/fetchPoolData';
import { shortUsdFormatter } from 'utils/bigUtils';

const LendDetailAssetStats: React.FC<{ poolData: PoolData }> = ({
  poolData,
}) => {
  const { t } = useTranslation();
  const [assetIndex, setAssetIndex] = useState('0');

  const [borrowerRates, setBorrowerRates] = useState<
    { x: number; y: number }[]
  >();
  const [supplierRates, setSupplyerRates] = useState<
    { x: number; y: number }[]
  >();

  const asset = poolData.assets[Number(assetIndex)];
  const sdk = asset.cToken.sdk;

  useEffect(() => {
    const _jrm = new JumpRateModel(sdk, asset);

    _jrm.init().then(() => {
      const { borrowerRates, supplierRates } = _jrm.convertIRMtoCurve();

      setBorrowerRates(borrowerRates);
      setSupplyerRates(supplierRates);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetIndex]);

  const currentUtilization = !asset.totalSupplyUSD
    ? 0
    : Math.round((asset.totalBorrowUSD / asset.totalSupplyUSD) * 100);

  return (
    <Grid item xs={12} sm={12} md={6}>
      <Box className='flex flex-col poolDetailsItemWrapper'>
        <Box className='poolDetailsItemTop'>
          <h6>
            {asset.underlyingSymbol} {t('statistics')}
          </h6>
          <Box height={40} minWidth={200}>
            <CustomMenu
              title=''
              selectedValue={asset.underlyingSymbol}
              menuItems={poolData.assets.map((item, index) => {
                return {
                  text: item.underlyingSymbol,
                  onClick: () => {
                    setAssetIndex(index.toString());
                  },
                };
              })}
            />
          </Box>
        </Box>
        <Box className='flex flex-col' flex={1}>
          <Box flex={1} paddingX={'30px'}>
            <ReactApexChart
              options={{
                chart: {
                  type: 'line',
                  zoom: {
                    enabled: false,
                  },
                  toolbar: {
                    show: false,
                  },
                },
                dataLabels: {
                  enabled: false,
                },
                colors: ['#4289ff', '#fa6358'],
                markers: {
                  size: [1, 1],
                  colors: undefined,
                  strokeColors: ['#4289ff', '#fa6358'],
                  discrete: [
                    {
                      seriesIndex: 0,
                      dataPointIndex: currentUtilization,
                      fillColor: '#4289ff',
                      strokeColor: '#fff',
                      size: 5,
                      shape: 'circle',
                    },
                    {
                      seriesIndex: 1,
                      dataPointIndex: currentUtilization,
                      fillColor: '#fa6358',
                      strokeColor: '#eee',
                      size: 5,
                      shape: 'circle',
                    },
                  ],
                },
                tooltip: {
                  enabled: true,
                  theme: 'dark',
                  fillSeriesColor: false,
                  custom: ({ series, seriesIndex, dataPointIndex }: any) => {
                    return `<div class="areaChartTooltip"><small class='caption'><b>${dataPointIndex}%</b> ${t(
                      'utilization',
                    )}</small><small class='caption'>${t(
                      'depositAPY',
                    )}: <b>${series[1][dataPointIndex].toFixed(
                      2,
                    )}%</b></small><small class='caption'>${t(
                      'borrowAPY',
                    )}: <b>${series[0][dataPointIndex].toFixed(
                      2,
                    )}%</b></small></div>`;
                  },
                },
                stroke: {
                  curve: 'smooth',
                },
                grid: {
                  show: false,
                  padding: {
                    top: -36, //this is for increasing the height of chart
                  },
                },
                xaxis: {
                  position: 'top',
                  axisBorder: {
                    show: false,
                  },
                  labels: {
                    show: true,
                    offsetY: -50, //this is for hiding xaxis labels
                  },
                  tooltip: {
                    enabled: false,
                  },
                  axisTicks: {
                    show: false,
                  },
                  categories: supplierRates?.map(({ x }) => x),
                },
                yaxis: {
                  show: false,
                },
                legend: {
                  show: false,
                },
                annotations: {
                  xaxis: supplierRates
                    ? [
                        {
                          x: currentUtilization,
                          borderColor: '#3e4252',
                          label: {
                            style: {
                              color: '#c7cad9',
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '12px',
                              background: 'transparent',
                            },
                            borderColor: '#3e4252',
                            orientation: 'horizontal',
                            text: t('currentUtilization'),
                          },
                        },
                      ]
                    : [],
                },
              }}
              series={[
                {
                  name: t('borrowerRates'),
                  data: borrowerRates?.map(({ y }) => y),
                },
                {
                  name: t('supplierRates'),
                  data: supplierRates?.map(({ y }) => y),
                },
              ]}
              type='line'
              height={'100%'}
            />
          </Box>
          <Box className='poolStatsInfoItem'>
            <Box>
              <small>{t('collateralFactor')}:</small>
              <p className='small'>
                {asset.collateralFactor
                  .div(sdk.web3.utils.toBN(1e16))
                  .toNumber()}
                %
              </p>
            </Box>
            <Box>
              <small>{t('reserveFactor')}:</small>
              <p className='small'>
                {asset.reserveFactor.div(sdk.web3.utils.toBN(1e16)).toNumber()}%
              </p>
            </Box>
          </Box>
          <Box className='poolStatsInfoItem'>
            <Box>
              <small>{t('totalSupplied')}:</small>
              <p className='small'>{shortUsdFormatter(asset.totalSupplyUSD)}</p>
            </Box>
            <Box>
              <small>{t('totalBorrowed')}:</small>
              <p className='small'>{shortUsdFormatter(asset.totalBorrowUSD)}</p>
            </Box>
            <Box>
              <small>{t('utilization')}:</small>
              <p className='small'>{currentUtilization + '%'}</p>
            </Box>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};

export default LendDetailAssetStats;
