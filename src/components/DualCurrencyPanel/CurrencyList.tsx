import React, { useCallback } from 'react';
import { Box } from '@material-ui/core';
import SearcherDisplay from './SearcherDisplay';
import { DualCurrencySelector } from 'types/bond';
import { Virtuoso } from 'react-virtuoso';

export default function CurrencyList({
  currenciesList,
  onCurrencySelect,
}: {
  currenciesList: DualCurrencySelector[];
  onCurrencySelect: (currency: DualCurrencySelector, index: number) => void;
}) {
  const itemData: (DualCurrencySelector | undefined)[] = currenciesList;

  const Row = useCallback(
    ({ data, index, style }: any) => {
      const currency: DualCurrencySelector = data[index];
      const handleSelect = () => onCurrencySelect(currency, index);
      const key = index;

      return (
        <Box
          style={style}
          key={`token-item-${key}`}
          className={`token-item-${key}`}
          onClick={handleSelect}
        >
          <SearcherDisplay item={currency} />
        </Box>
      );
    },
    [onCurrencySelect],
  );

  return (
    <Virtuoso
      height={300}
      width='100%'
      totalCount={itemData.length}
      itemContent={(index) => Row({ data: itemData, index })}
    />
  );
}
