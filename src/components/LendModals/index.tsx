import React, { useMemo, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import { USDPricedPoolAsset } from 'utils/marketxyz/fetchPoolData';
import { midUsdFormatter } from 'utils/bigUtils';

import {
  repayBorrow,
  borrow as poolBorrow,
  withdraw as poolWithDraw,
  supply,
  convertBNToNumber,
  convertMantissaToAPR,
  convertMantissaToAPY,
} from 'utils/marketxyz';

import { getDaysCurrentYear } from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  ToggleSwitch,
  CustomModal,
  ButtonSwitch,
  TransactionConfirmationModal,
  TransactionErrorContent,
  NumericalInput,
} from 'components';
import { useTranslation } from 'react-i18next';
import 'components/styles/LendModal.scss';

interface QuickModalContentProps {
  withdraw?: boolean;
  borrow?: boolean;
  asset: USDPricedPoolAsset;
  borrowLimit: number;
  open: boolean;
  onClose: () => void;
}
export const QuickModalContent: React.FC<QuickModalContentProps> = ({
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
  const [inputFocused, setInputFocused] = useState(false);
  const [modalType, setModalType] = useState(borrow ? 'borrow' : 'supply');
  const [value, setValue] = useState('');
  const [enableAsCollateral, setEnableAsCollateral] = useState<boolean>(false);
  const buttonDisabled = !account || Number(value) <= 0;
  const buttonText = useMemo(() => {
    if (!account) {
      return t('connectWallet');
    } else if (Number(value) <= 0) {
      return t('enterAmount');
    }
    return t('confirm');
  }, [account, t, value]);

  const supplyBalance = convertBNToNumber(
    asset.supplyBalance,
    asset.underlyingDecimals,
  );

  const borrowBalance = convertBNToNumber(
    asset.borrowBalance,
    asset.underlyingDecimals,
  );

  const underlyingBalance = convertBNToNumber(
    asset.underlyingBalance,
    asset.underlyingDecimals,
  );

  const showArrow = Number(value) > 0;

  return (
    <>
      {txError || loading || txHash ? (
        <TransactionConfirmationModal
          isOpen={true}
          onDismiss={onClose}
          attemptingTxn={loading}
          hash={txHash}
          txPending={false}
          modalContent=''
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
                <NumericalInput
                  placeholder={'0.00'}
                  value={value}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onUserInput={(val) => {
                    setValue(val);
                  }}
                />
                <p className='span text-secondary'>
                  ({midUsdFormatter(asset.usdPrice * Number(value))})
                </p>
              </Box>
              <Box
                className='lendMaxButton'
                onClick={() => {
                  setValue(underlyingBalance.toString());
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
                      {`${supplyBalance.toLocaleString()} ${
                        asset.underlyingSymbol
                      }`}
                      {showArrow && (
                        <>
                          <ArrowForward fontSize='small' />
                          {`${(
                            supplyBalance + Number(value)
                          ).toLocaleString()} ${asset.underlyingSymbol}`}
                        </>
                      )}
                    </p>
                  </Box>
                  <Box className='lendModalRow'>
                    <p>{t('supplyapy')}:</p>
                    <p className='text-success'>
                      {convertMantissaToAPY(
                        asset.supplyRatePerBlock,
                        getDaysCurrentYear(),
                      ).toLocaleString()}
                      %
                    </p>
                  </Box>
                  <Box className='lendModalRow'>
                    <p>{t('borrowLimit')}:</p>
                    <p>
                      {midUsdFormatter(borrowLimit)}
                      {showArrow && (
                        <>
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
                      ${borrowBalance.toLocaleString()}
                      {showArrow && (
                        <>
                          <ArrowForward fontSize='small' />
                          {'$' +
                            (borrowBalance + Number(value)).toLocaleString()}
                        </>
                      )}
                    </p>
                  </Box>
                  <Box className='lendModalRow'>
                    <p>{t('suppliedBalance')}:</p>
                    <p>
                      {`${supplyBalance.toLocaleString()} ${
                        asset.underlyingSymbol
                      }`}
                      {showArrow && (
                        <>
                          <ArrowForward fontSize='small' />
                          {`${(
                            supplyBalance + Number(value)
                          ).toLocaleString()} ${asset.underlyingSymbol}`}
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
                      ${borrowBalance.toLocaleString()}
                      {showArrow && (
                        <>
                          <ArrowForward fontSize='small' />
                          {'$' +
                            (borrowBalance + Number(value)).toLocaleString()}
                        </>
                      )}
                    </p>
                  </Box>
                </>
              )}
            </Box>
            {!borrow && modalType === 'withdraw' && (
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
                  setTxError('');
                  let txResponse;
                  try {
                    if (borrow) {
                      if (modalType === 'repay') {
                        txResponse = await repayBorrow(
                          asset,
                          Number(value),
                          account,
                        );
                      } else {
                        txResponse = await poolBorrow(
                          asset,
                          Number(value),
                          account,
                        );
                      }
                    } else {
                      if (modalType === 'withdraw') {
                        txResponse = await poolWithDraw(
                          asset,
                          Number(value),
                          account,
                        );
                      } else {
                        txResponse = await supply(
                          asset,
                          Number(value),
                          account,
                          enableAsCollateral,
                        );
                      }
                    }
                    setTxHash(txResponse.transactionHash);
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
