import React from 'react';
import { useCallback } from 'react';
import { Currency, Price } from '@uniswap/sdk-core';
import { StyledPriceContainer } from './styled';
import { StyledLabel } from '../Common/styledElements';

interface TradePriceProps {
  price: Price<Currency, Currency>;
  showInverted: boolean;
  setShowInverted: (showInverted: boolean) => void;
}

export default function TradePrice({
  price,
  showInverted,
  setShowInverted,
}: TradePriceProps) {
  let formattedPrice: string;
  try {
    formattedPrice = showInverted
      ? price.toSignificant(4)
      : price.invert()?.toSignificant(4);
  } catch (error) {
    formattedPrice = '0';
  }

  const label = showInverted
    ? `${price.quoteCurrency?.symbol}`
    : `${price.baseCurrency?.symbol} `;
  const labelInverted = showInverted
    ? `${price.baseCurrency?.symbol} `
    : `${price.quoteCurrency?.symbol}`;
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [
    setShowInverted,
    showInverted,
  ]);

  const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ??
    '-'} ${label}`;

  return (
    <StyledPriceContainer onClick={flipPrice} title={text}>
      <div
        style={{ alignItems: 'center', display: 'flex', width: 'fit-content' }}
      >
        <StyledLabel color={'#c7cad9'}>{text}</StyledLabel>
      </div>
    </StyledPriceContainer>
  );
}
