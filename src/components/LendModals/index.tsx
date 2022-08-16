import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import { USDPricedPoolAsset } from 'utils/marketxyz/fetchPoolData';
import JumpRateModel from 'utils/marketxyz/interestRateModel';
import { midUsdFormatter } from 'utils/bigUtils';
import { MarketLensSecondary } from 'market-sdk';
import {
  repayBorrow,
  borrow as poolBorrow,
  withdraw as poolWithDraw,
  supply,
  convertMantissaToAPR,
  convertMantissaToAPY,
  getPoolAssetToken,
  checkCTokenisApproved,
  toggleCollateral,
  toggleCollateralWithoutComptroller,
  approveCToken,
} from 'utils/marketxyz';

import { getDaysCurrentYear, convertBNToNumber, formatNumber } from 'utils';
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
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { GlobalValue } from 'constants/index';
import { useEthPrice } from 'state/application/hooks';
import useUSDCPrice from 'utils/useUSDCPrice';

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
  const { account, chainId } = useActiveWeb3React();
  const { ethPrice } = useEthPrice();
  const assetUSDPriceObj = useUSDCPrice(getPoolAssetToken(asset, chainId));
  const assetUSDPrice = assetUSDPriceObj
    ? Number(assetUSDPriceObj.toFixed(asset.underlyingDecimals.toNumber()))
    : undefined;

  const [assetApproved, setAssetApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txError, setTxError] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [modalType, setModalType] = useState(borrow ? 'borrow' : 'supply');
  const [value, setValue] = useState('');
  const [inputValue, setInputValue] = useDebouncedChangeHandler(
    value,
    setValue,
    200,
  );

  const [enableAsCollateral, setEnableAsCollateral] = useState<boolean>(true);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [maxAmountError, setMaxAmountError] = useState(false);
  const [updatedAsset, setUpdatedAsset] = useState<
    USDPricedPoolAsset | undefined
  >(undefined);

  const buttonDisabled =
    !account ||
    Number(value) <= 0 ||
    maxAmount === undefined ||
    Number(value) > maxAmount ||
    !updatedAsset ||
    (modalType === 'borrow'
      ? !assetUSDPrice ||
        !ethPrice.price ||
        Number(value) * assetUSDPrice < 0.05 * ethPrice.price
      : false);
  const buttonText = useMemo(() => {
    if (!account) {
      return t('connectWallet');
    } else if (Number(value) <= 0) {
      return t('enterAmount');
    } else if (maxAmount === undefined) {
      if (maxAmountError) {
        return t('errorFetchingMaxAmount');
      } else {
        return t('fetchingMaxAmount');
      }
    } else if (Number(value) > maxAmount) {
      return t('exceedMaxAmount');
    } else if (
      modalType === 'borrow' &&
      (!assetUSDPrice ||
        !ethPrice.price ||
        Number(value) * assetUSDPrice < 0.05 * ethPrice.price)
    ) {
      return t('marketBorrowMinError');
    } else if (
      modalType === 'supply' &&
      asset.membership !== enableAsCollateral
    ) {
      if (!asset.membership) {
        return t('enterMarket');
      } else {
        return t('exitMarket');
      }
    } else if (
      (modalType === 'supply' || modalType === 'repay') &&
      !assetApproved
    ) {
      return t('approve');
    }
    return t('confirm');
  }, [
    account,
    value,
    maxAmount,
    modalType,
    assetUSDPrice,
    ethPrice.price,
    t,
    maxAmountError,
    asset,
    assetApproved,
    enableAsCollateral,
  ]);

  const numValue = isNaN(Number(value)) ? 0 : Number(value);

  useEffect(() => {
    setValue('');
  }, [modalType]);

  useEffect(() => {
    if (!account || !Number(value)) return;
    (async () => {
      const approved = await checkCTokenisApproved(
        asset,
        Number(value),
        account,
      );
      setAssetApproved(approved);
    })();
  }, [account, asset, value]);

  useEffect(() => {
    if (!account) return;
    (async () => {
      setMaxAmount(undefined);
      setMaxAmountError(false);
      const lens = new MarketLensSecondary(
        asset.cToken.sdk,
        GlobalValue.marketSDK.LENS,
      );
      const underlyingBalance = convertBNToNumber(
        asset.underlyingBalance,
        asset.underlyingDecimals,
      );
      if (modalType === 'supply') {
        setMaxAmount(underlyingBalance);
      } else if (modalType === 'repay') {
        const debt = convertBNToNumber(
          asset.borrowBalance,
          asset.underlyingDecimals,
        );
        setMaxAmount(Math.min(underlyingBalance, debt));
      } else if (modalType === 'withdraw') {
        try {
          const maxRedeem = await lens.getMaxRedeem(
            account,
            asset.cToken.address,
          );
          setMaxAmount(
            Number(maxRedeem) / 10 ** Number(asset.underlyingDecimals),
          );
        } catch (e) {
          setMaxAmountError(true);
        }
      } else {
        try {
          const maxBorrow = await lens.getMaxBorrow(
            account,
            asset.cToken.address,
          );
          setMaxAmount(
            Number(maxBorrow) / 10 ** Number(asset.underlyingDecimals),
          );
        } catch (e) {
          setMaxAmountError(true);
        }
      }
    })();
  }, [asset, modalType, account]);

  useEffect(() => {
    if (!numValue) {
      setUpdatedAsset(undefined);
      return;
    }
    (async () => {
      setUpdatedAsset(undefined);
      if (modalType === 'borrow' || modalType === 'repay') {
        const updatedBorrowBalance =
          convertBNToNumber(asset.borrowBalance, asset.underlyingDecimals) +
          (modalType === 'repay' ? -1 : 1) * numValue;
        const updatedTotalBorrowNum =
          convertBNToNumber(asset.totalBorrow, asset.underlyingDecimals) +
          (modalType === 'repay' ? -1 : 1) * numValue;
        const web3 = asset.cToken.sdk.web3;
        const updatedTotalBorrow = web3.utils.toBN(
          (
            updatedTotalBorrowNum *
            10 ** Number(asset.underlyingDecimals)
          ).toFixed(0),
        );
        const totalSupplyNum = convertBNToNumber(
          asset.totalSupply,
          asset.underlyingDecimals,
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
          totalBorrow: updatedTotalBorrow,
          totalBorrowUSD: updatedTotalBorrowNum * asset.usdPrice,
          borrowRatePerBlock: jmpModel.getBorrowRate(
            totalSupplyNum
              ? web3.utils.toBN(
                  ((updatedTotalBorrowNum / totalSupplyNum) * 1e18).toFixed(0),
                )
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
        const updatedTotalSupply = web3.utils.toBN(
          (
            updatedTotalSupplyNum *
            10 ** Number(asset.underlyingDecimals)
          ).toFixed(0),
        );
        const totalBorrowNum = convertBNToNumber(
          asset.totalBorrow,
          asset.underlyingDecimals,
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
          totalSupply: updatedTotalSupply,
          totalSupplyUSD: updatedTotalSupplyNum * asset.usdPrice,
          supplyRatePerBlock: jmpModel.getSupplyRate(
            updatedTotalSupplyNum
              ? web3.utils.toBN(
                  ((totalBorrowNum / updatedTotalSupplyNum) * 1e18).toFixed(0),
                )
              : web3.utils.toBN(0),
          ),
        };
        setUpdatedAsset(updatedAsset);
      }
    })();
  }, [asset, numValue, modalType]);

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

  const supplyAPY = convertMantissaToAPY(
    asset.supplyRatePerBlock,
    getDaysCurrentYear(),
  );
  const borrowAPY = convertMantissaToAPR(asset.borrowRatePerBlock);

  const updatedSupplyAPY = convertMantissaToAPY(
    updatedAsset?.supplyRatePerBlock ?? 0,
    getDaysCurrentYear(),
  );
  const updatedBorrowAPY = convertMantissaToAPR(
    updatedAsset?.borrowRatePerBlock ?? 0,
  );

  // If the difference is greater than a 0.1 percentage point change, alert the user
  const updatedAPYDiffIsLarge = !borrow
    ? Math.abs(updatedSupplyAPY - supplyAPY) > 0.1
    : Math.abs(updatedBorrowAPY - borrowAPY) > 0.1;

  const showArrow = Number(value) > 0 && updatedAsset;

  const lendModalRows = [
    {
      label: borrow ? t('borrowedBalance') : t('suppliedBalance'),
      html: borrow
        ? midUsdFormatter(asset.borrowBalanceUSD)
        : `${formatNumber(supplyBalance)} ${asset.underlyingSymbol}`,
      showArrow,
      htmlAfterArrow: updatedAsset
        ? borrow
          ? midUsdFormatter(updatedAsset.borrowBalanceUSD)
          : `${formatNumber(
              convertBNToNumber(
                updatedAsset.supplyBalance,
                asset.underlyingDecimals,
              ),
            )} ${asset.underlyingSymbol}`
        : '',
    },
    {
      label: borrow ? t('suppliedBalance') : t('supplyapy'),
      html: borrow
        ? `${formatNumber(supplyBalance)} ${asset.underlyingSymbol}`
        : formatNumber(supplyAPY) + '%',
      showArrow: borrow ? false : updatedAsset && updatedAPYDiffIsLarge,
      htmlAfterArrow:
        borrow || !updatedAsset
          ? undefined
          : formatNumber(updatedSupplyAPY) + '%',
    },
    borrow
      ? {
          label: t('borrowAPR'),
          html: formatNumber(borrowAPY) + '%',
          showArrow: updatedAsset && updatedAPYDiffIsLarge,
          htmlAfterArrow: `${formatNumber(updatedBorrowAPY)}%`,
        }
      : undefined,
    {
      label: t('borrowLimit'),
      html: midUsdFormatter(borrowLimit),
      showArrow: borrow ? false : showArrow,
      htmlAfterArrow: borrow ? undefined : midUsdFormatter(updatedBorrowLimit),
    },
    {
      label: t('totalDebtBalance'),
      html: midUsdFormatter(asset.borrowBalanceUSD),
      showArrow: borrow ? showArrow : false,
      htmlAfterArrow:
        borrow && updatedAsset
          ? midUsdFormatter(updatedAsset.borrowBalanceUSD)
          : '',
    },
  ];

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
                  {t('balance')}:{' '}
                  {formatNumber(
                    Number(asset.underlyingBalance.toString()) /
                      10 ** Number(asset.underlyingDecimals.toString()),
                  )}{' '}
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
                  value={inputValue}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onUserInput={setInputValue}
                />
                <p className='span text-secondary'>
                  ({midUsdFormatter(asset.usdPrice * Number(value))})
                </p>
              </Box>
              <Box
                className='lendMaxButton'
                onClick={() => {
                  setValue((maxAmount ?? 0).toString());
                }}
              >
                {t('max')}
              </Box>
            </Box>
            <Box my={3} className='lendModalContentWrapper'>
              {lendModalRows
                .filter((row) => !!row)
                .map((row, ind) => (
                  <Box key={ind} className='lendModalRow'>
                    <p>{row?.label}:</p>
                    <p>
                      {row?.html}
                      {row?.showArrow && (
                        <>
                          <ArrowForward fontSize='small' />
                          {row?.htmlAfterArrow}
                        </>
                      )}
                    </p>
                  </Box>
                ))}
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
                        if (!assetApproved) {
                          txResponse = await approveCToken(asset, account);
                        } else {
                          txResponse = await repayBorrow(
                            asset,
                            Number(value),
                            account,
                            t('cannotRepayMarket'),
                          );
                        }
                      } else {
                        txResponse = await poolBorrow(
                          asset,
                          Number(value),
                          account,
                          t('cannotBorrowMarket'),
                        );
                      }
                    } else {
                      if (modalType === 'withdraw') {
                        if (asset.membership !== enableAsCollateral) {
                          txResponse = await toggleCollateralWithoutComptroller(
                            asset,
                            account,
                            asset.membership
                              ? t('cannotExitMarket')
                              : t('cannotEnterMarket'),
                          );
                        } else {
                          txResponse = await poolWithDraw(
                            asset,
                            Number(value),
                            account,
                            t('cannotWithdrawMarket'),
                          );
                        }
                      } else {
                        if (asset.membership !== enableAsCollateral) {
                          txResponse = await toggleCollateralWithoutComptroller(
                            asset,
                            account,
                            asset.membership
                              ? t('cannotExitMarket')
                              : t('cannotEnterMarket'),
                          );
                        } else if (!assetApproved) {
                          txResponse = await approveCToken(asset, account);
                        } else {
                          txResponse = await supply(
                            asset,
                            Number(value),
                            account,
                            t('cannotDepositMarket'),
                          );
                        }
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
