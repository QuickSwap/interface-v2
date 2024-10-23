import { currencyEquals, ChainId, WETH } from '@uniswap/sdk';
import React, { useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import ZapCurrencyRow from './ZapCurrencyRow';
import { Token, Currency, CurrencyAmount } from '@uniswap/sdk-core';

interface ZapCurrencyListProps {
  currencies: Currency[];
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Token) => void;
  otherCurrency?: Currency | null;
  chainId: ChainId;
  balances: (CurrencyAmount<Currency> | undefined)[];
  usdPrices?: { address: string; price: number }[];
}

const ZapCurrencyList: React.FC<ZapCurrencyListProps> = ({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  chainId,
  balances,
  usdPrices,
}) => {
  const itemData = currencies;

  const Row = useCallback(
    ({ data, index, style }: { data: any[]; index: number; style?: any }) => {
      const currency = data[index];
      const isSelected = Boolean(
        selectedCurrency && currencyEquals(selectedCurrency, currency),
      );
      const otherSelected = Boolean(
        otherCurrency && currencyEquals(otherCurrency, currency),
      );
      const handleSelect = () => onCurrencySelect(currency);
      const token = currency.isNative ? WETH[chainId] : currency;
      const usdPrice = usdPrices
        ? usdPrices.find(
            (item) =>
              item.address.toLowerCase() === token?.address.toLowerCase(),
          )
        : undefined;
      return (
        <ZapCurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
          balance={balances[index]}
          usdPrice={usdPrice ? usdPrice.price : 0}
        />
      );
    },
    [
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      balances,
      usdPrices,
      chainId,
    ],
  );

  return (
    <Virtuoso
      style={{ height: '300px' }}
      totalCount={itemData.length}
      itemContent={(index) => Row({ data: itemData, index })}
    />
  );
};

export default ZapCurrencyList;
