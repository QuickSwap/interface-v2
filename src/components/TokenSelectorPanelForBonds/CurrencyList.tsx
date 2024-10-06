import React, { useCallback } from 'react';
import { Box } from '@material-ui/core';
import SearcherDisplay from './SearcherDisplay';
import { BondToken } from 'types/bond';
import { Virtuoso } from 'react-virtuoso';
import { ChainId } from '@uniswap/sdk';

export default function CurrencyList({
  currenciesList,
  onCurrencySelect,
  chainId,
}: {
  currenciesList: (BondToken | string)[];
  onCurrencySelect: (tokenAddress: string) => void;
  chainId: ChainId;
}) {
  const itemData = currenciesList;

  const Row = useCallback(
    ({
      data,
      index,
      style,
    }: {
      data: (BondToken | string)[];
      index: number;
      style?: any;
    }) => {
      const currency: BondToken | string = data[index];
      const handleSelect = () =>
        typeof currency === 'string'
          ? onCurrencySelect(currency)
          : onCurrencySelect(currency.address[chainId] ?? '');
      const key = index;

      return (
        <Box
          style={style}
          key={`token-item-${key}`}
          className={`token-item-${key}`}
          onClick={handleSelect}
        >
          <SearcherDisplay item={currency} chainId={chainId} />
        </Box>
      );
    },
    [chainId, onCurrencySelect],
  );

  return (
    <Virtuoso
      style={{ height: '300px' }}
      totalCount={itemData.length}
      itemContent={(index) => Row({ data: itemData, index })}
    />
  );
}
