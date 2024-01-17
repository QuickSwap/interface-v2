import { Box } from '@mui/material';
import { ETHER, WETH } from '@uniswap/sdk';
import { CurrencyLogo, DoubleCurrencyLogo, NumericalInput } from 'components';
import { formatUnits } from 'ethers/lib/utils';
import { useActiveWeb3React } from 'hooks';
import { useICHIVaultDepositData } from 'hooks/useICHIData';
import React from 'react';
import { useTranslation } from 'next-i18next';
import {
  useSingleTokenCurrency,
  useSingleTokenTypeInput,
  useSingleTokenVault,
} from 'state/singleToken/hooks';
import { formatNumber } from 'utils';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import styles from 'styles/components/PoolsSingleToken.module.scss';

const SingleTokenEnterAmount: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const currency = useSingleTokenCurrency();
  const { selectedVault } = useSingleTokenVault();
  const { typedValue, typeInput } = useSingleTokenTypeInput();
  const { price: usdPrice } = useUSDCPriceFromAddress(
    currency?.wrapped.address ?? '',
  );
  const {
    data: { isNativeToken, availableAmount },
  } = useICHIVaultDepositData(Number(typedValue), currency, selectedVault);

  return (
    <>
      <Box className='flex justify-between'>
        <small className='weight-600'>3. {t('enterAmount')}</small>
        {selectedVault && (
          <Box className='flex' gap='6px'>
            <small>
              {selectedVault.token0?.symbol}/{selectedVault.token1?.symbol}
            </small>
            <Box className={styles.singleTokenPoolFee}>
              {formatNumber(selectedVault.fee)}%
            </Box>
          </Box>
        )}
      </Box>
      <Box className={styles.singleTokenInputWrapper} mt={2}>
        <Box className='flex items-center' gap='8px'>
          <NumericalInput onUserInput={typeInput} value={typedValue} />
          {currency ? (
            <Box className='flex items-center' gap='6px'>
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
              className={styles.singleTokenInputMax}
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
