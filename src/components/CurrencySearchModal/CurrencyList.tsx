import { currencyEquals, Token, Currency, CurrencyAmount } from '@uniswap/sdk';
import React, { useMemo, useCallback } from 'react';
import { useSelectedTokenList } from 'state/lists/hooks';
import { isTokensOnList } from 'utils';
import CurrencyRow from './CurrencyRow';
import { Virtuoso } from 'react-virtuoso';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';

interface CurrencyListProps {
  currencies: Token[];
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Token) => void;
  otherCurrency?: Currency | null;
  showETH: boolean;
  balances: (CurrencyAmount | undefined)[];
  usdPrices?: { address: string; price: number }[];
}

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
  const { chainId } = useActiveWeb3React();
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
      const token = wrappedCurrency(currency, chainId);
      const usdPrice = usdPrices
        ? usdPrices.find(
            (item) =>
              item.address.toLowerCase() === token?.address.toLowerCase(),
          )
        : undefined;
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
          isOnSelectedList={isOnSelectedList[index]}
          balance={balances[index]}
          usdPrice={usdPrice ? usdPrice.price : 0}
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
      chainId,
    ],
  );

  return (
    <Virtuoso
      totalCount={itemData.length}
      itemContent={(index) => Row({ data: itemData, index })}
    />
  );
};

export default CurrencyList;
