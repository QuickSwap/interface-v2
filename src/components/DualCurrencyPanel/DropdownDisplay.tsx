import React from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { useV2Pair } from 'hooks/v3/useV2Pairs';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { ReactComponent as ZapIcon } from 'assets/images/bonds/ZapIcon.svg';

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
  const [, pair] = useV2Pair(inputCurrencies[0], inputCurrencies[1]);
  const balance = useCurrencyBalance(
    account ?? undefined,
    inputCurrencies[1]
      ? principalToken ?? inputCurrencies[0]
      : inputCurrencies[0],
  );

  return (
    <Box className='flex items-center' width={active ? '100%' : '170px'}>
      <Box
        className='flex items-center'
        mr='5px'
        minWidth={inputCurrencies[1] ? '30px' : '35px'}
      >
        {!inputCurrencies[1] && !active && <ZapIcon />}
      </Box>
      <Box
        className='flex items-center justify-between'
        width={active ? undefined : '100%'}
      >
        <p>
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
