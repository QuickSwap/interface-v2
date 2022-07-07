import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  withStyles,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Snackbar,
} from '@material-ui/core';
import { Skeleton, Alert } from '@material-ui/lab';

import ReactApexChart from 'react-apexcharts';
import { _100 } from '@uniswap/sdk/dist/constants';
import { useHistory, useLocation } from 'react-router-dom';
import ToggleSwitch from 'components/ToggleSwitch';

import { QuickModalContent } from 'components/LendModals';

import { usePoolData } from 'hooks/marketxyz/usePoolData';
import { midUsdFormatter, shortUsdFormatter } from 'utils/bigUtils';
import { getDaysCurrentYear, shortenAddress } from 'utils';
import { useExtraPoolData } from 'hooks/marketxyz/useExtraPoolData';
import { useActiveWeb3React } from 'hooks';
import { useMarket } from 'hooks/marketxyz/useMarket';
import { useTokensData } from 'hooks/marketxyz/useTokenData';
import { PoolData, USDPricedPoolAsset } from 'utils/marketxyz/fetchPoolData';
import JumpRateModel from '../../utils/marketxyz/interestRateModel';

import {
  toggleCollateral,
  convertMantissaToAPY,
  convertMantissaToAPR,
  getPoolAssetToken,
  convertBNToNumber,
} from 'utils/marketxyz';
import { useBorrowLimit } from 'hooks/marketxyz/useBorrowLimit';
import { useTranslation } from 'react-i18next';
import {
  QuestionHelper,
  CopyHelper,
  CustomMenu,
  CurrencyLogo,
} from 'components';
import 'pages/styles/lend.scss';

const QS_PoolDirectory = '0x9180296118C8Deb7c5547eF5c1E798DC0405f350';

const LendDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { chainId, account } = useActiveWeb3React();
  const [supplyToggled, setSupplyToggled] = useState(false);

  const [modalIsBorrow, setModalIsBorrow] = useState<boolean>(false);
  const [alertShow, setAlertShow] = useState({
    open: false,
    msg: '',
    status: 'success',
  });

  const [selectedAsset, setSelectedAsset] = useState<USDPricedPoolAsset>();

  const { sdk } = useMarket();
  const poolId = location && new URLSearchParams(location.search).get('poolId');
  const poolData = usePoolData(poolId, QS_PoolDirectory);

  const tokensData = useTokensData(
    poolData?.assets.map((asset) => asset.underlyingToken) || [],
  ) || ['0x0'];

  const extraPoolData = useExtraPoolData(
    poolData?.pool.comptroller,
    account ?? undefined,
  );

  const borrowLimit = useBorrowLimit(poolData?.assets);
  const handleAlertShowClose = () => {
    setAlertShow({
      open: false,
      msg: '',
      status: 'error',
    });
  };

  const poolUtilization = !poolData
    ? 0
    : !poolData.totalSuppliedUSD
    ? 0
    : (poolData.totalBorrowedUSD / poolData.totalSuppliedUSD) * 100;

  return (
    <>
      <Box width={'100%'}>
        <Box className='flex flex-wrap items-center' gridGap={'20px'}>
          <Box
            className='flex items-center cursor-pointer'
            onClick={() => {
              history.push('../lend');
            }}
          >
            <svg
              data-name='Layer 2'
              xmlns='http://www.w3.org/2000/svg'
              width='28'
              height='28'
              viewBox='0 0 28 28'
            >
              <g data-name='invisible box'>
                <path
                  data-name='Rectangle 20001'
                  fill='none'
                  d='M0 0h28v28H0z'
                />
              </g>
              <g data-name='Q3 icons'>
                <path
                  data-name='Path 11780'
                  d='m16.285 10.35-6.942 7a1.108 1.108 0 0 0 0 1.633l6.942 7a1.225 1.225 0 0 0 1.575.117 1.108 1.108 0 0 0 .117-1.75l-5.017-5.016h12.367a1.167 1.167 0 1 0 0-2.333H12.96l5.017-5.017a1.108 1.108 0 0 0-.117-1.75 1.225 1.225 0 0 0-1.575.117z'
                  transform='translate(-3.744 -4.167)'
                  fill='#448aff'
                />
              </g>
            </svg>
          </Box>
          <h4 className='text-bold'>{poolData?.pool.name}</h4>
          <Box display={'flex'} gridGap={'2px'}>
            {poolData?.assets.map((asset, i) => (
              <CurrencyLogo
                currency={getPoolAssetToken(asset, chainId)}
                key={i}
                size={'24px'}
              />
            ))}
          </Box>
        </Box>
        <Box mt={'40px'} textAlign={'left'}>
          <h5 className='text-gray29'>{t('lendPageTitle')}</h5>
        </Box>
        <Box mt={'23px'} display={'flex'} gridGap={'24px'} flexWrap={'wrap'}>
          <Box className='lendPageData'>
            <small className='text-secondary'>{t('totalSupply')}</small>
            {poolData?.totalSuppliedUSD ? (
              <h4>{poolData && midUsdFormatter(poolData.totalSuppliedUSD)}</h4>
            ) : (
              <Skeleton variant='rect' height={40} />
            )}
          </Box>
          <Box className='lendPageData'>
            <small className='text-secondary'>{t('totalBorrowed')}</small>
            {poolData?.totalBorrowedUSD ? (
              <h4>{poolData && midUsdFormatter(poolData.totalBorrowedUSD)}</h4>
            ) : (
              <Skeleton variant='rect' height={40} />
            )}
          </Box>
          <Box className='lendPageData'>
            <small className='text-secondary'>{t('liquidity')}</small>
            {poolData?.totalLiquidityUSD ? (
              <h4>{poolData && midUsdFormatter(poolData.totalLiquidityUSD)}</h4>
            ) : (
              <Skeleton variant='rect' height={40} />
            )}
          </Box>
          <Box className='lendPageData'>
            <small className='text-secondary'>{t('poolUtilization')}</small>
            {poolData ? (
              <h4>{poolUtilization.toFixed(2) + '%'}</h4>
            ) : (
              <Skeleton variant='rect' height={40} />
            )}
          </Box>
        </Box>
        <Box className='lendBorrowLimitWrapper' mt={'24px'}>
          <Box className='lendBorrowLimitText'>
            <Box>{t('borrowLimit')}</Box>
            <Box ml={'8px'}>
              <QuestionHelper text={t('borrowLimitHelper')} />
            </Box>
          </Box>
          <Box className='lendBorrowLimitLineWrapper'>
            <Box mr='20px'>
              <span>{midUsdFormatter(Math.min(50, borrowLimit))}</span>
            </Box>
            <Box className='lendBorrowLimitLine'>
              <Box className='lendBorrowLimitNormal' />
              <Box className='lendBorrowLimitWarning' />
              <Box className='lendBorrowLimitError' />
            </Box>
            <Box ml='20px'>
              {borrowLimit !== undefined ? (
                <span>{midUsdFormatter(borrowLimit)}</span>
              ) : (
                <Skeleton variant='rect' width={60} height={20} />
              )}
            </Box>
          </Box>
        </Box>
        <Box mt={3}>
          <Grid spacing={3} container>
            <Grid item xs={12} sm={12} md={6}>
              <Box className='poolDetailsItemWrapper'>
                <Box className='poolDetailsItemTop'>
                  <Box className='poolDetailsItemTag bg-primary' />
                  <h6>{t('supply')}</h6>
                  <Box display={'flex'}>
                    <small>{t('yoursupplybalance')}:&nbsp;</small>
                    {poolData ? (
                      <small className='text-gray29'>
                        {midUsdFormatter(poolData.totalSupplyBalanceUSD)}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
                <Box className='poolDetailsTableWrapper'>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <MuiTableCell>
                          {t('asset')} / {t('ltv')}
                        </MuiTableCell>
                        <MuiTableCell className='poolTableHideCell'>
                          {t('supplyapy')}
                        </MuiTableCell>
                        <MuiTableCell>{t('deposited')}</MuiTableCell>
                        <MuiTableCell>{t('collateral')}</MuiTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {poolData?.assets.map((asset, i) => (
                        <TableRow key={asset.cToken.address}>
                          <ItemTableCell
                            onClick={() => {
                              setSelectedAsset(asset);
                              setModalIsBorrow(false);
                            }}
                          >
                            <Box className='flex items-center'>
                              <Box display={'flex'} mr='16px'>
                                <CurrencyLogo
                                  currency={getPoolAssetToken(asset, chainId)}
                                  size={'36px'}
                                />
                              </Box>
                              <Box>
                                <small className='text-gray29'>
                                  {asset.underlyingName}
                                </small>
                                <p className='caption'>
                                  {t('ltv')}:{' '}
                                  {sdk &&
                                    asset.collateralFactor
                                      .div(sdk.web3.utils.toBN(1e16))
                                      .toNumber()}
                                  %
                                </p>
                              </Box>
                            </Box>
                          </ItemTableCell>
                          <ItemTableCell
                            className='poolTableHideCell'
                            onClick={() => {
                              setSelectedAsset(asset);
                              setModalIsBorrow(false);
                            }}
                          >
                            <small>
                              {convertMantissaToAPY(
                                asset.supplyRatePerBlock,
                                getDaysCurrentYear(),
                              ).toFixed(2)}
                              %
                            </small>
                            <Box className='flex items-center justify-end'>
                              <p className='caption'>
                                {convertMantissaToAPY(
                                  asset.supplyRatePerBlock,
                                  getDaysCurrentYear(),
                                ).toFixed(2)}
                                %
                              </p>
                              <Box ml='2px' className='flex'>
                                <CurrencyLogo
                                  currency={getPoolAssetToken(asset, chainId)}
                                  size={'16px'}
                                />
                              </Box>
                            </Box>
                          </ItemTableCell>
                          <ItemTableCell
                            onClick={() => {
                              setSelectedAsset(asset);
                              setModalIsBorrow(false);
                            }}
                          >
                            <small className='text-gray29'>
                              {midUsdFormatter(asset.supplyBalanceUSD)}
                            </small>
                            <p className='caption text-secondary'>
                              {sdk
                                ? convertBNToNumber(
                                    asset.supplyBalance,
                                    asset.underlyingDecimals,
                                  ).toFixed(2)
                                : '?'}{' '}
                              {asset.underlyingSymbol}
                            </p>
                          </ItemTableCell>
                          <MuiTableCell>
                            <Box className='flex justify-end'>
                              <ToggleSwitch
                                // defaultChecked={asset.membership}
                                toggled={asset.membership}
                                onToggle={() => {
                                  if (!supplyToggled) {
                                    setSupplyToggled(true);
                                    toggleCollateral(
                                      asset,
                                      poolData.pool.comptroller,
                                      account ?? '',
                                    )
                                      .catch((er) => {
                                        setAlertShow({
                                          open: true,
                                          msg: er.message,
                                          status: 'error',
                                        });
                                      })
                                      .finally(() => setSupplyToggled(false));
                                  }
                                }}
                              />
                              <Snackbar
                                open={alertShow.open}
                                autoHideDuration={6000}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'left',
                                }}
                                onClose={handleAlertShowClose}
                              >
                                <Alert
                                  onClose={handleAlertShowClose}
                                  severity={alertShow.status as any}
                                >
                                  {alertShow.msg}
                                </Alert>
                              </Snackbar>
                            </Box>
                          </MuiTableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Box className='poolDetailsItemWrapper'>
                <Box className='poolDetailsItemTop'>
                  <Box className='poolDetailsItemTag bg-error' />
                  <h6>{t('borrow')}</h6>
                  <Box display={'flex'}>
                    <small>{t('yourborrowbalance')}:&nbsp;</small>
                    {poolData ? (
                      <small className='text-gray29'>
                        {midUsdFormatter(poolData.totalBorrowBalanceUSD)}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
                <Box className='poolDetailsTableWrapper'>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <MuiTableCell>
                          {t('asset')} / {t('ltv')}
                        </MuiTableCell>
                        <MuiTableCell className='poolTableHideCell'>
                          {t('apr')} / {t('tvl')}
                        </MuiTableCell>
                        <MuiTableCell>{t('borrowed')}</MuiTableCell>
                        <MuiTableCell>{t('liquidity')}</MuiTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {poolData?.assets.map((asset) => {
                        if (asset.isPaused) {
                          return null;
                        }
                        return (
                          <ItemTableRow
                            key={asset.cToken.address}
                            onClick={() => {
                              setSelectedAsset(asset);
                              setModalIsBorrow(true);
                            }}
                          >
                            <ItemTableCell>
                              <Box
                                display={'flex'}
                                alignItems={'center'}
                                gridGap={'16px'}
                              >
                                <CurrencyLogo
                                  currency={getPoolAssetToken(asset, chainId)}
                                  size={'36px'}
                                />
                                <small className='text-gray29'>
                                  {asset.underlyingName}
                                </small>
                              </Box>
                            </ItemTableCell>
                            <ItemTableCell className='poolTableHideCell'>
                              <p className='caption'>
                                {convertMantissaToAPR(
                                  asset.borrowRatePerBlock,
                                ).toFixed(2)}
                                %
                              </p>
                            </ItemTableCell>
                            <ItemTableCell>
                              <small className='text-gray29'>
                                {midUsdFormatter(asset.borrowBalanceUSD)}
                              </small>
                              <p className='caption text-secondary'>
                                {sdk
                                  ? convertBNToNumber(
                                      asset.borrowBalance,
                                      asset.underlyingDecimals,
                                    ).toFixed(2)
                                  : '?'}{' '}
                                {asset.underlyingSymbol}
                              </p>
                            </ItemTableCell>
                            <ItemTableCell>
                              <small className='text-gray29'>
                                {midUsdFormatter(asset.liquidityUSD)}
                              </small>
                              <p className='caption text-secondary'>
                                {sdk
                                  ? convertBNToNumber(
                                      asset.liquidity,
                                      asset.underlyingDecimals,
                                    ).toFixed(2)
                                  : '?'}{' '}
                                {asset.underlyingSymbol}
                              </p>
                            </ItemTableCell>
                          </ItemTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Box className='poolDetailsItemWrapper'>
                <Box className='poolDetailsItemTop'>
                  <h6>{t('poolInfo')}</h6>
                </Box>
                <Box display={'flex'} pb={'16px'} flexDirection={'column'}>
                  <Box className='poolDetailsInfoRow'>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('totalSupplied')}:</small>
                      {poolData ? (
                        <small className='text-gray29'>
                          {midUsdFormatter(poolData.totalSuppliedUSD)}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('totalBorrowed')}:</small>
                      {poolData ? (
                        <small className='text-gray29'>
                          {midUsdFormatter(poolData.totalBorrowedUSD)}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                  </Box>
                  <Box className='poolDetailsInfoRow'>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('availableLiquidity')}:</small>
                      {poolData ? (
                        <small className='text-gray29'>
                          {midUsdFormatter(poolData.totalLiquidityUSD)}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('poolUtilization')}:</small>
                      {poolData ? (
                        <small className='text-gray29'>
                          {poolUtilization.toFixed(2) + '%'}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                  </Box>
                  <Box className='poolDetailsInfoRow'>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('upgradable')}:</small>
                      {extraPoolData ? (
                        <small className='text-gray29'>
                          {extraPoolData.upgradeable ? 'Yes' : 'No'}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('admin')}:</small>
                      {extraPoolData && extraPoolData.admin ? (
                        <Box className='flex items-center'>
                          <small className='text-gray29'>
                            {shortenAddress(extraPoolData.admin)}
                          </small>
                          <CopyHelper toCopy={extraPoolData.admin} />
                        </Box>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                  </Box>
                  <Box className='poolDetailsInfoRow'>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('platformFee')}:</small>
                      {poolData ? (
                        <small className='text-gray29'>
                          {poolData.assets.length > 0
                            ? (
                                Number(poolData.assets[0].fuseFee.toString()) /
                                1e16
                              ).toFixed(2) + '%'
                            : '10%'}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('averageAdminFee')}:</small>
                      {poolData ? (
                        <small className='text-gray29'>
                          {poolData.assets.reduce(
                            (a, b, _, { length }) =>
                              a + Number(b.adminFee.toString()) / 1e16 / length,
                            0,
                          )}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                  </Box>
                  <Box className='poolDetailsInfoRow'>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('closeFactor')}:</small>
                      {extraPoolData ? (
                        <small className='text-gray29'>
                          {extraPoolData.closeFactor / 1e16 + '%'}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('liquidationIncentive')}:</small>
                      {extraPoolData ? (
                        <small className='text-gray29'>
                          {extraPoolData.liquidationIncentive / 1e16 -
                            100 +
                            '%'}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                  </Box>
                  <Box className='poolDetailsInfoRow'>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('oracle')}:</small>
                      {extraPoolData ? (
                        <small className='text-gray29'>
                          {shortenAddress(extraPoolData.oracle)}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                    <Box className='poolDetailsInfoItem'>
                      <small>{t('whitelist')}:</small>
                      {extraPoolData ? (
                        <small className='text-gray29'>
                          {extraPoolData.enforceWhitelist ? 'Yes' : 'No'}
                        </small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {poolData && <AssetStats poolData={poolData} />}
          </Grid>
        </Box>
      </Box>

      {selectedAsset && (
        <QuickModalContent
          open={!!selectedAsset}
          onClose={() => setSelectedAsset(undefined)}
          borrow={modalIsBorrow}
          asset={selectedAsset}
          borrowLimit={borrowLimit ?? 0}
        />
      )}
    </>
  );
};

const AssetStats = ({ poolData }: { poolData: PoolData }) => {
  const { t } = useTranslation();
  const asset = poolData.assets[0];
  const sdk = asset.cToken.sdk;
  const [jrm, setJrm] = useState<JumpRateModel>();
  const [statsItem, setStatsItem] = useState(asset.underlyingName);

  const [borrowerRates, setBorrowerRates] = useState<
    { x: number; y: number }[]
  >();
  const [supplierRates, setSupplyerRates] = useState<
    { x: number; y: number }[]
  >();

  useEffect(() => {
    const _jrm = new JumpRateModel(sdk, asset);

    _jrm.init().then(() => {
      setJrm(_jrm);
      const { borrowerRates, supplierRates } = _jrm.convertIRMtoCurve();

      setBorrowerRates(borrowerRates);
      setSupplyerRates(supplierRates);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentUtilization = !asset.totalSupplyUSD
    ? 0
    : Math.round((asset.totalBorrowUSD / asset.totalSupplyUSD) * 100);

  return (
    <Grid item xs={12} sm={12} md={6}>
      <Box className='flex flex-col poolDetailsItemWrapper'>
        <Box className='poolDetailsItemTop'>
          <h6>
            {statsItem} {t('statistics')}
          </h6>
          <Box height={40} minWidth={200}>
            <CustomMenu
              title=''
              selectedValue={statsItem}
              menuItems={poolData.assets.map((item) => {
                return {
                  text: item.underlyingName,
                  onClick: () => {
                    setStatsItem(item.underlyingName);
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
              <p className='small text-gray29'>
                {asset.collateralFactor
                  .div(sdk.web3.utils.toBN(1e16))
                  .toNumber()}
                %
              </p>
            </Box>
            <Box>
              <small>{t('reserveFactor')}:</small>
              <p className='small text-gray29'>
                {asset.reserveFactor.div(sdk.web3.utils.toBN(1e16)).toNumber()}%
              </p>
            </Box>
          </Box>
          <Box className='poolStatsInfoItem'>
            <Box>
              <small>{t('totalSupplied')}:</small>
              <p className='small text-gray29'>
                {shortUsdFormatter(asset.totalSupplyUSD)}
              </p>
            </Box>
            <Box>
              <small>{t('totalBorrowed')}:</small>
              <p className='small text-gray29'>
                {shortUsdFormatter(asset.totalBorrowUSD)}
              </p>
            </Box>
            <Box>
              <small>{t('utilization')}:</small>
              <p className='small text-gray29'>{currentUtilization + '%'}</p>
            </Box>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};

const MuiTableCell = withStyles({
  root: {
    padding: '0px',
    borderBottom: 'none',
  },
})(TableCell);

const ItemTableCell = withStyles({
  root: {
    cursor: 'pointer',
  },
})(MuiTableCell);

const ItemTableRow = withStyles({
  root: {
    cursor: 'pointer',
  },
})(TableRow);

export default LendDetailPage;
