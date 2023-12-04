import { Box } from '@material-ui/core';
import { ETHER, JSBI, WETH } from '@uniswap/sdk';
import { CurrencyLogo, DoubleCurrencyLogo, NumericalInput } from 'components';
import { formatUnits } from 'ethers/lib/utils';
import { useActiveWeb3React } from 'hooks';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSingleTokenCurrency,
  useSingleTokenTypeInput,
  useSingleTokenVault,
} from 'state/singleToken/hooks';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { formatNumber } from 'utils';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';

const SingleTokenEnterAmount: React.FC = () => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const currency = useSingleTokenCurrency();
  const { selectedVault } = useSingleTokenVault();
  const { typedValue, typeInput } = useSingleTokenTypeInput();
  const tokenBalance = useCurrencyBalance(account, currency);
  const { price: usdPrice } = useUSDCPriceFromAddress(
    currency?.wrapped.address ?? '',
  );
  const isNativeToken =
    currency &&
    currency.wrapped.address.toLowerCase() ===
      WETH[chainId].address.toLowerCase();
  const ethBalance = useCurrencyBalance(account, ETHER[chainId]);
  const wethBalance = useCurrencyBalance(account, WETH[chainId]);
  const ethBalanceBN = ethBalance?.numerator ?? JSBI.BigInt(0);
  const wethBalanceBN = wethBalance?.numerator ?? JSBI.BigInt(0);
  const tokenBalanceBN = tokenBalance?.numerator ?? JSBI.BigInt(0);
  const balanceBN = useMemo(() => {
    if (isNativeToken) {
      return JSBI.add(ethBalanceBN, wethBalanceBN);
    }
    return tokenBalanceBN;
  }, [ethBalanceBN, isNativeToken, tokenBalanceBN, wethBalanceBN]);

  return (
    <>
      <Box className='flex justify-between'>
        <small className='weight-600'>3. {t('enterAmount')}</small>
        {selectedVault && (
          <Box className='flex'>
            <small>
              {selectedVault.token0?.symbol}/{selectedVault.token1?.symbol}
            </small>
            <Box className='singleTokenPoolFee' ml='6px'>
              {formatNumber(selectedVault.fee)}%
            </Box>
          </Box>
        )}
      </Box>
      <Box className='singleTokenInputWrapper' mt={2}>
        <Box className='flex items-center'>
          <NumericalInput onUserInput={typeInput} value={typedValue} />
          {currency ? (
            <Box className='flex items-center'>
              {isNativeToken ? (
                <DoubleCurrencyLogo
                  currency0={ETHER[chainId]}
                  currency1={WETH[chainId]}
                />
              ) : (
                <CurrencyLogo currency={currency} size='18px' />
              )}
              <p className='font-bold'>
                {isNativeToken
                  ? `${ETHER[chainId].symbol}+${WETH[chainId].symbol}`
                  : currency?.symbol}
              </p>
            </Box>
          ) : (
            <p>{t('selectToken')}</p>
          )}
        </Box>
        <Box mt={2} className='flex justify-between items-center'>
          <small className='text-secondary'>
            ${formatNumber(usdPrice * Number(typedValue))}
          </small>
          <Box className='flex items-center'>
            <small>
              <small className='text-secondary'>{t('available')}: </small>
              <small>
                {formatNumber(
                  formatUnits(balanceBN.toString(), currency?.decimals),
                )}
              </small>
            </small>
            <Box
              className='singleTokenInputMax'
              ml='4px'
              onClick={() => {
                typeInput(
                  formatUnits(balanceBN.toString(), currency?.decimals),
                );
              }}
            >
              {t('max')}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SingleTokenEnterAmount;
