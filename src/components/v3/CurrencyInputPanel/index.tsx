import React from 'react';
import { Pair } from '@uniswap/v2-sdk';
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { Lock } from 'react-feather';
import { useActiveWeb3React } from 'hooks';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import { WrappedCurrency } from 'models/types/Currency';
import CurrencyLogo from 'components/CurrencyLogo';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import CurrencySearchModal from 'components/CurrencySearchModal';
import { Box } from 'theme/components';
import NumericalInput from 'components/NumericalInput';
import { useTranslation } from 'react-i18next';
import JSBI from 'jsbi';
import './index.scss';
import { parseUnits } from 'ethers/lib/utils';

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax?: () => void;
  onHalf?: () => void;
  showMaxButton: boolean;
  showHalfButton?: boolean;
  label?: ReactNode;
  onCurrencySelect?: (currency: Currency) => void;
  currency?: WrappedCurrency | null;
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
}

export default function CurrencyInputPanel({
  value,
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
  ...rest
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { account } = useActiveWeb3React();
  const { t } = useTranslation();

  const balance = useCurrencyBalance(
    account ?? undefined,
    currency ?? undefined,
  );

  const currentPrice = useUSDCPrice(currency ?? undefined);

  const valueBN = useMemo(() => {
    if (!currency) return;
    const digitStr = value.substring(value.indexOf('.'));
    const decimalStr = value.substring(0, value.indexOf('.'));
    let valueStr = '0';
    if (!value.length) {
      valueStr = '0';
    } else if (value.indexOf('.') === -1) {
      valueStr = value;
    } else if (digitStr.length === 1) {
      valueStr = decimalStr;
    } else if (digitStr.length > currency.decimals + 1) {
      valueStr = decimalStr + digitStr.slice(0, currency.decimals + 1);
    } else {
      valueStr = decimalStr + digitStr;
    }
    return parseUnits(valueStr, currency.decimals);
  }, [value, currency]);

  const valueAsUsd = useMemo(() => {
    if (!currentPrice || !valueBN || !currency) {
      return undefined;
    }

    return currentPrice.quote(
      CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(valueBN)),
    );
  }, [currentPrice, currency, valueBN]);

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  const balanceAsUsdc = useMemo(() => {
    if (!balance) return 'Loading...';

    const _balance = balance.toFixed();

    if (_balance.split('.')[0].length > 10) {
      return _balance.slice(0, 7) + '...';
    }

    if (+balance.toFixed() === 0) {
      return '0';
    }
    if (+balance.toFixed() < 0.0001) {
      return '< 0.0001';
    }

    return +balance.toFixed(3);
  }, [balance]);

  return (
    <Box className='v3-currency-input-panel'>
      {locked && (
        <Box className='v3-currency-input-lock-wrapper'>
          <Lock />
          <small>
            Price is outside specified price range. Single-asset deposit only.
          </small>
        </Box>
      )}

      <Box id={id} className='bg-secondary2 swapBox'>
        <Box margin='0 0 16px'>
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
                    <CurrencyLogo
                      size={'25px'}
                      currency={currency as WrappedCurrency}
                    ></CurrencyLogo>
                    <p>{currency?.symbol}</p>
                  </Box>
                </Box>
              ) : (
                <p>{t('selectToken')}</p>
              )}
            </Box>
          </Box>

          <Box className='inputWrapper'>
            <NumericalInput
              value={value}
              align='right'
              placeholder='0.00'
              onUserInput={(val) => {
                if (val === '.') val = '0.';
                onUserInput(val);
              }}
            />
          </Box>
        </Box>
        <Box className='flex justify-between'>
          <Box className='flex'>
            <small className='text-secondary'>
              {t('balance')}: {balance?.toSignificant(5)}
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

          <small className='text-secondary'>${valueAsUsd?.toFixed(2)}</small>
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
