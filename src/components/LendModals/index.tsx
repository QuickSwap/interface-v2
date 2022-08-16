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
  open: boolean;
  onClose: () => void;
}
export const QuickModalContent: React.FC<QuickModalContentProps> = ({
  borrow,
  asset,
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
  const [openTxModal, setOpenTxModal] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txError, setTxError] = useState<string | undefined>(undefined);
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
  const [currentAsset, setCurrentAsset] = useState<USDPricedPoolAsset>(asset);
  const [updatedAsset, setUpdatedAsset] = useState<
    USDPricedPoolAsset | undefined
  >(undefined);

  const buttonDisabled =
    !account ||
    loading ||
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
      currentAsset.membership !== enableAsCollateral
    ) {
      if (!currentAsset.membership) {
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
    currentAsset,
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
        currentAsset,
        Number(value),
        account,
      );
      setAssetApproved(approved);
    })();
  }, [account, currentAsset, value]);

  useEffect(() => {
    if (!account) return;
    (async () => {
      setMaxAmount(undefined);
      setMaxAmountError(false);
      const lens = new MarketLensSecondary(
        currentAsset.cToken.sdk,
        GlobalValue.marketSDK.LENS,
      );
      const underlyingBalance = convertBNToNumber(
        currentAsset.underlyingBalance,
        currentAsset.underlyingDecimals,
      );
      if (modalType === 'supply') {
        setMaxAmount(underlyingBalance);
      } else if (modalType === 'repay') {
        const debt = convertBNToNumber(
          currentAsset.borrowBalance,
          currentAsset.underlyingDecimals,
        );
        setMaxAmount(Math.min(underlyingBalance, debt));
      } else if (modalType === 'withdraw') {
        try {
          const maxRedeem = await lens.getMaxRedeem(
            account,
            currentAsset.cToken.address,
          );
          setMaxAmount(
            Number(maxRedeem) / 10 ** Number(currentAsset.underlyingDecimals),
          );
        } catch (e) {
          setMaxAmountError(true);
        }
      } else {
        try {
          const maxBorrow = await lens.getMaxBorrow(
            account,
            currentAsset.cToken.address,
          );
          setMaxAmount(
            Number(maxBorrow) / 10 ** Number(currentAsset.underlyingDecimals),
          );
        } catch (e) {
          setMaxAmountError(true);
        }
      }
    })();
  }, [currentAsset, modalType, account]);

  useEffect(() => {
    if (!numValue) {
      setUpdatedAsset(undefined);
      return;
    }
    (async () => {
      setUpdatedAsset(undefined);
      if (modalType === 'borrow' || modalType === 'repay') {
        const updatedBorrowBalance =
          convertBNToNumber(
            currentAsset.borrowBalance,
            currentAsset.underlyingDecimals,
          ) +
          (modalType === 'repay' ? -1 : 1) * numValue;
        const updatedTotalBorrowNum =
          convertBNToNumber(
            currentAsset.totalBorrow,
            currentAsset.underlyingDecimals,
          ) +
          (modalType === 'repay' ? -1 : 1) * numValue;
        const web3 = currentAsset.cToken.sdk.web3;
        const updatedTotalBorrow = web3.utils.toBN(
          (
            updatedTotalBorrowNum *
            10 ** Number(currentAsset.underlyingDecimals)
          ).toFixed(0),
        );
        const totalSupplyNum = convertBNToNumber(
          currentAsset.totalSupply,
          currentAsset.underlyingDecimals,
        );

        const jmpModel = new JumpRateModel(
          currentAsset.cToken.sdk,
          currentAsset,
        );
        await jmpModel.init();
        const updatedAsset = {
          ...currentAsset,
          borrowBalance: web3.utils.toBN(
            (
              updatedBorrowBalance *
              10 ** Number(currentAsset.underlyingDecimals)
            ).toFixed(0),
          ),
          borrowBalanceUSD: updatedBorrowBalance * currentAsset.usdPrice,
          totalBorrow: updatedTotalBorrow,
          totalBorrowUSD: updatedTotalBorrowNum * currentAsset.usdPrice,
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
        const updatedUnderlyingBalance =
          convertBNToNumber(
            currentAsset.underlyingBalance,
            currentAsset.underlyingDecimals,
          ) +
          (modalType === 'withdraw' ? 1 : -1) * numValue;
        const updatedSupplyBalance =
          convertBNToNumber(
            currentAsset.supplyBalance,
            currentAsset.underlyingDecimals,
          ) +
          (modalType === 'withdraw' ? -1 : 1) * numValue;
        const updatedTotalSupplyNum =
          convertBNToNumber(
            currentAsset.totalSupply,
            currentAsset.underlyingDecimals,
          ) +
          (modalType === 'withdraw' ? -1 : 1) * numValue;
        const web3 = currentAsset.cToken.sdk.web3;
        const updatedTotalSupply = web3.utils.toBN(
          (
            updatedTotalSupplyNum *
            10 ** Number(currentAsset.underlyingDecimals)
          ).toFixed(0),
        );
        const totalBorrowNum = convertBNToNumber(
          currentAsset.totalBorrow,
          currentAsset.underlyingDecimals,
        );
        const jmpModel = new JumpRateModel(
          currentAsset.cToken.sdk,
          currentAsset,
        );
        await jmpModel.init();
        const updatedAsset = {
          ...currentAsset,
          underlyingBalance: web3.utils.toBN(
            (
              updatedUnderlyingBalance *
              10 ** Number(currentAsset.underlyingDecimals)
            ).toFixed(0),
          ),
          supplyBalance: web3.utils.toBN(
            (
              updatedSupplyBalance *
              10 ** Number(currentAsset.underlyingDecimals)
            ).toFixed(0),
          ),
          supplyBalanceUSD: updatedSupplyBalance * currentAsset.usdPrice,
          totalSupply: updatedTotalSupply,
          totalSupplyUSD: updatedTotalSupplyNum * currentAsset.usdPrice,
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
  }, [currentAsset, numValue, modalType]);

  const borrowLimit = useBorrowLimit(
    [currentAsset],
    enableAsCollateral
      ? {
          ignoreIsEnabledCheckFor: currentAsset.cToken.address,
        }
      : undefined,
  );

  const updatedBorrowLimit = useBorrowLimit(
    updatedAsset ? [updatedAsset] : [],
    enableAsCollateral
      ? {
          ignoreIsEnabledCheckFor: currentAsset.cToken.address,
        }
      : undefined,
  );

  const supplyBalance = convertBNToNumber(
    currentAsset.supplyBalance,
    currentAsset.underlyingDecimals,
  );

  const supplyAPY = convertMantissaToAPY(
    currentAsset.supplyRatePerBlock,
    getDaysCurrentYear(),
  );
  const borrowAPY = convertMantissaToAPR(currentAsset.borrowRatePerBlock);

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
        ? midUsdFormatter(currentAsset.borrowBalanceUSD)
        : `${formatNumber(supplyBalance)} ${currentAsset.underlyingSymbol}`,
      showArrow,
      htmlAfterArrow: updatedAsset
        ? borrow
          ? midUsdFormatter(updatedAsset.borrowBalanceUSD)
          : `${formatNumber(
              convertBNToNumber(
                updatedAsset.supplyBalance,
                currentAsset.underlyingDecimals,
              ),
            )} ${currentAsset.underlyingSymbol}`
        : '',
    },
    {
      label: borrow ? t('suppliedBalance') : t('supplyapy'),
      html: borrow
        ? `${formatNumber(supplyBalance)} ${currentAsset.underlyingSymbol}`
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
      html: midUsdFormatter(currentAsset.borrowBalanceUSD),
      showArrow: borrow ? showArrow : false,
      htmlAfterArrow:
        borrow && updatedAsset
          ? midUsdFormatter(updatedAsset.borrowBalanceUSD)
          : '',
    },
  ];

  const updateCurrentAsset = () => {
    if (updatedAsset) {
      setCurrentAsset(updatedAsset);
      setValue('');
    }
  };

  return (
    <>
      {openTxModal && (
        <TransactionConfirmationModal
          isOpen={openTxModal}
          onDismiss={() => setOpenTxModal(false)}
          attemptingTxn={loading}
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
                  Number(currentAsset.underlyingBalance.toString()) /
                    10 ** Number(currentAsset.underlyingDecimals.toString()),
                )}{' '}
                {currentAsset.underlyingSymbol}
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
                ({midUsdFormatter(currentAsset.usdPrice * Number(value))})
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
                setTxHash(undefined);
                setTxError('');
                setOpenTxModal(true);
                let txResponse;
                try {
                  if (borrow) {
                    if (modalType === 'repay') {
                      if (!assetApproved) {
                        txResponse = await approveCToken(currentAsset, account);
                        setAssetApproved(true);
                      } else {
                        txResponse = await repayBorrow(
                          currentAsset,
                          Number(value),
                          account,
                          t('cannotRepayMarket'),
                        );
                      }
                    } else {
                      txResponse = await poolBorrow(
                        currentAsset,
                        Number(value),
                        account,
                        t('cannotBorrowMarket'),
                      );
                    }
                    updateCurrentAsset();
                  } else {
                    if (modalType === 'withdraw') {
                      if (currentAsset.membership !== enableAsCollateral) {
                        txResponse = await toggleCollateral(
                          currentAsset,
                          account,
                          currentAsset.membership
                            ? t('cannotExitMarket')
                            : t('cannotEnterMarket'),
                        );
                        setCurrentAsset({
                          ...currentAsset,
                          membership: !currentAsset.membership,
                        });
                      } else {
                        txResponse = await poolWithDraw(
                          currentAsset,
                          Number(value),
                          account,
                          t('cannotWithdrawMarket'),
                        );
                        updateCurrentAsset();
                      }
                    } else {
                      if (currentAsset.membership !== enableAsCollateral) {
                        txResponse = await toggleCollateral(
                          currentAsset,
                          account,
                          currentAsset.membership
                            ? t('cannotExitMarket')
                            : t('cannotEnterMarket'),
                        );
                        setCurrentAsset({
                          ...currentAsset,
                          membership: !currentAsset.membership,
                        });
                      } else if (!assetApproved) {
                        txResponse = await approveCToken(currentAsset, account);
                        setAssetApproved(true);
                      } else {
                        txResponse = await supply(
                          currentAsset,
                          Number(value),
                          account,
                          t('cannotDepositMarket'),
                        );
                        updateCurrentAsset();
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
    </>
  );
};
