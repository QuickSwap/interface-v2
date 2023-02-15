import {
  currencyEquals,
  Token,
  Currency,
  CurrencyAmount,
  ETHER,
} from '@uniswap/sdk';
import React, { useMemo, useCallback, MutableRefObject } from 'react';
import { useSelectedTokenList } from 'state/lists/hooks';
import { isTokensOnList } from 'utils';
import CurrencyRow from './CurrencyRow';
import { Virtuoso } from 'react-virtuoso';

interface CurrencyListProps {
  currencies: Token[];
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Token) => void;
  otherCurrency?: Currency | null;
  showETH: boolean;
  balances: (CurrencyAmount | undefined)[];
  usdPrices?: number[];
}

const currencyKey = (currency: Token): string => {
  return currency instanceof Token
    ? currency.address
    : currency === ETHER
    ? 'ETHER'
    : '';
};

const CurrencyList: React.FC<CurrencyListProps> = ({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  showETH,
  balances,
  usdPrices,
}) => {
  const itemData = useMemo(
    () => (showETH ? [Token.ETHER, ...currencies] : currencies),
    [currencies, showETH],
  );
  const selectedTokenList = useSelectedTokenList();
  const isOnSelectedList = useMemo(
    () => isTokensOnList(selectedTokenList, itemData),
    [selectedTokenList, itemData],
  );

  const Row = useCallback(
    ({ data, index, style }) => {
      const currency: Token = data[index];
      const isSelected = Boolean(
        selectedCurrency && currencyEquals(selectedCurrency, currency),
      );
      const otherSelected = Boolean(
        otherCurrency && currencyEquals(otherCurrency, currency),
      );
      const handleSelect = () => onCurrencySelect(currency);
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
          isOnSelectedList={isOnSelectedList[index]}
          balance={balances[index]}
          usdPrice={usdPrices ? usdPrices[index] : 0}
        />
      );
    },
    [
      onCurrencySelect,
      otherCurrency,
      selectedCurrency,
      isOnSelectedList,
      balances,
      usdPrices,
    ],
  );

  const itemKey = useCallback(
    (index: number, data: any) => currencyKey(data[index]),
    [],
  );

  return (
    <Virtuoso
      totalCount={itemData.length}
      itemContent={(index) => Row({ data: itemData, index })}
    />
  );
};

export default CurrencyList;
