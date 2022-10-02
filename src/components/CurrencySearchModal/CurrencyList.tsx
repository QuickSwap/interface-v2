import {
  currencyEquals,
  Token,
  Currency,
  ChainId,
  ETHER as NATIVE,
} from '@uniswap/sdk';
import React, { useMemo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useSelectedTokenList } from 'state/lists/hooks';
import { isTokensOnList } from 'utils';
import CurrencyRow from './CurrencyRow';

interface CurrencyListProps {
  currencies: Token[];
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Token) => void;
  otherCurrency?: Currency | null;
  showETH: boolean;
  chainId: ChainId;
}

const CurrencyList: React.FC<CurrencyListProps> = ({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  showETH,
  chainId,
}) => {
  const nativeCurrency = NATIVE[chainId];
  const itemData = useMemo(
    () => (showETH ? [nativeCurrency, ...currencies] : currencies),
    [currencies, showETH, nativeCurrency],
  );
  const selectedTokenList = useSelectedTokenList();
  const isOnSelectedList = useMemo(
    () => isTokensOnList(selectedTokenList, itemData, chainId),
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
        />
      );
    },
    [onCurrencySelect, otherCurrency, selectedCurrency, isOnSelectedList],
  );

  return (
    <Virtuoso
      totalCount={itemData.length}
      itemContent={(index) => Row({ data: itemData, index })}
    />
  );
};

export default CurrencyList;
