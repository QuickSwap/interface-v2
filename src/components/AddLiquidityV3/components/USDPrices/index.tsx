import { DollarSign, StopCircle } from 'react-feather';

import { Currency, Token, Price } from '@uniswap/sdk-core';

import { PriceFormats } from '../PriceFomatToggler';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInitialTokenPrice, useInitialUSDPrices } from 'state/mint/v3/hooks';
import { Box, Button } from '@material-ui/core';
import { StyledLabel } from '../../CommonStyledElements';

interface ISelectRangeUSDC {
  currencyA: Currency;
  currencyB: Currency;
  currencyAUSDC: Price<Currency, Token> | undefined;
  currencyBUSDC: Price<Currency, Token> | undefined;
  priceFormat: PriceFormats;
}

export function USDPrices({
  currencyA,
  currencyB,
  currencyAUSDC,
  currencyBUSDC,
  priceFormat,
}: ISelectRangeUSDC) {
  const isUSD = useMemo(() => {
    return priceFormat === PriceFormats.USD;
  }, [priceFormat]);

  const userUSDPrices = useInitialUSDPrices();
  const userTokenPrice = useInitialTokenPrice();

  const [loadingTimedout, setLoadingTimedout] = useState(false);

  const hasUSDPrices = useMemo(() => {
    return Boolean(
      userUSDPrices.CURRENCY_A ||
        userUSDPrices.CURRENCY_B ||
        currencyAUSDC ||
        currencyBUSDC ||
        userUSDPrices.CURRENCY_A ||
        currencyBUSDC ||
        userUSDPrices.CURRENCY_B ||
        currencyAUSDC,
    );
  }, [userUSDPrices, currencyAUSDC, currencyBUSDC]);

  const usdA = useMemo(() => {
    if (userUSDPrices.CURRENCY_A) return parseFloat(userUSDPrices.CURRENCY_A);
    if (currencyAUSDC) return parseFloat(currencyAUSDC.toSignificant(8));
    return;
  }, [userUSDPrices, currencyAUSDC]);

  const usdB = useMemo(() => {
    if (userUSDPrices.CURRENCY_B) return parseFloat(userUSDPrices.CURRENCY_B);
    if (currencyBUSDC) return parseFloat(currencyBUSDC.toSignificant(8));
    return;
  }, [userUSDPrices, currencyBUSDC]);

  useEffect(() => {
    setTimeout(() => {
      if (!hasUSDPrices) {
        setLoadingTimedout(true);
      }
    }, 5000);
  }, [currencyAUSDC, currencyBUSDC, userUSDPrices]);

  return (
    <Box className='flex justify-center items-center' mt={1} mb={1}>
      <StyledLabel fontSize='12px' style={{ marginRight: 5 }}>
        Current Price: 0.55{' '}
      </StyledLabel>
      <StyledLabel fontSize='12px' color='#696c80'>
        USDT per Matic
      </StyledLabel>
    </Box>
  );
}
