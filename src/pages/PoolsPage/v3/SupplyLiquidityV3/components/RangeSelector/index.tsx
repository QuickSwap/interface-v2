import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Price, Token, Currency } from '@uniswap/sdk-core';
import Input from 'components/NumericalInput';
import { GlobalValue } from 'constants/index';
import { toToken } from 'constants/v3/routing';
import { useBestV3TradeExactIn } from 'hooks/v3/useBestV3Trade';
import useUSDCPrice, { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import { useAppDispatch } from 'state/hooks';
import { Bound, updateSelectedPreset } from 'state/mint/v3/actions';
import {
  IDerivedMintInfo,
  useInitialTokenPrice,
  useInitialUSDPrices,
} from 'state/mint/v3/hooks';
import { PriceFormats } from 'components/v3/PriceFomatToggler';
import { tryParseAmount } from 'state/swap/v3/hooks';
import './index.scss';
import { Box } from '@material-ui/core';
import { Add, Remove } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

interface IRangeSelector {
  priceLower: Price<Token, Token> | undefined;
  priceUpper: Price<Token, Token> | undefined;
  onLeftRangeInput: (typedValue: string) => void;
  onRightRangeInput: (typedValue: string) => void;
  getDecrementLower: () => string;
  getIncrementLower: () => string;
  getDecrementUpper: () => string;
  getIncrementUpper: () => string;
  currencyA: Currency | null | undefined;
  currencyB: Currency | null | undefined;
  disabled: boolean;
  isBeforePrice: boolean;
  isAfterPrice: boolean;
  priceFormat: PriceFormats;
  mintInfo: IDerivedMintInfo;
}

interface IRangePart {
  value: string;
  onUserInput: (value: string) => void;
  decrement: () => string;
  increment: () => string;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
  // feeAmount?: FeeAmount;
  label?: string;
  width?: string;
  locked?: boolean; // disable input
  // title: ReactNode;
  tokenA: Currency | undefined;
  tokenB: Currency | undefined;
  initialPrice: Price<Token, Token> | undefined;
  disabled: boolean;
  // style?: CSSProperties;
  title: string;
  priceFormat: PriceFormats;
}

export function RangeSelector({
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  getDecrementLower,
  getIncrementLower,
  getDecrementUpper,
  getIncrementUpper,
  currencyA,
  currencyB,
  disabled,
  isBeforePrice,
  isAfterPrice,
  priceFormat,
  mintInfo,
}: IRangeSelector) {
  const { t } = useTranslation();
  const tokenA = (currencyA ?? undefined)?.wrapped;
  const tokenB = (currencyB ?? undefined)?.wrapped;

  const isUSD = useMemo(() => priceFormat === PriceFormats.USD, [priceFormat]);

  const isSorted = useMemo(() => {
    return tokenA && tokenB && tokenA.sortsBefore(tokenB);
  }, [tokenA, tokenB]);

  const leftPrice = useMemo(() => {
    return isSorted ? priceLower : priceUpper?.invert();
  }, [isSorted, priceLower, priceUpper]);

  const rightPrice = useMemo(() => {
    return isSorted ? priceUpper : priceLower?.invert();
  }, [isSorted, priceUpper, priceLower]);

  return (
    <Box className='flex justify-between'>
      <Box width='calc(50% - 8px)'>
        <RangePart
          value={
            mintInfo.ticksAtLimit[Bound.LOWER]
              ? '0'
              : leftPrice?.toSignificant(5) ?? ''
          }
          onUserInput={onLeftRangeInput}
          width='100%'
          decrement={isSorted ? getDecrementLower : getIncrementUpper}
          increment={isSorted ? getIncrementLower : getDecrementUpper}
          decrementDisabled={mintInfo.ticksAtLimit[Bound.LOWER]}
          incrementDisabled={mintInfo.ticksAtLimit[Bound.LOWER]}
          label={leftPrice ? `${currencyB?.symbol}` : '-'}
          tokenA={currencyA ?? undefined}
          tokenB={currencyB ?? undefined}
          initialPrice={mintInfo.price}
          disabled={disabled}
          title={t('minPrice')}
          priceFormat={priceFormat}
        />
      </Box>
      <Box width='calc(50% - 8px)'>
        <RangePart
          value={
            mintInfo.ticksAtLimit[Bound.UPPER]
              ? '∞'
              : rightPrice?.toSignificant(5) ?? ''
          }
          onUserInput={onRightRangeInput}
          decrement={isSorted ? getDecrementUpper : getIncrementLower}
          increment={isSorted ? getIncrementUpper : getDecrementLower}
          incrementDisabled={mintInfo.ticksAtLimit[Bound.UPPER]}
          decrementDisabled={mintInfo.ticksAtLimit[Bound.UPPER]}
          label={rightPrice ? `${currencyB?.symbol}` : '-'}
          tokenA={currencyA ?? undefined}
          tokenB={currencyB ?? undefined}
          initialPrice={mintInfo.price}
          disabled={disabled}
          title={t('maxPrice')}
          priceFormat={priceFormat}
        />
      </Box>
    </Box>
  );
}

function RangePart({
  value,
  decrement,
  increment,
  decrementDisabled = false,
  tokenA,
  tokenB,
  incrementDisabled = false,
  width,
  locked,
  onUserInput,
  initialPrice,
  disabled,
  title,
  priceFormat,
}: IRangePart) {
  const { t } = useTranslation();
  const [localUSDValue, setLocalUSDValue] = useState('');
  const [localTokenValue, setLocalTokenValue] = useState('');

  const dispatch = useAppDispatch();

  const isUSD = useMemo(() => {
    return priceFormat === PriceFormats.USD;
  }, [priceFormat]);

  const USDC = toToken(GlobalValue.tokens.COMMON.USDC);
  const valueUSD = useUSDCValue(
    tryParseAmount(
      value === '∞' || value === '0' ? undefined : Number(value).toFixed(5),
      tokenB,
    ),
    true,
  );
  const tokenValue = useBestV3TradeExactIn(tryParseAmount('1', USDC), tokenB);
  const usdPriceA = useUSDCPrice(tokenA ?? undefined);
  const usdPriceB = useUSDCPrice(tokenB ?? undefined);

  const initialUSDPrices = useInitialUSDPrices();
  const initialTokenPrice = useInitialTokenPrice();

  const handleOnBlur = useCallback(() => {
    if (isUSD && usdPriceB) {
      if (tokenB?.wrapped.address === USDC.address) {
        onUserInput(localUSDValue);
      } else {
        if (tokenValue && tokenValue.trade) {
          onUserInput(
            String(
              +localUSDValue * +tokenValue.trade?.outputAmount.toSignificant(5),
            ),
          );
          setLocalTokenValue(
            String(+localUSDValue * +usdPriceB.toSignificant(5)),
          );
        } else {
          onUserInput(localUSDValue);
          setLocalTokenValue(localUSDValue);
        }
      }
    } else if (isUSD && initialUSDPrices.CURRENCY_B) {
      if (tokenB?.wrapped.address === USDC.address) {
        onUserInput(localUSDValue);
      } else {
        onUserInput(String(+localUSDValue / +initialUSDPrices.CURRENCY_B));
        setLocalTokenValue(
          String(+localUSDValue / +initialUSDPrices.CURRENCY_B),
        );
      }
    } else if (isUSD && initialTokenPrice && usdPriceA) {
      if (tokenB?.wrapped.address === USDC.address) {
        onUserInput(localUSDValue);
      } else {
        onUserInput(
          String(
            +localUSDValue * +initialTokenPrice * +usdPriceA.toSignificant(5),
          ),
        );
        setLocalTokenValue(
          String(
            +localUSDValue * +initialTokenPrice * +usdPriceA.toSignificant(5),
          ),
        );
      }
    } else if (!isUSD) {
      if (usdPriceB) {
        setLocalUSDValue(
          String(+localTokenValue * +usdPriceB.toSignificant(5)),
        );
      } else if (initialUSDPrices.CURRENCY_B) {
        setLocalUSDValue(
          String(+localTokenValue * +initialUSDPrices.CURRENCY_B),
        );
      }
      onUserInput(localTokenValue);
    }
  }, [
    isUSD,
    usdPriceB,
    initialUSDPrices.CURRENCY_B,
    initialTokenPrice,
    usdPriceA,
    tokenB?.wrapped.address,
    USDC.address,
    onUserInput,
    localUSDValue,
    tokenValue,
    localTokenValue,
  ]);

  // for button clicks
  const handleDecrement = useCallback(() => {
    onUserInput(decrement());
  }, [decrement, onUserInput]);

  const handleIncrement = useCallback(() => {
    onUserInput(increment());
  }, [increment, onUserInput]);

  useEffect(() => {
    if (value) {
      setLocalTokenValue(value);
      if (value === '∞') {
        setLocalUSDValue(value);
        return;
      }
      if (usdPriceB) {
        setLocalUSDValue(String(+value * +usdPriceB.toSignificant(5)));
      } else if (initialUSDPrices.CURRENCY_B) {
        setLocalUSDValue(String(+value * +initialUSDPrices.CURRENCY_B));
      } else if (initialTokenPrice && usdPriceA) {
        setLocalUSDValue(
          String(+value * +initialTokenPrice * +usdPriceA.toSignificant(5)),
        );
      }
    } else if (value === '') {
      setLocalTokenValue('');
      setLocalUSDValue('');
    }
  }, [usdPriceB, initialTokenPrice, initialUSDPrices, value, usdPriceA]);

  return (
    <Box className='price-range-part text-center'>
      <p className='caption text-secondary'>{title}</p>
      <Box className='price-range-main'>
        <button
          onClick={handleDecrement}
          disabled={decrementDisabled || disabled}
        >
          <Remove />
        </button>
        <div className='price-range-input'>
          <Input
            value={
              isUSD ? (valueUSD ? '$' : '') + localUSDValue : localTokenValue
            }
            id={title}
            onBlur={handleOnBlur}
            className={`range-input ${isUSD && valueUSD ? 'is-usd' : ''}`}
            disabled={disabled || locked}
            onUserInput={(val) => {
              isUSD
                ? setLocalUSDValue(val.trim())
                : setLocalTokenValue(val.trim());
              dispatch(updateSelectedPreset({ preset: null }));
            }}
            placeholder='0.00'
          />
        </div>
        <button
          onClick={handleIncrement}
          disabled={incrementDisabled || disabled}
        >
          <Add />
        </button>
      </Box>
      {tokenA && tokenB && (
        <Box mt={1}>
          <p className='text-secondary caption'>
            {tokenB?.symbol} {t('per')} {tokenA?.symbol}
          </p>
        </Box>
      )}
    </Box>
  );
}
