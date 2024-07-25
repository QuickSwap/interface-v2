import { Box, Grid, Typography } from '@material-ui/core';
import { color } from 'd3';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import token from '../../../../../../assets/tokenLogo/0xfa9343c3897324496a05fc75abed6bac29f8a40f.png';
import { useActiveWeb3React } from 'hooks';
import { useICHIVaults } from 'hooks/useICHIData';
import { WETH } from '@uniswap/sdk';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { useSingleTokenVault } from 'state/singleToken/hooks';
import SingleTokenPoolCard from 'pages/PoolsPage/SingleToken/components/SingleTokenPoolCard';
import Loader from 'components/Loader';

interface SelectVaultProps {
  onChoose?: () => void;
  currency?: any;
}

const SelectVault: React.FC<SelectVaultProps> = ({ onChoose, currency }) => {
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

  const vaultList = [
    {
      name: 'WBTC/USDT',
      feePercent: 0.18,
      apr: 89.34,
      icon: token,
      icon2: '/MATIC.png',
      value: 'wbtc_usdt',
    },
    {
      name: 'WBTC/MATIC',
      feePercent: 0.25,
      apr: 56.43,
      icon: token,
      icon2: '/MATIC.png',
      value: 'wbtc_matic',
    },
    {
      name: 'WBTC/WETH',
      feePercent: 0.25,
      apr: 34.43,
      icon: token,
      icon2: '/MATIC.png',
      value: 'wbtc_weth',
    },
  ];

  return (
    <div className='select_vault'>
      <p style={{ marginBottom: '12px' }}>2. {t('selectVault')}</p>

      {loading ? (
        <Box py={2} className='flex justify-center items-center'>
          <Loader />
        </Box>
      ) : vaults && vaults.length > 0 ? (
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
        <Box className='singleTokenSelectPoolWarning'>
          {currency ? t('nopoolFound') : t('availablePoolsWillShowHere')}
        </Box>
      )}
    </div>
  );
};
export default SelectVault;
