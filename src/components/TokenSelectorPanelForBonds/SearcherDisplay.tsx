import React from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { useV2Pair } from 'hooks/v3/useV2Pairs';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import { ReactComponent as ZapIcon } from 'assets/images/bonds/ZapIcon.svg';
import { BondToken } from 'types/bond';
import DoubleCurrencyLogo from 'components/DoubleCurrencyLogo';
import CurrencyLogo from 'components/CurrencyLogo';
import { ChainId } from '@uniswap/sdk';
import { useCurrency } from 'hooks/v3/Tokens';
import { useCurrencyFromSymbol } from 'hooks/Tokens';

export function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  return <small className='text-bold'>{balance?.toSignificant(5)}</small>;
}

const SearcherDisplay: React.FC<{
  item?: BondToken | string;
  chainId: ChainId;
}> = ({ item, chainId }) => {
  const { account } = useActiveWeb3React();
  const address = typeof item === 'string' ? item : item?.address?.[chainId];
  const currency = useCurrency(address);
  const balance = useCurrencyBalance(account, currency ?? undefined);
  const lpName = typeof item === 'string' || !item ? '' : item?.symbol;

  const [firstValue, secondValue] = lpName?.split('-');

  const currencyA = useCurrencyFromSymbol(firstValue);
  const currencyB = useCurrencyFromSymbol(secondValue);

  return (
    <Box className='searcherDisplayItem' gridGap={12}>
      {!lpName && <ZapIcon />}
      <Box width='100%' className='flex items-center justify-between'>
        <Box className='flex items-center' gridGap={12}>
          {lpName ? (
            <DoubleCurrencyLogo
              currency0={currencyA}
              currency1={currencyB}
              size={32}
            />
          ) : (
            <CurrencyLogo currency={currency ?? undefined} size='32px' />
          )}
          <p>{lpName ? lpName : currency?.name}</p>
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
