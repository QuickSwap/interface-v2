import React, { useEffect } from 'react';
import { Pair } from '@uniswap/sdk';
import { Ether } from '@uniswap/sdk-core';
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { LockOutlined } from '@material-ui/icons';
import { useActiveWeb3React } from 'hooks';
import CurrencyLogo from 'components/CurrencyLogo';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import CurrencySearchModal from 'components/CurrencySearchModal';
import { Box, Typography } from '@material-ui/core';
import NumericalInput from 'components/NumericalInput';
import { useTranslation } from 'react-i18next';
import './index.scss';
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { useAppSelector } from 'state';
import { getCurrencyBalanceImmediately } from 'state/wallet/v3/hooks';
import { useMulticall2Contract } from 'hooks/useContract';
import { useBlockNumber } from 'state/application/hooks';

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax?: () => void;
  onHalf?: () => void;
  showMaxButton: boolean;
  showHalfButton?: boolean;
  label?: string;
  onCurrencySelect?: (currency: Currency) => void;
  currency?: Currency | null;
  hideBalance?: boolean;
  pair?: Pair | null;
  hideInput?: boolean;
  otherCurrency?: Currency | null;
  fiatValue?: CurrencyAmount<Token> | null;
  priceImpact?: Percent;
  id: string;
  showCommonBases?: boolean;
  showCurrencyAmount?: boolean;
  disableNonToken?: boolean;
  showBalance?: boolean;
  renderBalance?: (amount: CurrencyAmount<Currency>) => ReactNode;
  locked?: boolean;
  hideCurrency?: boolean;
  centered?: boolean;
  disabled: boolean;
  shallow: boolean;
  swap: boolean;
  page?: string;
  bgClass?: string;
  color?: string;
  showETH?: boolean;
}

export default function CurrencyInputPanel({
  value,
  label,
  onUserInput,
  onMax,
  onHalf,
  showMaxButton,
  showHalfButton,
  onCurrencySelect,
  currency,
  otherCurrency,
  id,
  showCommonBases,
  showCurrencyAmount,
  disableNonToken,
  fiatValue,
  priceImpact,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  locked = false,
  showBalance,
  hideCurrency = false,
  centered = false,
  disabled,
  shallow = false,
  swap = false,
  page,
  bgClass,
  color,
  showETH,
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { chainId, account } = useActiveWeb3React();
  const { t } = useTranslation();
  const nativeCurrency = chainId ? Ether.onChain(chainId) : undefined;
  const ethBalance = useCurrencyBalance(account ?? undefined, nativeCurrency);
  const balance = useCurrencyBalance(
    account ?? undefined,
    currency?.isNative ? nativeCurrency : currency ?? undefined,
  );
  const balanceUpdateSelector = useAppSelector((state) => state.userBalance);
  const [updatedEthBalance, setUpdatedEthBalance] = useState<
    CurrencyAmount<Currency> | undefined
  >(undefined);
  const [updatedBalance, setUpdatedBalance] = useState<
    CurrencyAmount<Currency> | undefined
  >(undefined);

  const multicallContract = useMulticall2Contract();
  const latestBlockNumber = useBlockNumber();
  useEffect(() => {
    if (updatedEthBalance == undefined) {
      setUpdatedEthBalance(ethBalance);
    } else {
      if (!multicallContract || !latestBlockNumber || !account) return;
      getCurrencyBalanceImmediately(
        multicallContract,
        chainId,
        latestBlockNumber,
        account,
        nativeCurrency,
      ).then((value) => {
        setUpdatedEthBalance(value);
        if (currency?.isNative) {
          setUpdatedBalance(value);
        }
      });
    }
    if (updatedBalance == undefined) {
      setUpdatedBalance(balance);
    } else {
      if (
        currency?.isNative ||
        !multicallContract ||
        !latestBlockNumber ||
        !account
      )
        return;
      getCurrencyBalanceImmediately(
        multicallContract,
        chainId,
        latestBlockNumber,
        account,
        currency ?? undefined,
      ).then((value) => {
        setUpdatedBalance(value);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanceUpdateSelector.flag]);
  const ethBalanceDependency = JSON.stringify(ethBalance);
  const balanceDependency = JSON.stringify(balance);
  useEffect(() => {
    setUpdatedEthBalance(ethBalance);
    setUpdatedBalance(balance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethBalanceDependency, balanceDependency]);

  const { price: currentPrice } = useUSDCPriceFromAddress(
    currency?.wrapped?.address ?? '',
  );

  const valueAsUsd = useMemo(() => {
    if (!currentPrice || !value) {
      return 0;
    }

    return currentPrice * Number(value);
  }, [currentPrice, value]);

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  return (
    <Box className='v3-currency-input-panel'>
      {locked && (
        <Box className='v3-currency-input-lock-wrapper'>
          <LockOutlined />
          <small>
            Price is outside specified price range. Single-asset deposit only.
          </small>
        </Box>
      )}

      <Box id={id} className={`swapBox ${bgClass} bg-secondary4`}>
        <Box className='flex justify-between' mb={2}>
          <p
            style={{
              color: '#fff',
              fontSize: '13px',
            }}
          >
            {label || `${t('youPay')}:`}
          </p>
          <Box className='flex'>
            <Box className='flex justify-end' sx={{ fontSize: '13px' }}>
              <small
                className={`${color ? `text-${color}` : 'text-secondary'}}`}
              >
                <span className='subtext-color'>{t('balance')}:</span>{' '}
                {(showETH && updatedEthBalance
                  ? Number(updatedEthBalance.toSignificant(5))
                  : 0) +
                  (updatedBalance
                    ? Number(updatedBalance.toSignificant(5))
                    : 0)}
              </small>
            </Box>
            <Box display='flex' ml={1}>
              {account && currency && showHalfButton && (
                <Box className='maxWrapper' onClick={onHalf}>
                  <small>50%</small>
                </Box>
              )}
              {account && currency && showMaxButton && (
                <Box className='maxWrapper' marginLeft='10px' onClick={onMax}>
                  <small>{t('max')}</small>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        <Box
          mb={2}
          sx={{ borderRadius: '10px', padding: '8px 16px' }}
          className='bg-input1'
        >
          <Box className='inputWrapper'>
            <NumericalInput
              value={value}
              align='left'
              color={color}
              placeholder='0.00'
              onUserInput={(val) => {
                if (val === '.') val = '0.';
                onUserInput(val);
              }}
            />
          </Box>
          <Box>
            <Box
              className={`currencyButton  ${'token-select-background-v3'}  ${
                currency ? 'currencySelected' : 'noCurrency'
              }`}
              onClick={() => {
                if (onCurrencySelect) {
                  setModalOpen(true);
                }
              }}
            >
              {currency ? (
                <Box className='flex w-100 justify-between items-center'>
                  <Box className='flex'>
                    {showETH ? (
                      <DoubleCurrencyLogo
                        size={25}
                        currency0={nativeCurrency}
                        currency1={currency}
                      />
                    ) : (
                      <CurrencyLogo
                        size={'25px'}
                        currency={currency}
                      ></CurrencyLogo>
                    )}
                    <p className='text-primaryText'>{`${
                      showETH ? nativeCurrency?.symbol + '+' : ''
                    }${currency?.symbol}`}</p>
                  </Box>
                </Box>
              ) : (
                <p className='text-primaryText'>{t('selectToken')}</p>
              )}
            </Box>
          </Box>
        </Box>

        {/* <Box className='flex justify-between'>
          <Box display='flex'>
            <small className='text-secondary'>
              {t('balance')}:{' '}
              {(showETH && updatedEthBalance
                ? Number(updatedEthBalance.toSignificant(5))
                : 0) +
                (updatedBalance ? Number(updatedBalance.toSignificant(5)) : 0)}
            </small>

            {account && currency && showHalfButton && (
              <Box className='maxWrapper' onClick={onHalf}>
                <small>50%</small>
              </Box>
            )}
            {account && currency && showMaxButton && (
              <Box className='maxWrapper' onClick={onMax}>
                <small>{t('max')}</small>
              </Box>
            )}
          </Box>

          <Box className='v3-currency-input-usd-value'>
            <small className='text-secondary'>
              ${valueAsUsd.toLocaleString('us')}
            </small>
          </Box>
        </Box> */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography className='subtext-color' style={{ fontSize: '13px' }}>
            {' '}
          </Typography>
          <Typography className='subtext-color' style={{ fontSize: '13px' }}>
            <small className={`${color ? `text-${color}` : 'text-secondary'}}`}>
              ${valueAsUsd.toLocaleString('us')}
            </small>
          </Typography>
        </Box>
      </Box>

      {onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
          // TODO: Consider adding support for V3 Functionality
          // showCurrencyAmount={showCurrencyAmount}
          // disableNonToken={disableNonToken}
        />
      )}
    </Box>
  );
}
