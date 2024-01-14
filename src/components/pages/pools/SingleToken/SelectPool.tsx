import { Box, CircularProgress } from '@mui/material';
import { WETH } from '@uniswap/sdk';
import { Currency } from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import React from 'react';
import { useTranslation } from 'next-i18next';
import SingleTokenPoolCard from './SingleTokenPoolCard';
import { useICHIVaults } from 'hooks/useICHIData';
import { useSingleTokenVault } from 'state/singleToken/hooks';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import styles from 'styles/components/PoolsSingleToken.module.scss';

const SingleTokenSelectPool: React.FC<{ currency?: Currency }> = ({
  currency,
}) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const tokenAddress = currency
    ? currency.isNative
      ? WETH[chainId].address
      : currency.address
    : '';
  const { loading, data: allVaults } = useICHIVaults();
  const vaults = allVaults?.filter((vault) => {
    const token0Address = vault.token0?.address ?? '';
    const token1Address = vault.token1?.address ?? '';
    return (
      (token0Address.toLowerCase() === tokenAddress.toLowerCase() &&
        vault.allowToken0) ||
      (token1Address.toLowerCase() === tokenAddress.toLowerCase() &&
        vault.allowToken1)
    );
  });

  const { selectVault, selectedVault } = useSingleTokenVault();

  const allTokenAddresses = allVaults.reduce((memo: string[], vault) => {
    if (vault.token0 && !memo.includes(vault.token0.address.toLowerCase())) {
      memo.push(vault.token0.address.toLowerCase());
    }
    if (vault.token1 && !memo.includes(vault.token1.address.toLowerCase())) {
      memo.push(vault.token1.address.toLowerCase());
    }
    return memo;
  }, []);
  const {
    loading: loadingUSDPrices,
    prices: usdPrices,
  } = useUSDCPricesFromAddresses(allTokenAddresses);

  return (
    <Box>
      <small className='weight-600'>2. {t('selectPool')}</small>
      <Box mt={2}>
        {loading ? (
          <Box py={2} className='flex justify-center items-center'>
            <CircularProgress size='16px' />
          </Box>
        ) : vaults && vaults.length > 0 ? (
          <Box className={styles.singleTokenPoolsWrapper}>
            <Box className='flex items-center' padding='0 16px'>
              <Box width='80%'>
                <small className='text-secondary'>{t('pool')}</small>
              </Box>
              <Box width='20%'>
                <small className='text-secondary'>{t('apr')}</small>
              </Box>
            </Box>
            {vaults.map((vault) => (
              <SingleTokenPoolCard
                key={vault.address}
                vault={vault}
                usdPrices={usdPrices}
                loadingUSDPrices={loadingUSDPrices}
                onClick={() => {
                  if (
                    selectedVault &&
                    vault.address.toLowerCase() ===
                      selectedVault.address.toLowerCase()
                  ) {
                    selectVault(undefined);
                  } else {
                    selectVault(vault);
                  }
                }}
                selected={
                  !!selectedVault &&
                  vault.address.toLowerCase() ===
                    selectedVault.address.toLowerCase()
                }
                unselected={
                  !!selectedVault &&
                  vault.address.toLowerCase() !==
                    selectedVault.address.toLowerCase()
                }
              />
            ))}
          </Box>
        ) : (
          <Box className={styles.singleTokenSelectPoolWarning}>
            {currency ? t('nopoolFound') : t('availablePoolsWillShowHere')}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SingleTokenSelectPool;
