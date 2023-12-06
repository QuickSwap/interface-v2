import React from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { useV2Pair } from 'hooks/v3/useV2Pairs';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import { ReactComponent as ZapIcon } from 'assets/images/bonds/ZapIcon.svg';
import { DualCurrencySelector } from 'types/bond';

export function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <p title={balance?.toExact()}>{balance?.toSignificant(5)}</p>;
}

const SearcherDisplay: React.FC<{
  item: DualCurrencySelector;
}> = ({ item }) => {
  const { account } = useActiveWeb3React();
  const { currencyA, currencyB } = item;
  const [, pair] = useV2Pair(currencyA ?? undefined, currencyB ?? undefined);
  const balance = useCurrencyBalance(
    account ?? undefined,
    pair ? pair?.liquidityToken : currencyA ?? undefined,
  );

  return (
    <Box className='flex items-center'>
      <Box className='flex items-center' minWidth='50px'>
        {!currencyB && (
          <Box sx={{ marginRight: '10px' }}>
            <ZapIcon />
          </Box>
        )}
      </Box>
      <Box width='100%' className='flex items-center justify-between'>
        <Box ml='10px'>
          <p>
            {currencyB
              ? `${currencyA?.wrapped?.symbol}-${currencyB?.wrapped?.symbol}`
              : currencyA?.symbol}
          </p>
          <small>{pair ? pair?.liquidityToken?.name : currencyA?.name}</small>
        </Box>
        <Box>
          {balance ? (
            <Balance balance={balance} />
          ) : account ? (
            <CircularProgress size='20px' />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(SearcherDisplay);
