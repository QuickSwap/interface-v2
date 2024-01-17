import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useV2Pair } from 'hooks/v3/useV2Pairs';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import { DualCurrencySelector } from 'types/bond';
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo';
import CurrencyLogo from 'components/CurrencyLogo';
import styles from 'styles/components/DualCurrencyPanel.module.scss';

export function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <small className='text-bold'>{balance?.toSignificant(5)}</small>;
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
    <Box className={styles.searcherDisplayItem} gap='12px'>
      {!currencyB && (
        <picture>
          <img src='/assets/images/bonds/ZapIcon.svg' alt='Zap Icon' />
        </picture>
      )}
      <Box width='100%' className='flex items-center justify-between'>
        <Box className='flex items-center' gap='12px'>
          {currencyB ? (
            <DoubleCurrencyLogo
              currency0={currencyA}
              currency1={currencyB}
              size={32}
            />
          ) : (
            <CurrencyLogo currency={currencyA} size='32px' />
          )}
          <Box>
            <p>
              {currencyB
                ? `${currencyA?.wrapped?.symbol}-${currencyB?.wrapped?.symbol}`
                : currencyA?.symbol}
            </p>
            <small>{pair ? pair?.liquidityToken?.name : currencyA?.name}</small>
          </Box>
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
