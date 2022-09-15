import React from 'react';
import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { unwrappedToken } from '../../utils/unwrappedToken';
import CurrencyLogo from '../../components/CurrencyLogo';
import { Text } from 'rebass';
import { WrappedCurrency } from '../../models/types';
import { AutoColumn } from 'components/v3/Column';
import { RowBetween, RowFixed } from 'components/v3/Row';
import FormattedCurrencyAmount from 'components/v3/FormattedCurrencyAmount';

export default function LiquidityInfo({
  token0Amount,
  token1Amount,
}: {
  token0Amount: CurrencyAmount<Token>;
  token1Amount: CurrencyAmount<Token>;
}) {
  const currency0 = unwrappedToken(token0Amount.currency);
  const currency1 = unwrappedToken(token1Amount.currency);

  return (
    <AutoColumn gap='8px'>
      <RowBetween>
        <RowFixed>
          <CurrencyLogo
            size='24px'
            style={{ marginRight: '8px' }}
            currency={currency0 as WrappedCurrency}
          />
          <Text fontSize={16} fontWeight={500}>
            {currency0.symbol}
          </Text>
        </RowFixed>
        <Text fontSize={16} fontWeight={500}>
          <FormattedCurrencyAmount currencyAmount={token0Amount} />
        </Text>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <CurrencyLogo
            size='24px'
            style={{ marginRight: '8px' }}
            currency={currency1 as WrappedCurrency}
          />
          <Text fontSize={16} fontWeight={500}>
            {currency1.symbol}
          </Text>
        </RowFixed>

        <Text fontSize={16} fontWeight={500}>
          <FormattedCurrencyAmount currencyAmount={token1Amount} />
        </Text>
      </RowBetween>
    </AutoColumn>
  );
}
