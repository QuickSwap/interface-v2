import {
  currencyEquals,
  Token,
  ETHER,
  Currency,
  CurrencyAmount,
  ChainId,
  WETH,
} from '@uniswap/sdk';
import React, { useMemo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useIsV2 } from 'state/application/hooks';
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
  balances: (CurrencyAmount | undefined)[];
  usdPrices?: { address: string; price: number }[];
}

const CurrencyList: React.FC<CurrencyListProps> = ({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  showETH,
  chainId,
  balances,
  usdPrices,
}) => {
  const { isV2 } = useIsV2();
  const nativeCurrency = useMemo(() => {
    return isV2
      ? ETHER[chainId]
      : { ...ETHER[chainId], isNative: true, isToken: false };
  }, [chainId, isV2]);
  const itemData = useMemo(
    () => (showETH ? [nativeCurrency, ...currencies] : currencies),
    [currencies, nativeCurrency, showETH],
  );
  const selectedTokenList = useSelectedTokenList();
  const isOnSelectedList = useMemo(
    () => isTokensOnList(selectedTokenList, itemData, chainId),
    [selectedTokenList, itemData, chainId],
  );

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
      const token =
        currencyEquals(currency, ETHER[chainId]) || currency.isNative
          ? WETH[chainId]
          : currency;
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
