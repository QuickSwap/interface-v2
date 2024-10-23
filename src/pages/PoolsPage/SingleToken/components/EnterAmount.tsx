import { Box } from '@material-ui/core';
import { ETHER, WETH } from '@uniswap/sdk';
import { CurrencyLogo, DoubleCurrencyLogo, NumericalInput } from 'components';
import { formatUnits } from 'ethers/lib/utils';
import { useActiveWeb3React } from 'hooks';
import { useICHIVaultDepositData } from 'hooks/useICHIData';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSingleTokenCurrency,
  useSingleTokenTypeInput,
  useSingleTokenVault,
} from 'state/singleToken/hooks';
import { formatNumber } from 'utils';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';

interface SingleTokenEnterAmountProps {
  currency?: any;
}

const SingleTokenEnterAmount: React.FC<SingleTokenEnterAmountProps> = ({
  currency: orgCurrency,
}) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const singleCurrency = useSingleTokenCurrency();

  const currency = useMemo(() => {
    return orgCurrency || singleCurrency;
  }, [orgCurrency, singleCurrency]);

  const { selectedVault } = useSingleTokenVault();
  const { typedValue, typeInput } = useSingleTokenTypeInput();
  const { price: usdPrice } = useUSDCPriceFromAddress(
    currency?.wrapped.address ?? '',
  );
  const {
    data: { isNativeToken, availableAmount },
  } = useICHIVaultDepositData(typedValue, currency, selectedVault);

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
        <Box className='flex items-center' gridGap={8}>
          <NumericalInput onUserInput={typeInput} value={typedValue} />
          {currency ? (
            <Box className='flex items-center' gridGap={6}>
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
                  formatUnits(availableAmount.toString(), currency?.decimals),
                )}
              </small>
            </small>
            <Box
              className='singleTokenInputMax'
              ml='4px'
              onClick={() => {
                typeInput(
                  formatUnits(availableAmount.toString(), currency?.decimals),
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
