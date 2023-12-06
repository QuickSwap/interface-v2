import React from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { ReactComponent as ZapIcon } from 'assets/images/bonds/ZapIcon.svg';
import { DoubleCurrencyLogo, CurrencyLogo } from 'components';

export function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  const bal = parseFloat(balance.toExact());
  return (
    <p title={balance?.toExact()}>
      {bal > 0.0001 ? balance?.toSignificant(4) : '0'}
    </p>
  );
}

const DropdownDisplay: React.FC<{
  principalToken: Currency | null;
  inputCurrencies: Currency[];
  active?: boolean;
}> = ({ principalToken, inputCurrencies, active }) => {
  const { account } = useActiveWeb3React();
  const balance = useCurrencyBalance(
    account ?? undefined,
    inputCurrencies[1]
      ? principalToken ?? inputCurrencies[0]
      : inputCurrencies[0],
  );

  return (
    <Box className='flex items-center' width={active ? '100%' : '170px'}>
      <Box className='dualCurrencyDropdownWrapper'>
        <Box className='flex' mr='5px'>
          {inputCurrencies[1] ? (
            <DoubleCurrencyLogo
              currency0={inputCurrencies[0]}
              currency1={inputCurrencies[1]}
              size={24}
            />
          ) : (
            <CurrencyLogo currency={inputCurrencies[0]} size='24px' />
          )}
        </Box>
        <p className='weight-600'>
          {inputCurrencies[1]
            ? `${inputCurrencies[0]?.wrapped.symbol}-${inputCurrencies[1]?.wrapped.symbol}`
            : inputCurrencies[0]?.symbol}
        </p>
        {!active && (
          <Box>
            {balance ? (
              <Balance balance={balance} />
            ) : account ? (
              <CircularProgress size={20} />
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(DropdownDisplay);
