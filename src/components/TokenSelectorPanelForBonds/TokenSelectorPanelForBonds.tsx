import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { BondToken } from 'types/bond';
import { useActiveWeb3React } from 'hooks';
import { Box, CircularProgress } from '@material-ui/core';
import { NumericalInput } from 'components';
import 'components/styles/DualCurrencyPanel.scss';
import { ChainId } from '@uniswap/sdk';
import TokenSelectorForBonds from './TokenSelectorForBonds';
import { useCurrency } from 'hooks/v3/Tokens';

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

interface TokenSelectorPanelForBondsProps {
  inputAmount: string;
  setInputAmount: (val: string) => void;
  handleSetMaxBalance: () => void;
  bondPrincipalToken?: BondToken;
  inputTokenAddress: string;
  setInputTokenAddress: (tokenAddress: string) => void;
  chainId: ChainId;
  enableZap: boolean;
  inputTokenPrice?: number;
}

const TokenSelectorPanelForBonds: React.FC<TokenSelectorPanelForBondsProps> = ({
  inputAmount,
  setInputAmount,
  handleSetMaxBalance,
  bondPrincipalToken,
  inputTokenAddress,
  setInputTokenAddress,
  chainId,
  enableZap,
  inputTokenPrice,
}) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const inputCurrency = useCurrency(inputTokenAddress);
  const principalTokenCurrency = useCurrency(
    bondPrincipalToken?.address[chainId],
  );
  const selectedCurrencyBalance = useCurrencyBalance(
    account,
    inputCurrency ?? undefined,
  );
  const principalTokenBalance = useCurrencyBalance(
    account,
    principalTokenCurrency ?? undefined,
  );
  const currencyBalance = selectedCurrencyBalance?.toSignificant(6);

  // Once balances are fetched it should check if the user holds the selected LP
  // if it doesn't, it will select the native coin to enable zap
  const hasRunRef = useRef(false);
  useEffect(() => {
    if (
      !hasRunRef.current &&
      enableZap &&
      principalTokenBalance?.toExact() === '0' &&
      bondPrincipalToken
    ) {
      setInputTokenAddress('ETH');
      hasRunRef.current = true;
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [principalTokenBalance?.toExact(), chainId]);

  return (
    <Box className='dualCurrencyPanelWrapper'>
      <Box className='flex' mb='10px'>
        <NumericalInput value={inputAmount} onUserInput={setInputAmount} />
        <TokenSelectorForBonds
          bondPrincipalToken={bondPrincipalToken}
          inputTokenAddress={inputTokenAddress}
          setInputTokenAddress={setInputTokenAddress}
          enableZap={enableZap}
          chainId={chainId}
        />
      </Box>
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center justify-center'>
          {!inputTokenPrice && inputAmount !== '0.0' ? (
            <CircularProgress size={15} />
          ) : inputAmount !== '0.0' &&
            !!inputTokenPrice &&
            inputTokenPrice !== 0 &&
            inputAmount ? (
            `$${(inputTokenPrice * parseFloat(inputAmount)).toFixed(2)}`
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
                onClick={handleSetMaxBalance}
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

export default React.memo(TokenSelectorPanelForBonds);
