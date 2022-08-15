import React from 'react';
import { Box, Button, IconButton } from '@material-ui/core';
import { Price, Token, Currency } from '@uniswap/sdk-core';
import {
  StyledBox,
  StyledLabel,
} from 'components/AddLiquidityV3/CommonStyledElements';
import useUSDCPrice, { useUSDCValue } from 'hooks/v3/useUSDCPrice';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from 'state/hooks';
import { Bound, updateSelectedPreset } from 'state/mint/v3/actions';
import {
  IDerivedMintInfo,
  useInitialTokenPrice,
  useInitialUSDPrices,
} from 'state/mint/v3/hooks';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { PriceFormats } from '../PriceFomatToggler';
import { ReactComponent as AddIcon } from 'assets/images/AddIconBtn.svg';
import { ReactComponent as RemoveIcon } from 'assets/images/RemoveIconBtn.svg';

import './index.scss';
import NumericalInput from 'components/NumericalInput';
import { toToken } from 'constants/v3/routing';
import { GlobalValue } from 'constants/index';
import { useBestV3TradeExactIn } from 'hooks/v3/useBestV3Trade';

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
  initial: boolean;
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
  initial,
  disabled,
  isBeforePrice,
  isAfterPrice,
  priceFormat,
  mintInfo,
}: IRangeSelector) {
  const tokenA = (currencyA ?? undefined)?.wrapped;
  const tokenB = (currencyB ?? undefined)?.wrapped;

  const { t } = useTranslation();

  const isUSD = useMemo(() => priceFormat === PriceFormats.USD, [priceFormat]);
  const currentPriceInUSD = useUSDCValue(
    tryParseAmount(
      mintInfo.price
        ? mintInfo.invertPrice
          ? Number(mintInfo.price.invert().toSignificant(5)).toFixed(5)
          : Number(mintInfo.price.toSignificant(5)).toFixed(5)
        : undefined,
      currencyB ?? undefined,
    ),
    true,
  );

  const currentPriceInUSDB = useUSDCValue(
    tryParseAmount(
      mintInfo.price
        ? mintInfo.invertPrice
          ? Number(mintInfo.price.invert().toSignificant(5)).toFixed(5)
          : Number(mintInfo.price.toSignificant(5)).toFixed(5)
        : undefined,
      currencyA ?? undefined,
    ),
    true,
  );

  const initialUSDPrices = useInitialUSDPrices();
  const initialTokenPrice = useInitialTokenPrice();

  const isSorted = useMemo(() => {
    return tokenA && tokenB && tokenA.sortsBefore(tokenB);
  }, [tokenA, tokenB]);

  const leftPrice = useMemo(() => {
    return isSorted ? priceLower : priceUpper?.invert();
  }, [isSorted, priceLower, priceUpper]);

  const rightPrice = useMemo(() => {
    return isSorted ? priceUpper : priceLower?.invert();
  }, [isSorted, priceUpper, priceLower]);

  const currentPrice = useMemo(() => {
    if (!mintInfo.price) return;

    const isInitialInUSD = Boolean(
      initialUSDPrices.CURRENCY_A && initialUSDPrices.CURRENCY_B,
    );

    let _price;

    if (!isUSD) {
      _price =
        isUSD && currentPriceInUSD
          ? parseFloat(currentPriceInUSD?.toSignificant(5))
          : mintInfo.invertPrice
          ? parseFloat(mintInfo.price.invert().toSignificant(5))
          : parseFloat(mintInfo.price.toSignificant(5));
    } else {
      if (isInitialInUSD) {
        _price = parseFloat(initialUSDPrices.CURRENCY_A);
      } else if (currentPriceInUSD) {
        _price = parseFloat(currentPriceInUSD.toSignificant(5));
      } else if (currentPriceInUSDB) {
        _price = parseFloat(currentPriceInUSDB.toSignificant(5));
      }
    }

    if (Number(_price) <= 0.0001) {
      return `< ${
        isUSD && (currentPriceInUSD || isInitialInUSD) ? '$ ' : ''
      }0.0001${
        isUSD && (currentPriceInUSD || isInitialInUSD)
          ? ''
          : ` ${currencyB?.symbol}`
      }`;
    } else {
      return `${
        isUSD && (currentPriceInUSD || isInitialInUSD) ? '$ ' : ''
      }${_price}${
        isUSD && (currentPriceInUSD || isInitialInUSD)
          ? ''
          : ` ${currencyB?.symbol}`
      }`;
    }
  }, [
    mintInfo.price,
    isUSD,
    initialUSDPrices,
    initialTokenPrice,
    currentPriceInUSD,
  ]);

  return (
    <Box>
      <Box className='flex justify-between items-center' mt={2.5} mb={2.5}>
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
          title={t`Min price`}
          priceFormat={priceFormat}
        />

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
          title={t`Max price`}
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
  const [localUSDValue, setLocalUSDValue] = useState('');
  const [localTokenValue, setLocalTokenValue] = useState('');

  const dispatch = useAppDispatch();

  const isUSD = useMemo(() => {
    return priceFormat === PriceFormats.USD;
  }, [priceFormat]);

  const valueUSD = useUSDCValue(
    tryParseAmount(
      value === '∞' || value === '0' ? undefined : Number(value).toFixed(5),
      tokenB,
    ),
    true,
  );

  const USDC_POLYGON = toToken(GlobalValue.tokens.COMMON.USDC);

  const tokenValue = useBestV3TradeExactIn(
    tryParseAmount('1', USDC_POLYGON),
    tokenB,
  );
  const usdPriceA = useUSDCPrice(tokenA ?? undefined);
  const usdPriceB = useUSDCPrice(tokenB ?? undefined);

  const initialUSDPrices = useInitialUSDPrices();
  const initialTokenPrice = useInitialTokenPrice();

  const handleOnBlur = useCallback(() => {
    if (isUSD && usdPriceB) {
      if (
        tokenB?.wrapped.address ===
        toToken(GlobalValue.tokens.COMMON.USDC).address
      ) {
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
      if (tokenB?.wrapped.address === USDC_POLYGON.address) {
        onUserInput(localUSDValue);
      } else {
        onUserInput(String(+localUSDValue / +initialUSDPrices.CURRENCY_B));
        setLocalTokenValue(
          String(+localUSDValue / +initialUSDPrices.CURRENCY_B),
        );
      }
    } else if (isUSD && initialTokenPrice && usdPriceA) {
      if (tokenB?.wrapped.address === USDC_POLYGON.address) {
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
    localTokenValue,
    localUSDValue,
    tokenValue,
    valueUSD,
    usdPriceB,
    onUserInput,
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
  }, [usdPriceB, initialTokenPrice, initialUSDPrices, value]);

  return (
    <StyledBox
      id={title}
      width={200}
      height={100}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
      }}
    >
      <StyledLabel fontSize='13px' color='#696c80'>
        {title}
      </StyledLabel>

      <Box className='flex justify-center items-center'>
        <IconButton
          size='small'
          className='cursor-pointer'
          onClick={handleIncrement}
          disabled={incrementDisabled || disabled}
        >
          <AddIcon />
        </IconButton>

        <NumericalInput
          id={title}
          value={isUSD ? localUSDValue : localTokenValue}
          align='center'
          placeholder='0.00'
          onUserInput={(val) => {
            isUSD
              ? setLocalUSDValue(val.trim())
              : setLocalTokenValue(val.trim());
            dispatch(updateSelectedPreset({ preset: null }));
          }}
        />

        <IconButton
          size='small'
          className='cursor-pointer'
          onClick={handleDecrement}
          disabled={decrementDisabled || disabled}
        >
          <RemoveIcon />
        </IconButton>
      </Box>

      <StyledLabel fontSize='13px' color='#696c80'>
        {''}
      </StyledLabel>
    </StyledBox>
  );
}
