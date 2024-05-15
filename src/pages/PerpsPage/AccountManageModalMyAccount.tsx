import React, { useMemo, useState } from 'react';
import { CopyHelper } from 'components';
import { Box, Button, Grid, useMediaQuery, useTheme } from '@material-ui/core';
import { Refresh, Visibility, VisibilityOff } from '@material-ui/icons';
import './Layout.scss';
import {
  useAccount,
  useAccountInfo,
  useCollateral,
  useLeverage,
  usePositionStream,
  usePrivateQuery,
} from '@orderly.network/hooks';
import AccountTierImage from 'assets/images/AccountManageTier.webp';
import { AccountLeverageSlider } from './AccountLeverageSlider';
import { formatNumber, shortenAddress, shortenTx } from 'utils';
import AssetModal from 'components/AssetModal';
import { useOrderlyAPIKey } from 'hooks/useOrderlyData';
import OrderlyAPITradingKeysModal from './OrderlyAPITradingKeysModal';
import { getOrderlyFeeTiers } from 'config/index';

const AccountManageModalMyAccount: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const { data: accountInfo } = useAccountInfo();
  const { account, state: accountState } = useAccount();
  const [data] = usePositionStream();

  const { totalCollateral, totalValue } = useCollateral();

  const futureMarginRatio = useMemo(() => {
    if (
      totalCollateral !== 0 &&
      Number(data?.aggregated?.notional ?? 0) !== 0
    ) {
      return (totalCollateral / Number(data?.aggregated?.notional ?? 0)) * 100;
    }
    return 1000;
  }, [data?.aggregated?.notional, totalCollateral]);

  const unsettledPnLPercent = useMemo(() => {
    if (totalValue !== 0 || Number(data?.aggregated?.unsettledPnL ?? 0) !== 0) {
      const unsettledPnL = Number(data?.aggregated?.unsettledPnL ?? 0);
      return totalValue - unsettledPnL > 0
        ? (unsettledPnL / (totalValue - unsettledPnL)) * 100
        : 0;
    }
    return 0;
  }, [data?.aggregated?.unsettledPnL, totalValue]);

  const [maxLeverage, { update }] = useLeverage();
  const [leverage, setLeverage] = useState<number | undefined>(undefined);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [hideValue, setHideValue] = useState(false);
  const [settlingPNL, setSettlingPNL] = useState(false);

  const updateLeverage = async () => {
    setLoadingUpdate(true);
    try {
      await update({ leverage });
      setLoadingUpdate(false);
    } catch (e) {
      setLoadingUpdate(false);
    }
  };

  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetModalType, setAssetModalType] = useState('deposit');

  const { data: userStats } = usePrivateQuery('/v1/client/statistics');

  const { data: orderlyAPIKey } = useOrderlyAPIKey();

  const [openKeyModal, setOpenKeyModal] = useState(false);

  const orderlyFeeTiers = getOrderlyFeeTiers();
  const currentFeeTier = orderlyFeeTiers.find(
    (item) =>
      item['maker_fee'].toFixed(3) ===
        (Number(accountInfo?.futures_maker_fee_rate ?? 0) / 100).toFixed(3) &&
      item['taker_fee'].toFixed(3) ===
        (Number(accountInfo?.futures_taker_fee_rate ?? 0) / 100).toFixed(3),
  );

  return (
    <>
      <Box className='accountPanelWrapper'>
        <Grid container>
          <Grid item xs={12} sm={12} md={6}>
            <Box
              p={2}
              className={`${
                isMobile ? 'border-bottom' : 'border-right'
              } flex flex-col`}
              gridGap={28}
            >
              <Box className='flex items-center justify-between'>
                <small className='text-secondary'>24 Hour Volume</small>
                <small>
                  {formatNumber(
                    (userStats as any)?.perp_trading_volume_last_24_hours,
                  )}{' '}
                  <small className='text-secondary'>USDC</small>
                </small>
              </Box>
              <Box className='flex items-center justify-between'>
                <small className='text-secondary'>30 Day Volume</small>
                <small>
                  {formatNumber(
                    (userStats as any)?.perp_trading_volume_last_30_days,
                  )}{' '}
                  <small className='text-secondary'>USDC</small>
                </small>
              </Box>
              <Box className='flex items-center justify-between'>
                <small className='text-secondary'>YTD Volume</small>
                <small>
                  {formatNumber((userStats as any)?.perp_trading_volume_ytd)}{' '}
                  <small className='text-secondary'>USDC</small>
                </small>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Box
              position='relative'
              height='100%'
              className='flex flex-col items-center justify-end'
              py={2}
              gridGap={8}
              minHeight={150}
            >
              <img src={AccountTierImage} width={64} />
              <small className='text-secondary'>
                Current Tier:{' '}
                <small className='text-primaryText'>
                  {currentFeeTier?.tier}
                </small>
              </small>
              {/* <small className='text-primary cursor-pointer'>View more</small> */}
              <Box position='absolute' right={0} top={8}>
                <small className='span text-secondary'>
                  Updated daily by 2:00 UTC
                </small>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={6}>
            <Box className='accountPanelWrapper'>
              <small>Max Account Leverage</small>
              <Box className='border-top' pt={2} mt={2}>
                <p className='span'>
                  All eligible assets are counted as collateral for futures
                  position. You may adjust the maximum leverage below.
                </p>
              </Box>
              <Box mt={2}>
                <Box mt={-1} mb={2} className='flex justify-end'>
                  <Button
                    className='accountPanelButton'
                    disabled={
                      !leverage ||
                      Number(maxLeverage) === leverage ||
                      loadingUpdate
                    }
                    onClick={updateLeverage}
                  >
                    {loadingUpdate ? 'Updating' : 'Update'}
                  </Button>
                </Box>
                <AccountLeverageSlider
                  leverage={leverage}
                  setLeverage={setLeverage}
                />
              </Box>
            </Box>
            <Box className='accountPanelWrapper' mt={2}>
              <Box className='flex justify-between'>
                <small>Balance</small>
                <Box className='flex items-center' gridGap={8}>
                  <Button
                    className='accountPanelButton'
                    onClick={() => {
                      setAssetModalOpen(true);
                      setAssetModalType('deposit');
                    }}
                  >
                    Deposit
                  </Button>
                  <Button
                    className='accountPanelButton'
                    onClick={() => {
                      setAssetModalOpen(true);
                      setAssetModalType('withdraw');
                    }}
                  >
                    Withdraw
                  </Button>
                </Box>
              </Box>
              <Box className='border-top flex justify-between' pt={2} mt={2}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={4}>
                    <Box className='flex flex-col' gridGap={8}>
                      <span className='text-secondary'>
                        Total estimate value
                      </span>
                      <small>
                        {hideValue ? '***' : formatNumber(totalValue)}{' '}
                        <span className='text-secondary'>USDC</span>
                      </small>
                      <Box
                        className='flex items-center text-primary cursor-pointer'
                        gridGap={4}
                        onClick={() => {
                          setHideValue(!hideValue);
                        }}
                      >
                        {hideValue ? (
                          <Visibility fontSize='small' />
                        ) : (
                          <VisibilityOff fontSize='small' />
                        )}
                        <span>{hideValue ? 'Show' : 'Hide'} Value</span>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box className='flex flex-col' gridGap={8}>
                      <span className='text-secondary'>Unreal. PnL (USDC)</span>
                      <small>
                        {hideValue
                          ? '***'
                          : formatNumber(data?.aggregated?.unrealPnL)}{' '}
                        <span className='text-secondary'>
                          (
                          {hideValue
                            ? '***'
                            : formatNumber(
                                Number(data?.aggregated?.unrealPnlROI ?? 0) *
                                  100,
                              )}
                          %)
                        </span>
                      </small>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box className='flex flex-col' gridGap={8}>
                      <span className='text-secondary'>
                        Unsettled PnL (USDC)
                      </span>
                      <small>
                        {hideValue
                          ? '***'
                          : formatNumber(data?.aggregated?.unsettledPnL)}{' '}
                        <span className='text-secondary'>
                          (
                          {hideValue
                            ? '***'
                            : formatNumber(unsettledPnLPercent)}
                          %)
                        </span>
                      </small>
                      {Number(data?.aggregated?.unsettledPnL ?? 0) !== 0 && (
                        <Box
                          className={`flex items-center text-primary${
                            settlingPNL
                              ? ' opacity-disabled'
                              : ' cursor-pointer'
                          }`}
                          gridGap={4}
                          onClick={async () => {
                            if (!settlingPNL) {
                              setSettlingPNL(true);
                              try {
                                await account.settle();
                                setSettlingPNL(false);
                              } catch {
                                setSettlingPNL(false);
                              }
                            }
                          }}
                        >
                          <Refresh fontSize='small' />
                          <span>{settlingPNL ? 'Settling' : 'Settle'} PnL</span>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Box className='accountPanelWrapper' mt={2}>
              <small>Account Info</small>
              <Box
                className='border-top flex justify-between items-start'
                pt={2}
                mt={2}
              >
                <Box className='flex flex-col' gridGap={16}>
                  {/* <Box className='accountPanelRow'>
                    <span>Email</span>
                    <span className='text-secondary'>
                      {accountInfo?.email ?? 'Bind email for notification'}
                    </span>
                  </Box> */}
                  <Box className='accountPanelRow'>
                    <span>Web3 Wallet</span>
                    <span>{shortenAddress(account.address ?? '')}</span>
                  </Box>
                  <Box className='accountPanelRow'>
                    <span>UID</span>
                    <span>{accountState.userId}</span>
                  </Box>
                </Box>
                {/* <Button className='accountPanelButton'>Bind</Button> */}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Box className='accountPanelWrapper'>
              <small>Futures Margin Ratio</small>
              <Box
                className='border-top flex flex-col'
                gridGap={16}
                pt={2}
                mt={2}
              >
                <p className='span'>
                  Futures Margin Ratio represents your amount of collateral
                  posted relative to the value of your positions outstanding.
                </p>
                <h5 className='text-primary weight-500'>
                  {formatNumber(futureMarginRatio)}%
                </h5>
                <p className='span'>
                  Futures margin ratio = Total collateral / Total position
                  notional
                </p>
              </Box>
            </Box>
            <Box className='accountPanelWrapper' mt={2}>
              <small>Futures Trading Fee</small>
              <Box className='border-top' pt={2} mt={2}>
                <Box className='accountPanelRow'>
                  <span>Maker Fee</span>
                  <span>
                    {formatNumber(
                      Number(accountInfo?.futures_maker_fee_rate ?? 0) / 100,
                    )}
                    %
                  </span>
                </Box>
                <Box className='accountPanelRow' mt={2}>
                  <span>Taker Fee</span>
                  <span>
                    {formatNumber(
                      Number(accountInfo?.futures_taker_fee_rate ?? 0) / 100,
                    )}
                    %
                  </span>
                </Box>
              </Box>
            </Box>
            <Box className='accountPanelWrapper' mt={2}>
              <Box className='flex justify-between'>
                <small>API Trading</small>
                <Box className='flex items-center justify-between' gridGap={8}>
                  <Button
                    className='accountPanelButton'
                    onClick={() => setOpenKeyModal(true)}
                  >
                    Reveal Keys
                  </Button>
                  <a
                    href='https://orderly.network/docs/build-on-evm/evm-api/introduction'
                    target='_blank'
                    rel='noreferrer'
                    className='text-primaryText span text-underline'
                  >
                    API Documents
                  </a>
                </Box>
              </Box>
              <Box className='border-top' pt={2} mt={2}>
                <Box className='accountPanelRow'>
                  <span>Account</span>
                  <Box
                    className='flex items-center text-primaryText'
                    gridGap={6}
                  >
                    <span>{shortenTx(account.accountId ?? '')}</span>
                    <CopyHelper toCopy={account.accountId ?? ''} />
                  </Box>
                </Box>
                <Box className='accountPanelRow' mt={2}>
                  <span>Orderly API Key</span>
                  <Box
                    className='flex items-center text-primaryText'
                    gridGap={6}
                  >
                    <span>{shortenTx(orderlyAPIKey?.key ?? '')}</span>
                    <CopyHelper toCopy={account.accountId ?? ''} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {assetModalOpen && (
        <AssetModal
          open={assetModalOpen}
          onClose={() => setAssetModalOpen(false)}
          modalType={assetModalType}
        />
      )}
      {openKeyModal && (
        <OrderlyAPITradingKeysModal
          open={openKeyModal}
          onClose={() => setOpenKeyModal(false)}
        />
      )}
    </>
  );
};
export default AccountManageModalMyAccount;
