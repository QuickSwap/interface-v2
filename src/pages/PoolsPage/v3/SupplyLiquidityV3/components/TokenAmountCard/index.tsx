import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core';

import CurrencyLogo from 'components/CurrencyLogo';
import { WrappedCurrency } from 'models/types';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import useUSDCPrice, { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import Loader from 'components/Loader';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { useBestV3TradeExactIn } from 'hooks/v3/useBestV3Trade';
import { useInitialTokenPrice, useInitialUSDPrices } from 'state/mint/v3/hooks';
import './index.scss';
import { GlobalValue } from 'constants/index';
import { toToken } from 'constants/v3/routing';
import { Box } from 'theme/components';
import { Lock } from 'react-feather';
import NumericalInput from 'components/NumericalInput';
import { ETHER } from '@uniswap/sdk';
import { useTranslation } from 'react-i18next';

interface ITokenAmountCard {
  currency: Currency | undefined | null;
  otherCurrency: Currency | undefined | null;
  value: string;
  fiatValue: CurrencyAmount<Token> | null;
  handleHalf?: () => void;
  handleMax: () => void;
  handleInput: (value: string) => void;
  locked: boolean;
  isMax: boolean;
  error: string | undefined;
  priceFormat: PriceFormats;
  isBase: boolean;
}

export function TokenAmountCard({
  currency,
  otherCurrency,
  value,
  fiatValue,
  handleHalf,
  handleMax,
  handleInput,
  locked,
  isMax,
  error,
  priceFormat,
  isBase,
}: ITokenAmountCard) {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();

  const balance = useCurrencyBalance(
    account ?? undefined,
    currency?.isNative ? ETHER : currency ?? undefined,
  );
  const balanceUSD = useUSDCPrice(currency ?? undefined);

  const [localUSDValue, setLocalUSDValue] = useState('');
  const [localTokenValue, setLocalTokenValue] = useState('');

  const valueUSD = useUSDCValue(
    tryParseAmount(
      value,
      currency ? (currency.isNative ? currency.wrapped : currency) : undefined,
    ),
    true,
  );
  const USDC_POLYGON = toToken(GlobalValue.tokens.COMMON.USDC);
  const tokenValue = useBestV3TradeExactIn(
    tryParseAmount('1', USDC_POLYGON),
    currency ?? undefined,
  );

  const currencyPrice = useUSDCPrice(currency ?? undefined);
  const otherCurrencyPrice = useUSDCPrice(otherCurrency ?? undefined);

  const initialUSDPrices = useInitialUSDPrices();
  const initialTokenPrice = useInitialTokenPrice();

  const isUSD = useMemo(() => {
    return priceFormat === PriceFormats.USD;
  }, [priceFormat]);

  useEffect(() => {
    if (currencyPrice) {
      setLocalUSDValue(String(+value * +currencyPrice.toSignificant(5)));
    } else if (isBase && initialUSDPrices.CURRENCY_B) {
      setLocalUSDValue(String(+value * +initialUSDPrices.CURRENCY_B));
    } else if (!isBase && initialUSDPrices.CURRENCY_A) {
      setLocalUSDValue(String(+value * +initialUSDPrices.CURRENCY_A));
    } else if (initialTokenPrice && otherCurrencyPrice) {
      setLocalUSDValue(
        String(
          +value * +initialTokenPrice * +otherCurrencyPrice.toSignificant(5),
        ),
      );
    }

    setLocalTokenValue(value ?? '');
  }, [
    isBase,
    initialTokenPrice,
    initialUSDPrices,
    currencyPrice,
    otherCurrencyPrice,
    value,
  ]);

  const balanceString = useMemo(() => {
    if (!balance || !currency) return t('loading');

    const _balance =
      isUSD && balanceUSD
        ? String(
            parseFloat(
              String(
                (
                  +balance.toSignificant(5) * +balanceUSD.toSignificant(5)
                ).toFixed(5),
              ),
            ),
          )
        : String(
            parseFloat(String(Number(balance.toSignificant(5)).toFixed(5))),
          );

    if (_balance.split('.')[0].length > 10) {
      return `${isUSD ? '$ ' : ''}${_balance.slice(0, 7)}...`;
    }

    if (+balance.toFixed() === 0) {
      return `${isUSD ? '$ ' : ''}0`;
    }
    if (+balance.toFixed() < 0.0001) {
      return `< ${isUSD ? '$ ' : ''}0.0001`;
    }

    return `${isUSD ? '$ ' : ''}${_balance}`;
  }, [balance, currency, isUSD, balanceUSD, t]);

  return (
    <>
      <Box className='v3-token-amount-card-wrapper'>
        {locked && (
          <div className='token-amount-card-locked'>
            <Lock />
            <p className='span'>
              {t('priceOutsidePriceRange')}.
              <br />
              {t('singleAssetDepositOnly')}.
            </p>
          </div>
        )}
        {currency ? (
          <Box className='flex flex-col items-start'>
            <div className='token-amount-card-logo'>
              <CurrencyLogo
                size='24px'
                currency={currency as WrappedCurrency}
              />
              <p className='weight-600'>{currency.symbol}</p>
            </div>
            <Box margin='8px 0 0' className='token-amount-card-balance'>
              {balanceString === 'loading' ? (
                <Box className='flex items-center'>
                  <small className='text-secondary'>{t('balance')}: </small>
                  <Box className='flex' margin='0 0 0 5px'>
                    <Loader stroke='white' />
                  </Box>
                </Box>
              ) : (
                <small className='text-secondary'>
                  {t('balance')}: {balanceString}
                </small>
              )}
              {handleHalf && (
                <button onClick={handleHalf}>
                  <small>50%</small>
                </button>
              )}
              <button
                onClick={handleMax}
                disabled={isMax || balance?.toSignificant(5) === '0'}
              >
                <small>{t('max')}</small>
              </button>
            </Box>
          </Box>
        ) : (
          <Box className='token-amount-select-token'>
            <p className='weight-600'>{t('selectToken')}</p>
          </Box>
        )}
        <NumericalInput
          value={value}
          id={`amount-${currency?.symbol}`}
          disabled={locked}
          onUserInput={(val) => {
            handleInput(val.trim());
          }}
          placeholder='0'
        />
      </Box>
      {error && (
        <div className='token-amount-card-error'>
          <small>{error}</small>
        </div>
      )}
    </>
  );
}
