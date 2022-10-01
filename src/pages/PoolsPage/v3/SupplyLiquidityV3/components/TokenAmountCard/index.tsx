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
import { toToken } from 'constants/v3/routing';
import { Box } from '@material-ui/core';
import { LockOutlined } from '@material-ui/icons';
import NumericalInput from 'components/NumericalInput';
import { ChainId, ETHER } from '@uniswap/sdk';
import { USDC } from 'constants/v3/addresses';

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
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];

  const balance = useCurrencyBalance(
    account ?? undefined,
    currency?.isNative ? nativeCurrency : currency ?? undefined,
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
  const USDC_POLYGON = toToken(USDC[chainIdToUse]);
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

  const handleOnBlur = useCallback(() => {
    if (currency?.wrapped.address === USDC_POLYGON.address) {
      handleInput(localUSDValue);
      return;
    }

    if (isUSD && currencyPrice) {
      handleInput(String(+localUSDValue / +currencyPrice.toSignificant(5)));
      setLocalTokenValue(
        String(+localUSDValue / +currencyPrice.toSignificant(5)),
      );
    } else if (isUSD && isBase && initialTokenPrice && otherCurrencyPrice) {
      handleInput(
        String(
          +localUSDValue *
            +initialTokenPrice *
            +otherCurrencyPrice.toSignificant(5),
        ),
      );
      setLocalTokenValue(
        String(
          +localUSDValue *
            +initialTokenPrice *
            +otherCurrencyPrice.toSignificant(5),
        ),
      );
    } else if (
      isUSD &&
      initialUSDPrices.CURRENCY_A &&
      initialUSDPrices.CURRENCY_B
    ) {
      const initialUSDPrice = isBase
        ? initialUSDPrices.CURRENCY_B
        : initialUSDPrices.CURRENCY_A;
      handleInput(String(+localUSDValue / +initialUSDPrice));
      setLocalTokenValue(String(+localUSDValue / +initialUSDPrice));
    } else if (isUSD && initialTokenPrice && !isBase && otherCurrencyPrice) {
      handleInput(
        String(
          +localUSDValue *
            +initialTokenPrice *
            +otherCurrencyPrice.toSignificant(5),
        ),
      );
      setLocalTokenValue(
        String(
          +localUSDValue *
            +initialTokenPrice *
            +otherCurrencyPrice.toSignificant(5),
        ),
      );
    } else if (!isUSD) {
      if (currencyPrice) {
        setLocalUSDValue(
          String(+localTokenValue * +currencyPrice.toSignificant(5)),
        );
      } else if (isBase && initialUSDPrices.CURRENCY_B) {
        setLocalUSDValue(
          String(+localTokenValue * +initialUSDPrices.CURRENCY_B),
        );
      } else if (!isBase && initialUSDPrices.CURRENCY_A) {
        setLocalUSDValue(
          String(+localTokenValue * +initialUSDPrices.CURRENCY_A),
        );
      }
      handleInput(localTokenValue);
    }
  }, [
    localTokenValue,
    localUSDValue,
    tokenValue,
    valueUSD,
    currencyPrice,
    handleInput,
  ]);

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
    initialTokenPrice,
    initialUSDPrices,
    currencyPrice,
    otherCurrencyPrice,
    value,
  ]);

  const balanceString = useMemo(() => {
    if (!balance || !currency) return 'loading';

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
  }, [balance, isUSD, fiatValue, currency]);

  return (
    <>
      <Box className='v3-token-amount-card-wrapper'>
        {locked && (
          <div className='token-amount-card-locked'>
            <LockOutlined />
            <p className='span'>
              Price is outside specified price range.
              <br />
              Single-asset deposit only.
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
            <Box mt={1} className='token-amount-card-balance'>
              {balanceString === 'loading' ? (
                <Box className='flex items-center'>
                  <small className='text-secondary'>Balance: </small>
                  <Box className='flex' ml='5px'>
                    <Loader stroke='white' />
                  </Box>
                </Box>
              ) : (
                <small className='text-secondary'>
                  Balance: {balanceString}
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
                <small>MAX</small>
              </button>
            </Box>
          </Box>
        ) : (
          <Box className='token-amount-select-token'>
            <p className='weight-600'>Select a token</p>
          </Box>
        )}
        <NumericalInput
          value={isUSD ? '$' + localUSDValue : localTokenValue}
          id={`amount-${currency?.symbol}`}
          disabled={locked}
          onBlur={handleOnBlur}
          onUserInput={(val) =>
            isUSD
              ? setLocalUSDValue(val.trim())
              : setLocalTokenValue(val.trim())
          }
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
