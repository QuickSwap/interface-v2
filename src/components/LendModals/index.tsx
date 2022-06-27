import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Input } from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import { USDPricedPoolAsset } from 'utils/marketxyz/fetchPoolData';
import { midUsdFormatter } from 'utils/bigUtils';

import * as MarketUtils from 'utils/marketxyz';
import { convertMantissaToAPR, convertMantissaToAPY } from 'utils/marketxyz';

import { getEthPrice } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  ToggleSwitch,
  CustomModal,
  ButtonSwitch,
  TransactionConfirmationModal,
  TransactionErrorContent,
} from 'components';
import { useTranslation } from 'react-i18next';
import 'components/styles/LendModal.scss';

interface QuickModalContentProps {
  confirm?: boolean;
  withdraw?: boolean;
  borrow?: boolean;
  asset: USDPricedPoolAsset;
  borrowLimit: number;
  open: boolean;
  onClose: () => void;
}
export const QuickModalContent: React.FC<QuickModalContentProps> = ({
  confirm,
  withdraw,
  borrow,
  asset,
  borrowLimit,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txError, setTxError] = useState('');
  const [txPending, setTxPending] = useState<boolean>(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [isRepay, setisRepay] = useState(confirm ? true : false);
  const [modalType, setModalType] = useState(borrow ? 'borrow' : 'supply');
  const [value, setValue] = useState('');
  const [enableAsCollateral, setEnableAsCollateral] = useState<boolean>(false);
  const isWithdraw = modalType === 'withdraw';
  const buttonDisabled = !account || Number(value) <= 0;
  const buttonText = useMemo(() => {
    if (!account) {
      return t('connectWallet');
    } else if (Number(value) <= 0) {
      return t('enterAmount');
    }
    return t('confirm');
  }, [account, t, value]);

  const [ethPrice, setEthPrice] = useState<number>();

  useEffect(() => {
    getEthPrice().then(([price]) => setEthPrice(price));
  }, []);

  return (
    <>
      {txError || loading ? (
        <TransactionConfirmationModal
          isOpen={true}
          onDismiss={onClose}
          attemptingTxn={loading}
          hash={txHash}
          txPending={txPending}
          content={() =>
            txError ? (
              <TransactionErrorContent onDismiss={onClose} message={txError} />
            ) : (
              <></>
            )
          }
        />
      ) : (
        <CustomModal open={open} onClose={onClose}>
          <Box className='lendModalWrapper'>
            <ButtonSwitch
              height={56}
              padding={6}
              value={modalType}
              onChange={setModalType}
              items={[
                {
                  label: borrow ? t('borrow') : t('supply'),
                  value: borrow ? 'borrow' : 'supply',
                },
                {
                  label: borrow ? t('repay') : t('withdraw'),
                  value: borrow ? 'repay' : 'withdraw',
                },
              ]}
            />
            <Box mt={'24px'} className='flex justify-between items-center'>
              <span className='text-secondary text-uppercase'>
                {!borrow ? t('supplyAmount') : t('borrowAmount')}
              </span>
              {(modalType === 'supply' || modalType === 'repay') && (
                <p className='caption text-secondary'>
                  {withdraw ? t('supplied') : t('balance')}:{' '}
                  {(
                    Number(asset.underlyingBalance.toString()) /
                    10 ** Number(asset.underlyingDecimals.toString())
                  ).toLocaleString()}{' '}
                  {asset.underlyingSymbol}
                </p>
              )}
            </Box>
            <Box
              mt={2}
              className={`lendModalInput ${inputFocused ? 'focused' : ''}`}
            >
              <Box>
                <Input
                  type={'text'}
                  disableUnderline={true}
                  placeholder={'0.00'}
                  value={value}
                  onChange={(e) => {
                    setValue(e.currentTarget.value);
                  }}
                />
                <p className='span text-secondary'>
                  (
                  {ethPrice
                    ? midUsdFormatter(
                        ((Number(asset.underlyingPrice.toString()) /
                          10 ** Number(asset.underlyingDecimals.toString()) /
                          10 ** 17) *
                          Number(value)) /
                          ethPrice,
                      )
                    : '?'}
                  )
                </p>
              </Box>
              <Box
                className='lendMaxButton'
                onClick={() => {
                  setValue(
                    (
                      Number(asset.underlyingBalance.toString()) /
                      10 ** asset.underlyingDecimals.toNumber()
                    ).toString(),
                  );
                }}
              >
                {t('max')}
              </Box>
            </Box>
            <Box my={3} className='lendModalContentWrapper'>
              {!borrow ? (
                <>
                  <Box className='lendModalRow'>
                    <p>{t('suppliedBalance')}:</p>
                    <p>
                      {!confirm ? (
                        (
                          Number(asset.supplyBalance.toString()) /
                          10 ** Number(asset.underlyingDecimals.toString())
                        ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol
                      ) : (
                        <>
                          {(
                            Number(asset.supplyBalance.toString()) /
                            10 ** Number(asset.underlyingDecimals.toString())
                          ).toFixed(3) +
                            ' ' +
                            asset.underlyingSymbol}
                          <ArrowForward fontSize='small' />
                          {(
                            Number(asset.supplyBalance.toString()) /
                              10 **
                                Number(asset.underlyingDecimals.toString()) +
                            Number(value)
                          ).toFixed(3) +
                            ' ' +
                            asset.underlyingSymbol}
                        </>
                      )}
                    </p>
                  </Box>
                  <Box className='lendModalRow'>
                    <p>{t('supplyapy')}:</p>
                    <p>
                      {convertMantissaToAPY(asset.supplyRatePerBlock, 365)}%
                    </p>
                  </Box>
                  <Box className='lendModalRow'>
                    <p>{t('borrowLimit')}:</p>
                    <p>
                      {!confirm ? (
                        midUsdFormatter(borrowLimit)
                      ) : (
                        <>
                          {midUsdFormatter(borrowLimit)}
                          <ArrowForward fontSize='small' />
                          {midUsdFormatter(borrowLimit - Number(value))}
                        </>
                      )}
                    </p>
                  </Box>
                  <Box className='lendModalRow'>
                    <p>{t('totalDebtBalance')}:</p>
                    <p>{midUsdFormatter(asset.borrowBalanceUSD)}</p>
                  </Box>
                </>
              ) : (
                <>
                  <Box className='lendModalRow'>
                    <p>{t('borrowedBalance')}:</p>
                    <p>
                      {!confirm ? (
                        (
                          Number(asset.borrowBalance.toString()) /
                          10 ** Number(asset.underlyingDecimals.toString())
                        ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol
                      ) : (
                        <>
                          {(
                            Number(asset.borrowBalance.toString()) /
                            10 ** Number(asset.underlyingDecimals.toString())
                          ).toFixed(3) +
                            ' ' +
                            asset.underlyingSymbol}
                          <ArrowForward fontSize='small' />
                          {(
                            Number(asset.borrowBalance.toString()) /
                              10 **
                                Number(asset.underlyingDecimals.toString()) +
                            Number(value)
                          ).toFixed(3) +
                            ' ' +
                            asset.underlyingSymbol}
                        </>
                      )}
                    </p>
                  </Box>
                  <Box className='lendModalRow'>
                    <p>{t('suppliedBalance')}:</p>
                    <p>
                      {!confirm ? (
                        (
                          Number(asset.supplyBalance.toString()) /
                          10 ** Number(asset.underlyingDecimals.toString())
                        ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol
                      ) : (
                        <>
                          {(
                            Number(asset.supplyBalance.toString()) /
                            10 ** Number(asset.underlyingDecimals.toString())
                          ).toFixed(3) +
                            ' ' +
                            asset.underlyingSymbol}
                          <ArrowForward fontSize='small' />
                          {(
                            Number(asset.supplyBalance.toString()) /
                              10 **
                                Number(asset.underlyingDecimals.toString()) +
                            Number(value)
                          ).toFixed(3) +
                            ' ' +
                            asset.underlyingSymbol}
                        </>
                      )}
                    </p>
                  </Box>
                  <Box className='lendModalRow'>
                    <p>{t('borrowAPR')}:</p>
                    <p>{convertMantissaToAPR(asset.borrowRatePerBlock)}%</p>
                  </Box>
                  <Box className='lendModalRow'>
                    <p>{t('borrowLimit')}:</p>
                    <p>{midUsdFormatter(borrowLimit)}</p>
                  </Box>
                  <Box className='lendModalRow'>
                    <p>{t('totalDebtBalance')}:</p>
                    <p>
                      {!confirm ? (
                        (
                          Number(asset.borrowBalance.toString()) /
                          10 ** Number(asset.underlyingDecimals.toString())
                        ).toFixed(3) +
                        ' ' +
                        asset.underlyingSymbol
                      ) : (
                        <>
                          {(
                            Number(asset.borrowBalance.toString()) /
                            10 ** Number(asset.underlyingDecimals.toString())
                          ).toFixed(3) +
                            ' ' +
                            asset.underlyingSymbol}
                          <ArrowForward fontSize='small' />
                          {(
                            Number(asset.borrowBalance.toString()) /
                              10 **
                                Number(asset.underlyingDecimals.toString()) +
                            Number(value)
                          ).toFixed(3) +
                            ' ' +
                            asset.underlyingSymbol}
                        </>
                      )}
                    </p>
                  </Box>
                </>
              )}
            </Box>
            {!borrow && !isWithdraw && (
              <Box className='lendModalContentWrapper'>
                <Box className='lendModalRow'>
                  <p>{t('enableAsCollateral')}</p>
                  <ToggleSwitch
                    toggled={enableAsCollateral}
                    onToggle={() => {
                      setEnableAsCollateral(
                        (enableAsCollateral) => !enableAsCollateral,
                      );
                    }}
                  />
                </Box>
              </Box>
            )}
            <Box mt={'24px'}>
              <Button
                fullWidth
                disabled={buttonDisabled}
                onClick={async () => {
                  if (!account) return;
                  setLoading(true);
                  let txResponse;
                  try {
                    if (borrow) {
                      if (isRepay) {
                        txResponse = await MarketUtils.repayBorrow(
                          asset,
                          Number(value),
                          account,
                        );
                      } else {
                        txResponse = await MarketUtils.borrow(
                          asset,
                          Number(value),
                          account,
                        );
                      }
                    } else {
                      if (isWithdraw) {
                        txResponse = await MarketUtils.withdraw(
                          asset,
                          Number(value),
                          account,
                        );
                      } else {
                        txResponse = await MarketUtils.supply(
                          asset,
                          Number(value),
                          account,
                          enableAsCollateral,
                        );
                      }
                    }
                    setTxPending(true);
                    setTxHash(txResponse.hash);
                    setLoading(false);
                  } catch (e) {
                    console.log(e);
                    setTxError(t('errorInTx'));
                    setLoading(false);
                  }
                }}
              >
                {buttonText}
              </Button>
            </Box>
          </Box>
        </CustomModal>
      )}
    </>
  );
};
