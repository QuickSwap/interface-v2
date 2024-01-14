import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { DoubleCurrencyLogo, CurrencyLogo } from 'components';
import { formatNumber } from 'utils';
import styles from 'styles/components/DualCurrencyPanel.module.scss';

export function Balance({ balance }: { balance: CurrencyAmount<Currency> }) {
  const bal = Number(balance.toExact());
  return <small>{formatNumber(bal)}</small>;
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
    <Box
      className={styles.dualCurrencyDropdownWrapper}
      width={active ? '100%' : '180px'}
    >
      <Box className='flex items-center' gap='5px'>
        {!inputCurrencies[1] && !active && (
          <img src='/assets/images/bonds/ZapIcon.svg' />
        )}
        {inputCurrencies[1] ? (
          <DoubleCurrencyLogo
            currency0={inputCurrencies[0]}
            currency1={inputCurrencies[1]}
            size={24}
          />
        ) : (
          <CurrencyLogo currency={inputCurrencies[0]} size='24px' />
        )}
        <p className='weight-600'>
          {inputCurrencies[1]
            ? `${inputCurrencies[0]?.wrapped.symbol}-${inputCurrencies[1]?.wrapped.symbol}`
            : inputCurrencies[0]?.symbol}
        </p>
      </Box>
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
  );
};

export default React.memo(DropdownDisplay);
