import React, { useState } from 'react';
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { useHistory, useLocation } from 'react-router-dom';

import { QuickModalContent } from 'components/LendModals';

import { usePoolData } from 'hooks/marketxyz/usePoolData';
import { midUsdFormatter, shortUsdFormatter } from 'utils/bigUtils';
import { getDaysCurrentYear, shortenAddress, convertBNToNumber } from 'utils';
import { useExtraPoolData } from 'hooks/marketxyz/useExtraPoolData';
import { useActiveWeb3React } from 'hooks';
import { useMarket } from 'hooks/marketxyz/useMarket';
import { USDPricedPoolAsset } from 'utils/marketxyz/fetchPoolData';

import {
  toggleCollateral,
  convertMantissaToAPY,
  convertMantissaToAPR,
  getPoolAssetToken,
} from 'utils/marketxyz';
import { useBorrowLimit } from 'hooks/marketxyz/useBorrowLimit';
import { useTranslation } from 'react-i18next';
import {
  QuestionHelper,
  CopyHelper,
  CurrencyLogo,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import 'pages/styles/lend.scss';
import { GlobalValue } from 'constants/index';
import LendDetailAssetStats from './LendDetailAssetStats';
import AdsSlider from 'components/AdsSlider';
import { ChainId } from '@uniswap/sdk';
import { LENDING_QS_POOL_DIRECTORY } from 'constants/v3/addresses';

const LendDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { chainId, account } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const [txLoading, setTxLoading] = useState(false);
  const [openTxModal, setOpenTxModal] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txError, setTxError] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIsBorrow, setModalIsBorrow] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<
    USDPricedPoolAsset | undefined
  >(undefined);

  const { sdk } = useMarket();
  const poolId = location && new URLSearchParams(location.search).get('poolId');
  const poolData = usePoolData(poolId, LENDING_QS_POOL_DIRECTORY[chainIdToUse]);

  const extraPoolData = useExtraPoolData(
    poolData?.pool.comptroller,
    account ?? undefined,
  );

  const borrowLimit = useBorrowLimit(poolData?.assets);

  const poolUtilization = !poolData
    ? 0
    : !poolData.totalSuppliedUSD
    ? 0
    : (poolData.totalBorrowedUSD / poolData.totalSuppliedUSD) * 100;

  const lendDataArr = [
    {
      label: t('totalSupply'),
      data: poolData ? midUsdFormatter(poolData.totalSuppliedUSD) : undefined,
    },
    {
      label: t('totalBorrowed'),
      data: poolData ? midUsdFormatter(poolData.totalBorrowedUSD) : undefined,
    },
    {
      label: t('liquidity'),
      data: poolData ? midUsdFormatter(poolData.totalLiquidityUSD) : undefined,
    },
    {
      label: t('poolUtilization'),
      data: poolData ? poolUtilization.toFixed(2) + '%' : undefined,
    },
  ];

  const poolDetails = [
    {
      label: t('totalSupplied'),
      data: poolData ? midUsdFormatter(poolData.totalSuppliedUSD) : undefined,
    },
    {
      label: t('totalBorrowed'),
      data: poolData ? midUsdFormatter(poolData.totalBorrowedUSD) : undefined,
    },
    {
      label: t('availableLiquidity'),
      data: poolData ? midUsdFormatter(poolData.totalLiquidityUSD) : undefined,
    },
    {
      label: t('poolUtilization'),
      data: poolData ? poolUtilization.toFixed(2) + '%' : undefined,
    },
    {
      label: t('upgradable'),
      data: extraPoolData
        ? extraPoolData.upgradeable
          ? 'Yes'
          : 'No'
        : undefined,
    },
    {
      label: t('admin'),
      data: extraPoolData ? (
        <Box className='flex items-center'>
          <small>{shortenAddress(extraPoolData.admin)}</small>
          <CopyHelper toCopy={extraPoolData.admin} />
        </Box>
      ) : (
        undefined
      ),
    },
    {
      label: t('platformFee'),
      data: poolData
        ? poolData.assets.length > 0
          ? (Number(poolData.assets[0].fuseFee.toString()) / 1e16).toFixed(2) +
            '%'
          : '10%'
        : undefined,
    },
    {
      label: t('averageAdminFee'),
      data: poolData
        ? poolData.assets
            .reduce(
              (a, b, _, { length }) =>
                a + Number(b.adminFee.toString()) / 1e16 / length,
              0,
            )
            .toLocaleString()
        : undefined,
    },
    {
      label: t('closeFactor'),
      data: extraPoolData ? extraPoolData.closeFactor / 1e16 + '%' : undefined,
    },
    {
      label: t('liquidationIncentive'),
      data: extraPoolData
        ? extraPoolData.liquidationIncentive / 1e16 - 100 + '%'
        : undefined,
    },
    {
      label: t('oracle'),
      data: extraPoolData ? shortenAddress(extraPoolData.oracle) : undefined,
    },
    {
      label: t('whitelist'),
      data: extraPoolData
        ? extraPoolData.enforceWhitelist
          ? 'Yes'
          : 'No'
        : undefined,
    },
  ];

  return (
    <>
      <Box width={'100%'}>
        <Box mb={3}>
          <AdsSlider sort='lend' />
        </Box>
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
                withoutBg={
                  asset.underlyingName.includes('LP') ||
                  asset.underlyingSymbol.includes('am') ||
                  asset.underlyingSymbol.includes('moo')
                }
              />
            ))}
          </Box>
        </Box>
        <Box my={'24px'}>
          <h5>{t('lendPageTitle')}</h5>
        </Box>
        <Grid container spacing={3}>
          {lendDataArr.map((item) => (
            <Grid key={item.label} item xs={12} sm={6} md={3}>
              <Box className='lendPageData'>
                <small className='text-secondary'>{item.label}</small>
                {item.data ? (
                  <h4>{item.data}</h4>
                ) : (
                  <Skeleton variant='rect' height={40} />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
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
                      <small>
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
                        <TableCell>
                          <Box maxWidth='180px'>
                            {t('asset')} / {t('ltv')}
                          </Box>
                        </TableCell>
                        <TableCell className='poolTableHideCell'>
                          {t('supplyapy')}
                        </TableCell>
                        <TableCell>
                          <Box maxWidth='150px'>{t('deposited')}</Box>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {poolData?.assets.map((asset) => {
                        return (
                          <TableRow key={asset.cToken.address}>
                            <TableCell>
                              <Box
                                className='flex items-center'
                                maxWidth='180px'
                              >
                                <Box display={'flex'} mr='8px'>
                                  <CurrencyLogo
                                    currency={getPoolAssetToken(asset, chainId)}
                                    size={'36px'}
                                    withoutBg={
                                      asset.underlyingName.includes('LP') ||
                                      asset.underlyingSymbol.includes('am') ||
                                      asset.underlyingSymbol.includes('moo')
                                    }
                                  />
                                </Box>
                                <Box flex={1}>
                                  <small>
                                    {asset.underlyingSymbol +
                                      (asset.underlyingName.includes('LP')
                                        ? ' LP'
                                        : '')}
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
                            </TableCell>
                            <TableCell className='poolTableHideCell'>
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
                                    withoutBg={
                                      asset.underlyingName.includes('LP') ||
                                      asset.underlyingSymbol.includes('am') ||
                                      asset.underlyingSymbol.includes('moo')
                                    }
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box maxWidth='150px'>
                                <small>
                                  {midUsdFormatter(asset.supplyBalanceUSD)}
                                </small>
                                <p className='caption text-secondary'>
                                  {sdk
                                    ? convertBNToNumber(
                                        asset.supplyBalance,
                                        asset.underlyingDecimals,
                                      ).toFixed(2)
                                    : '?'}{' '}
                                  {asset.underlyingName.includes('LP')
                                    ? 'LP'
                                    : asset.underlyingSymbol}
                                </p>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Button
                                disabled={
                                  !account ||
                                  !sdk ||
                                  asset.underlyingToken ===
                                    selectedAsset?.underlyingToken
                                }
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  if (!asset.membership && account && sdk) {
                                    setTxLoading(true);
                                    setTxHash(undefined);
                                    setTxError('');
                                    setOpenTxModal(true);
                                    toggleCollateral(
                                      asset,
                                      account,
                                      asset.membership
                                        ? t('cannotExitMarket')
                                        : t('cannotEnterMarket'),
                                      sdk,
                                    )
                                      .then((txResponse) => {
                                        setTxHash(txResponse.transactionHash);
                                        setTxLoading(false);
                                        setSelectedAsset(undefined);
                                      })
                                      .catch((e) => {
                                        setTxError(t('errorInTx'));
                                        setTxLoading(false);
                                        setSelectedAsset(undefined);
                                      });
                                  } else {
                                    setModalOpen(true);
                                    setModalIsBorrow(false);
                                  }
                                }}
                              >
                                {!asset.membership
                                  ? t('enterMarket')
                                  : t('deposit')}
                              </Button>
                            </TableCell>
                          </TableRow>
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
                  <Box className='poolDetailsItemTag bg-error' />
                  <h6>{t('borrow')}</h6>
                  <Box display={'flex'}>
                    <small>{t('yourborrowbalance')}:&nbsp;</small>
                    {poolData ? (
                      <small>
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
                        <TableCell>{t('asset')}</TableCell>
                        <TableCell className='poolTableHideCell'>
                          {t('apr')} / {t('tvl')}
                        </TableCell>
                        <TableCell>{t('borrowed')}</TableCell>
                        <TableCell>{t('liquidity')}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {poolData?.assets.map((asset) => {
                        if (asset.isPaused) {
                          return null;
                        }
                        return (
                          <TableRow key={asset.cToken.address}>
                            <TableCell>
                              <Box
                                display={'flex'}
                                alignItems={'center'}
                                maxWidth='150px'
                              >
                                <Box display='flex' mr='8px'>
                                  <CurrencyLogo
                                    currency={getPoolAssetToken(asset, chainId)}
                                    size={'36px'}
                                    withoutBg={
                                      asset.underlyingName.includes('LP') ||
                                      asset.underlyingSymbol.includes('am') ||
                                      asset.underlyingSymbol.includes('moo')
                                    }
                                  />
                                </Box>
                                <small>
                                  {asset.underlyingSymbol +
                                    (asset.underlyingName.includes('LP')
                                      ? ' LP'
                                      : '')}
                                </small>
                              </Box>
                            </TableCell>
                            <TableCell className='poolTableHideCell'>
                              <p className='caption'>
                                {convertMantissaToAPR(
                                  asset.borrowRatePerBlock,
                                ).toFixed(2)}
                                %
                              </p>
                              <p className='caption text-secondary'>
                                {shortUsdFormatter(asset.totalSupplyUSD)}{' '}
                                {t('tvl')}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Box maxWidth='120px'>
                                <small>
                                  {midUsdFormatter(asset.borrowBalanceUSD)}
                                </small>
                                <p className='caption text-secondary'>
                                  {sdk
                                    ? convertBNToNumber(
                                        asset.borrowBalance,
                                        asset.underlyingDecimals,
                                      ).toFixed(2)
                                    : '?'}{' '}
                                  {asset.underlyingName.includes('LP')
                                    ? 'LP'
                                    : asset.underlyingSymbol}
                                </p>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box maxWidth='120px'>
                                <small>
                                  {midUsdFormatter(asset.liquidityUSD)}
                                </small>
                                <p className='caption text-secondary'>
                                  {sdk
                                    ? convertBNToNumber(
                                        asset.liquidity,
                                        asset.underlyingDecimals,
                                      ).toFixed(2)
                                    : '?'}{' '}
                                  {asset.underlyingName.includes('LP')
                                    ? 'LP'
                                    : asset.underlyingSymbol}
                                </p>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Button
                                disabled={!account}
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setModalOpen(true);
                                  setModalIsBorrow(true);
                                }}
                              >
                                {t('borrow')}
                              </Button>
                            </TableCell>
                          </TableRow>
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
                <Grid container>
                  {poolDetails.map((item, ind) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      key={ind}
                      className='poolDetailsInfoItem'
                    >
                      <small>{item.label}:</small>
                      {item.data ? (
                        <small>{item.data}</small>
                      ) : (
                        <Skeleton variant='rect' width={40} height={23} />
                      )}
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {poolData && <LendDetailAssetStats poolData={poolData} />}
          </Grid>
        </Box>
      </Box>

      {modalOpen && selectedAsset && (
        <QuickModalContent
          open={modalOpen}
          onClose={() => {
            setSelectedAsset(undefined);
            setModalOpen(false);
          }}
          asset={selectedAsset}
          borrow={modalIsBorrow}
        />
      )}
      {openTxModal && (
        <TransactionConfirmationModal
          isOpen={openTxModal}
          onDismiss={() => setOpenTxModal(false)}
          attemptingTxn={txLoading}
          hash={txHash}
          txPending={false}
          modalContent=''
          content={() =>
            txError ? (
              <TransactionErrorContent
                onDismiss={() => setOpenTxModal(false)}
                message={txError}
              />
            ) : (
              <></>
            )
          }
        />
      )}
    </>
  );
};

export default LendDetailPage;
