import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import { USDPricedPoolAsset } from 'utils/marketxyz/fetchPoolData';
import JumpRateModel from 'utils/marketxyz/interestRateModel';
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
import { useBorrowLimit } from 'hooks/marketxyz/useBorrowLimit';

interface QuickModalContentProps {
  borrow?: boolean;
  asset: USDPricedPoolAsset;
  borrowLimit: number;
  open: boolean;
  onClose: () => void;
}
export const QuickModalContent: React.FC<QuickModalContentProps> = ({
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

  const numValue = isNaN(Number(value)) ? 0 : Number(value);

  const [updatedAsset, setUpdatedAsset] = useState<
    USDPricedPoolAsset | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      if (borrow) {
        const updatedBorrowBalance =
          convertBNToNumber(asset.borrowBalance, asset.underlyingDecimals) +
          (modalType === 'repay' ? -1 : 1) * numValue;
        const updatedTotalBorrowNum =
          convertBNToNumber(asset.totalBorrow, asset.underlyingDecimals) +
          (modalType === 'repay' ? -1 : 1) * numValue;
        const web3 = asset.cToken.sdk.web3;
        const updateTotalBorrow = web3.utils.toBN(
          (
            updatedTotalBorrowNum *
            10 ** Number(asset.underlyingDecimals)
          ).toFixed(0),
        );
        const jmpModel = new JumpRateModel(asset.cToken.sdk, asset);
        await jmpModel.init();
        const updatedAsset = {
          ...asset,
          borrowBalance: web3.utils.toBN(
            (
              updatedBorrowBalance *
              10 ** Number(asset.underlyingDecimals)
            ).toFixed(0),
          ),
          borrowBalanceUSD: updatedBorrowBalance * asset.usdPrice,
          totalBorrow: updateTotalBorrow,
          totalSupplyUSD: updatedTotalBorrowNum * asset.usdPrice,
          supplyRatePerBlock: jmpModel.getSupplyRate(
            convertBNToNumber(asset.totalSupply, asset.underlyingDecimals)
              ? updateTotalBorrow.div(asset.totalSupply)
              : web3.utils.toBN(0),
          ),
        };
        setUpdatedAsset(updatedAsset);
      } else {
        const updatedSupplyBalance =
          convertBNToNumber(asset.supplyBalance, asset.underlyingDecimals) +
          (modalType === 'withdraw' ? -1 : 1) * numValue;
        const updatedTotalSupplyNum =
          convertBNToNumber(asset.totalSupply, asset.underlyingDecimals) +
          (modalType === 'withdraw' ? -1 : 1) * numValue;
        const web3 = asset.cToken.sdk.web3;
        const updateTotalSupply = web3.utils.toBN(
          (
            updatedTotalSupplyNum *
            10 ** Number(asset.underlyingDecimals)
          ).toFixed(0),
        );
        const jmpModel = new JumpRateModel(asset.cToken.sdk, asset);
        await jmpModel.init();
        const updatedAsset = {
          ...asset,
          supplyBalance: web3.utils.toBN(
            (
              updatedSupplyBalance *
              10 ** Number(asset.underlyingDecimals)
            ).toFixed(0),
          ),
          supplyBalanceUSD: updatedSupplyBalance * asset.usdPrice,
          totalSupply: updateTotalSupply,
          totalSupplyUSD: updatedTotalSupplyNum * asset.usdPrice,
          supplyRatePerBlock: jmpModel.getSupplyRate(
            updatedTotalSupplyNum
              ? asset.totalBorrow.div(updateTotalSupply)
              : web3.utils.toBN(0),
          ),
        };
        setUpdatedAsset(updatedAsset);
      }
    })();
  }, [asset, numValue, modalType, borrow]);

  const updatedBorrowLimit = useBorrowLimit(
    updatedAsset ? [updatedAsset] : [],
    enableAsCollateral
      ? {
          ignoreIsEnabledCheckFor: asset.cToken.address,
        }
      : undefined,
  );

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

  const showArrow = Number(value) > 0 && updatedAsset;

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
                  {!borrow ? t('supplied') : t('balance')}:{' '}
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
                          {`${convertBNToNumber(
                            updatedAsset.supplyBalance,
                            asset.underlyingDecimals,
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
                          {midUsdFormatter(updatedBorrowLimit)}
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
                      ${asset.borrowBalanceUSD.toLocaleString()}
                      {showArrow && (
                        <>
                          <ArrowForward fontSize='small' />
                          {'$' + updatedAsset.borrowBalanceUSD.toLocaleString()}
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
                      ${asset.borrowBalanceUSD.toLocaleString()}
                      {showArrow && (
                        <>
                          <ArrowForward fontSize='small' />
                          {'$' + updatedAsset.borrowBalanceUSD.toLocaleString()}
                        </>
                      )}
                    </p>
                  </Box>
                </>
              )}
            </Box>
            {!borrow && (
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
