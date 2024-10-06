import {
  currencyEquals,
  Token,
  ETHER,
  Currency,
  CurrencyAmount,
  ChainId,
  WETH,
} from '@uniswap/sdk';
import React, { useMemo, useCallback, useState } from 'react';
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
  favoriteCurrencies?: Currency[];
  handleChangeFavorite?: (currency: Currency, checked: boolean) => void;
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
  favoriteCurrencies,
  handleChangeFavorite,
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
          onChangeFavorite={handleChangeFavorite}
          isFavorite={favoriteCurrencies?.some(
            (item) => item?.symbol === currency?.symbol,
          )}
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
          isOnSelectedList={isOnSelectedList[index]}
          balance={balances.find(
            (b) =>
              b?.currency.symbol?.toLowerCase() ===
              currency?.symbol?.toLowerCase(),
          )}
          usdPrice={usdPrice ? usdPrice.price : 0}
        />
      );
    },
    [
      selectedCurrency,
      otherCurrency,
      chainId,
      usdPrices,
      handleChangeFavorite,
      favoriteCurrencies,
      isOnSelectedList,
      balances,
      onCurrencySelect,
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
