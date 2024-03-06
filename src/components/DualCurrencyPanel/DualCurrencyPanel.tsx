import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DualCurrencyDropdown from './DualCurrencyDropdown';
import { Currency } from '@uniswap/sdk-core';
import { useCurrencyBalance } from '~/state/wallet/v3/hooks';
import { DualCurrencySelector } from '~/types/bond';
import { useActiveWeb3React, useTokenPriceUsd } from '~/hooks';
import { Box, CircularProgress } from '@material-ui/core';
import { NumericalInput } from '~/components';
import { toNativeCurrency } from '~/utils';
import '~/components/styles/DualCurrencyPanel.scss';

/**
 * Dropdown component that supports both single currencies and currency pairs. An array of pairs is passed as lpList,
 * while the single currencies are fetched by the component itself
 * @param handleMaxInput function to set max available user's balance
 * @param onUserInput function to set input's value
 * @param value input's value
 * @param onCurrencySelect function to select the input's currency (both single and pairs)
 * @param inputCurrencies selected currencies for the input
 * @param lpList param to define the list of pairs to be used by the component
 * @param enableZap determines whether zap functionality is enabled for the selected product
 */

interface DualCurrencyPanelProps {
  handleMaxInput: () => void;
  onUserInput: (val: string) => void;
  value: string;
  onCurrencySelect: (currency: DualCurrencySelector) => void;
  inputCurrencies: Currency[];
  lpList: DualCurrencySelector[];
  principalToken: Currency | null;
  enableZap?: boolean;
  lpUsdVal?: number;
}

const DualCurrencyPanel: React.FC<DualCurrencyPanelProps> = ({
  handleMaxInput,
  onUserInput,
  value,
  onCurrencySelect,
  inputCurrencies,
  lpList,
  principalToken,
  enableZap,
  lpUsdVal = 0,
}) => {
  const { account, chainId } = useActiveWeb3React();
  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    inputCurrencies[1]
      ? principalToken ?? inputCurrencies[0] ?? undefined
      : inputCurrencies[0] ?? undefined,
  );
  const pairBalance = useCurrencyBalance(
    account,
    principalToken ?? inputCurrencies[0] ?? undefined,
  );
  const currencyBalance = selectedCurrencyBalance?.toSignificant(6);
  const { t } = useTranslation();

  const [usdValue] = useTokenPriceUsd(
    inputCurrencies[1] ? principalToken : inputCurrencies[0],
    !!inputCurrencies[1],
  );
  const usdVal = inputCurrencies[1] ? lpUsdVal : usdValue;

  // Once balances are fetched it should check if the user holds the selected LP
  // if it doesn't, it will select the native coin to enable zap
  const hasRunRef = useRef(false);
  useEffect(() => {
    const nativeCurrency = toNativeCurrency(chainId);
    if (
      !hasRunRef.current &&
      enableZap &&
      pairBalance &&
      pairBalance?.toExact() === '0' &&
      nativeCurrency
    ) {
      onCurrencySelect({
        currencyA: nativeCurrency,
        currencyB: undefined,
      });
      hasRunRef.current = true;
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [pairBalance, chainId]);

  const filteredInputCurrencies = inputCurrencies.filter(
    (currency) => !!currency,
  ) as Currency[];

  return (
    <Box className='dualCurrencyPanelWrapper'>
      <Box className='flex' mb='10px'>
        <NumericalInput value={value} onUserInput={onUserInput} />
        {principalToken && (
          <DualCurrencyDropdown
            inputCurrencies={filteredInputCurrencies}
            onCurrencySelect={onCurrencySelect}
            lpList={lpList}
            principalToken={principalToken}
            enableZap={enableZap ?? true}
            showNativeFirst={enableZap && pairBalance?.toExact() === '0'}
          />
        )}
      </Box>
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center justify-center'>
          {!usdVal && value !== '0.0' ? (
            <CircularProgress size={15} />
          ) : value !== '0.0' && usdVal !== 0 && value ? (
            `$${(usdVal * parseFloat(value)).toFixed(2)}`
          ) : null}
        </Box>
        {account && (
          <Box className='flex items-center'>
            <small>
              {t('balance')}: {currencyBalance || t('loading')}
            </small>
            {!currencyBalance && (
              <Box ml='4px' className='flex'>
                <CircularProgress size={15} />
              </Box>
            )}
            {Number(currencyBalance ?? '0') > 0 && (
              <Box
                ml={0.5}
                className='dualCurrencyMaxButton'
                onClick={handleMaxInput}
              >
                <small>{t('max')}</small>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(DualCurrencyPanel);
