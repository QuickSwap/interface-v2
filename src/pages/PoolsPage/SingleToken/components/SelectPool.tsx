import { Box } from '@material-ui/core';
import { WETH } from '@uniswap/sdk';
import { Currency } from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SingleTokenPoolCard from './SingleTokenPoolCard';
import { useICHIVaults } from 'hooks/useICHIData';
import { useSingleTokenVault } from 'state/singleToken/hooks';

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
  const allVaults = useICHIVaults();
  const vaults = allVaults?.filter((vault) => {
    const token0Address = vault.token0?.address ?? '';
    const token1Address = vault.token1?.address ?? '';
    return (
      token0Address.toLowerCase() === tokenAddress.toLowerCase() ||
      token1Address.toLowerCase() === tokenAddress.toLowerCase()
    );
  });

  const { selectVault, selectedVault } = useSingleTokenVault();

  return (
    <Box>
      <small className='weight-600'>2. {t('selectPool')}</small>
      <Box mt={2}>
        {vaults && vaults.length > 0 ? (
          <Box className='singleTokenPoolsWrapper'>
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
                onClick={() => {
                  if (
                    selectedVault &&
                    vault.address.toLowerCase() === selectedVault.toLowerCase()
                  ) {
                    selectVault('');
                  } else {
                    selectVault(vault.address);
                  }
                }}
                selected={
                  !!selectedVault &&
                  vault.address.toLowerCase() === selectedVault.toLowerCase()
                }
                unselected={
                  !!selectedVault &&
                  vault.address.toLowerCase() !== selectedVault.toLowerCase()
                }
              />
            ))}
          </Box>
        ) : (
          <Box className='singleTokenSelectPoolWarning'>
            {currency ? t('nopoolFound') : t('availablePoolsWillShowHere')}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SingleTokenSelectPool;
