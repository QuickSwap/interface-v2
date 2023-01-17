import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button } from 'theme/components';
import { ArrowRight } from 'react-feather';
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

import {
  getDaysCurrentYear,
  convertBNToNumber,
  formatNumber,
  convertNumbertoBN,
  getBulkPairData,
} from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  ToggleSwitch,
  CustomModal,
  ButtonSwitch,
  TransactionConfirmationModal,
  TransactionErrorContent,
  NumericalInput,
  CurrencyLogo,
} from 'components';
import { useTranslation } from 'react-i18next';
import 'components/styles/LendModal.scss';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useBorrowLimit } from 'hooks/marketxyz/useBorrowLimit';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { GlobalValue } from 'constants/index';
import { useEthPrice } from 'state/application/hooks';
import useUSDCPrice from 'utils/useUSDCPrice';
import { Link } from 'react-router-dom';
import { useMarket } from 'hooks/marketxyz/useMarket';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

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
  const { sdk } = useMarket();
  const { account, chainId } = useActiveWeb3React();
  const { ethPrice } = useEthPrice();
  const assetUSDPriceObj = useUSDCPrice(getPoolAssetToken(asset, chainId));
  const assetDecimals = asset.underlyingDecimals.toNumber();
  const assetUSDPrice = assetUSDPriceObj
    ? parseUnits(assetUSDPriceObj.toFixed(assetDecimals), assetDecimals)
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
  const [maxAmount, setMaxAmount] = useState<BigNumber | undefined>(undefined);
  const [maxAmountError, setMaxAmountError] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<USDPricedPoolAsset>(asset);
  const [updatedAsset, setUpdatedAsset] = useState<
    USDPricedPoolAsset | undefined
  >(undefined);

  const valueBN = useMemo(() => {
    const digitStr = value.substring(value.indexOf('.'));
    const decimalStr = value.substring(0, value.indexOf('.'));
    let valueStr = '0';
    if (!value.length) {
      valueStr = '0';
    } else if (value.indexOf('.') === -1) {
      valueStr = value;
    } else if (digitStr.length === 1) {
      valueStr = decimalStr;
    } else if (digitStr.length > assetDecimals + 1) {
      valueStr = decimalStr + digitStr.slice(0, assetDecimals + 1);
    } else {
      valueStr = decimalStr + digitStr;
    }
    return parseUnits(valueStr, assetDecimals);
  }, [value, assetDecimals]);

  const minBorrowAmountBN = useMemo(() => {
    if (!ethPrice.price) return;
    const amountStr = (ethPrice.price * 0.05).toString();
    const digitStr = amountStr.substring(amountStr.indexOf('.'));
    const decimalStr = amountStr.substring(0, amountStr.indexOf('.'));
    let amountStrDigits = '0';
    if (!amountStr.length) {
      amountStrDigits = '0';
    } else if (amountStr.indexOf('.') === -1) {
      amountStrDigits = amountStr;
    } else if (digitStr.length === 1) {
      amountStrDigits = decimalStr;
    } else if (digitStr.length > assetDecimals + 1) {
      amountStrDigits = decimalStr + digitStr.slice(0, assetDecimals + 1);
    } else {
      amountStrDigits = decimalStr + digitStr;
    }
    return parseUnits(amountStrDigits, assetDecimals);
  }, [ethPrice.price, assetDecimals]);

  const buttonDisabled =
    !account ||
    loading ||
    !sdk ||
    Number(value) <= 0 ||
    !maxAmount ||
    valueBN.gt(maxAmount) ||
    !updatedAsset ||
    (modalType === 'borrow'
      ? !assetUSDPrice ||
        !minBorrowAmountBN ||
        valueBN.mul(assetUSDPrice).lt(minBorrowAmountBN)
      : false);
  const buttonText = useMemo(() => {
    if (!account) {
      return t('connectWallet');
    } else if (valueBN.lte(BigNumber.from('0'))) {
      return t('enterAmount');
    } else if (!maxAmount) {
      if (maxAmountError) {
        return t('errorFetchingMaxAmount');
      } else {
        return t('fetchingMaxAmount');
      }
    } else if (valueBN.gt(maxAmount)) {
      return t('exceedMaxAmount');
    } else if (
      modalType === 'borrow' &&
      (!assetUSDPrice ||
        !minBorrowAmountBN ||
        valueBN.mul(assetUSDPrice).lt(minBorrowAmountBN))
    ) {
      return t('marketBorrowMinError');
    } else if (
      (modalType === 'supply' || modalType === 'withdraw') &&
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
    valueBN,
    maxAmount,
    modalType,
    assetUSDPrice,
    minBorrowAmountBN,
    currentAsset.membership,
    enableAsCollateral,
    assetApproved,
    t,
    maxAmountError,
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
      const assetBalanceBN = parseUnits(
        currentAsset.underlyingBalance.toString(),
        0,
      );
      const borrowBalanceBN = parseUnits(
        currentAsset.borrowBalance.toString(),
        0,
      );
      if (modalType === 'supply') {
        setMaxAmount(assetBalanceBN);
      } else if (modalType === 'repay') {
        setMaxAmount(
          assetBalanceBN.gt(borrowBalanceBN) ? borrowBalanceBN : assetBalanceBN,
        );
      } else if (modalType === 'withdraw') {
        try {
          const maxRedeem = await lens.getMaxRedeem(
            account,
            currentAsset.cToken.address,
          );
          setMaxAmount(parseUnits(maxRedeem, 0));
        } catch (e) {
          setMaxAmountError(true);
        }
      } else {
        try {
          const maxBorrow = await lens.getMaxBorrow(
            account,
            currentAsset.cToken.address,
          );
          setMaxAmount(parseUnits(maxBorrow, 0));
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
        const updatedTotalBorrow = convertNumbertoBN(
          updatedTotalBorrowNum,
          Number(currentAsset.underlyingDecimals),
          web3,
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
          borrowBalance: convertNumbertoBN(
            updatedBorrowBalance,
            Number(currentAsset.underlyingDecimals),
            web3,
          ),
          borrowBalanceUSD: updatedBorrowBalance * currentAsset.usdPrice,
          totalBorrow: updatedTotalBorrow,
          totalBorrowUSD: updatedTotalBorrowNum * currentAsset.usdPrice,
          borrowRatePerBlock: jmpModel.getBorrowRate(
            totalSupplyNum
              ? convertNumbertoBN(
                  updatedTotalBorrowNum / totalSupplyNum,
                  18,
                  web3,
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
        const updatedTotalSupply = convertNumbertoBN(
          updatedTotalSupplyNum,
          Number(currentAsset.underlyingDecimals),
          web3,
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
          underlyingBalance: convertNumbertoBN(
            updatedUnderlyingBalance,
            Number(currentAsset.underlyingDecimals),
            web3,
          ),
          supplyBalance: convertNumbertoBN(
            updatedSupplyBalance,
            Number(currentAsset.underlyingDecimals),
            web3,
          ),
          supplyBalanceUSD: updatedSupplyBalance * currentAsset.usdPrice,
          totalSupply: updatedTotalSupply,
          totalSupplyUSD: updatedTotalSupplyNum * currentAsset.usdPrice,
          supplyRatePerBlock: jmpModel.getSupplyRate(
            updatedTotalSupplyNum
              ? convertNumbertoBN(
                  totalBorrowNum / updatedTotalSupplyNum,
                  18,
                  web3,
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
  const assetSymbol = currentAsset.underlyingName.includes('LP')
    ? 'LP'
    : currentAsset.underlyingSymbol;

  const lendModalRows = [
    {
      label: borrow ? t('borrowedBalance') : t('suppliedBalance'),
      html: borrow
        ? midUsdFormatter(currentAsset.borrowBalanceUSD)
        : `${formatNumber(supplyBalance)} ${assetSymbol}`,
      showArrow,
      htmlAfterArrow: updatedAsset
        ? borrow
          ? midUsdFormatter(updatedAsset.borrowBalanceUSD)
          : `${formatNumber(
              convertBNToNumber(
                updatedAsset.supplyBalance,
                currentAsset.underlyingDecimals,
              ),
            )} ${assetSymbol}`
        : '',
    },
    {
      label: borrow ? t('suppliedBalance') : t('supplyapy'),
      html: borrow
        ? `${formatNumber(supplyBalance)} ${assetSymbol}`
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

  const pairAddress = asset.underlyingName.includes('LP')
    ? asset.underlyingToken
    : undefined;
  const [pairData, setPairData] = useState<any>(null);

  useEffect(() => {
    if (!pairAddress || !ethPrice.price) return;
    (async () => {
      const pairInfo = await getBulkPairData([pairAddress], ethPrice.price);
      if (pairInfo && pairInfo.length > 0) {
        setPairData(pairInfo[0]);
      }
    })();
  }, [pairAddress, ethPrice.price]);

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
          <Box
            margin='8px 0 20px'
            className='flex items-center justify-between'
          >
            <Box className='flex items-center'>
              <CurrencyLogo
                currency={getPoolAssetToken(asset, chainId)}
                withoutBg={
                  asset.underlyingName.includes('LP') ||
                  asset.underlyingSymbol.includes('am') ||
                  asset.underlyingSymbol.includes('moo')
                }
                size='36px'
              />
              <Box className='flex' margin='0 0 0 6px'>
                <p className='weight-600'>
                  {asset.underlyingSymbol +
                    (asset.underlyingName.includes('LP') ? ' LP' : '')}
                </p>
              </Box>
            </Box>
            <CloseIcon className='cursor-pointer' onClick={onClose} />
          </Box>
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
          <Box margin='24px 0 0' className='flex justify-between items-center'>
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
                {assetSymbol}
              </p>
            )}
          </Box>
          <Box
            margin='16px 0 0'
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
                setValue(
                  maxAmount ? formatUnits(maxAmount, assetDecimals) : '0',
                );
              }}
            >
              {t('max')}
            </Box>
          </Box>
          <Box margin='24px 0' className='lendModalContentWrapper'>
            {lendModalRows
              .filter((row) => !!row)
              .map((row, ind) => (
                <Box key={ind} className='lendModalRow'>
                  <p>{row?.label}:</p>
                  <p>
                    {row?.html}
                    {row?.showArrow && (
                      <>
                        <ArrowRight size='12px' />
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
          <Box margin='24px 0 0'>
            <Button
              width='100%'
              disabled={buttonDisabled}
              onClick={async () => {
                if (!account || !sdk) return;
                setLoading(true);
                setTxHash(undefined);
                setTxError('');
                setOpenTxModal(true);
                let txResponse;
                try {
                  if (borrow) {
                    if (modalType === 'repay') {
                      if (!assetApproved) {
                        txResponse = await approveCToken(
                          currentAsset,
                          account,
                          sdk,
                        );
                        setAssetApproved(true);
                      } else {
                        txResponse = await repayBorrow(
                          currentAsset,
                          valueBN,
                          account,
                          t('cannotRepayMarket'),
                          sdk,
                        );
                      }
                    } else {
                      txResponse = await poolBorrow(
                        currentAsset,
                        valueBN,
                        account,
                        t('cannotBorrowMarket'),
                        sdk,
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
                          sdk,
                        );
                        setCurrentAsset({
                          ...currentAsset,
                          membership: !currentAsset.membership,
                        });
                      } else {
                        txResponse = await poolWithDraw(
                          currentAsset,
                          valueBN,
                          account,
                          t('cannotWithdrawMarket'),
                          sdk,
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
                          sdk,
                        );
                        setCurrentAsset({
                          ...currentAsset,
                          membership: !currentAsset.membership,
                        });
                      } else if (!assetApproved) {
                        txResponse = await approveCToken(
                          currentAsset,
                          account,
                          sdk,
                        );
                        setAssetApproved(true);
                      } else {
                        txResponse = await supply(
                          currentAsset,
                          valueBN,
                          account,
                          t('cannotDepositMarket'),
                          sdk,
                        );
                        updateCurrentAsset();
                      }
                    }
                  }
                  setTxHash(txResponse.transactionHash);
                  setLoading(false);
                } catch (e) {
                  setTxError(t('errorInTx'));
                  setLoading(false);
                }
              }}
            >
              {buttonText}
            </Button>
            {asset.underlyingName.includes('LP') && pairData && (
              <Box margin='16px 0 0' textAlign='center'>
                <Link
                  className='assetLPLink'
                  to={`/pools?currency0=${pairData.token0.id}&currency1=${pairData.token1.id}`}
                >
                  Get {asset.underlyingSymbol} LP ↗
                </Link>
              </Box>
            )}
          </Box>
        </Box>
      </CustomModal>
    </>
  );
};
