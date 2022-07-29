import React, { ReactNode, useCallback, useMemo } from 'react';
import { Currency, Price, Token } from '@uniswap/sdk-core';
import { Bound } from 'state/mint/v3/actions';
import { StyledSelectableBox } from 'components/AddLiquidityV3/CommonStyledElements';
import { FeeAmount } from 'v3lib/utils';
import { PriceFormats } from '../PriceFomatToggler';

interface LiquidityChartRangeInputProps {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  feeAmount?: FeeAmount;
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };
  price: number | undefined;
  priceLower?: Price<Token, Token>;
  priceUpper?: Price<Token, Token>;
  onLeftRangeInput: (typedValue: string) => void;
  onRightRangeInput: (typedValue: string) => void;
  interactive: boolean;
  priceFormat: PriceFormats;
}

export default function LiquidityChartRangeInput({
  currencyA,
  currencyB,
  feeAmount,
  ticksAtLimit,
  price,
  priceLower,
  priceUpper,
  onLeftRangeInput,
  onRightRangeInput,
  interactive,
  priceFormat,
}: LiquidityChartRangeInputProps) {
  return <StyledSelectableBox></StyledSelectableBox>;
}
