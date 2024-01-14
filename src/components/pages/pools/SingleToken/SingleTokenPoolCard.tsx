import { Box, CircularProgress } from '@mui/material';
import { DoubleCurrencyLogo } from 'components';
import { ICHIVault, useICHIVaultAPR } from 'hooks/useICHIData';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { formatNumber } from 'utils';
import { Check } from '@mui/icons-material';
import styles from 'styles/components/PoolsSingleToken.module.scss';

const SingleTokenPoolCard: React.FC<{
  vault: ICHIVault;
  onClick: () => void;
  selected: boolean;
  unselected: boolean;
  usdPrices?: {
    address: string;
    price: any;
  }[];
  loadingUSDPrices: boolean;
}> = ({
  vault,
  onClick,
  selected,
  unselected,
  usdPrices,
  loadingUSDPrices,
}) => {
  const { t } = useTranslation();
  const { isLoading, apr } = useICHIVaultAPR(vault, usdPrices);

  return (
    <Box
      className={`${styles.singleTokenPoolCard} ${
        selected
          ? styles.singleTokenPoolCardSelected
          : unselected
          ? styles.singleTokenPoolCardUnSelected
          : ''
      }`}
      onClick={onClick}
    >
      <Box width='80%' className='flex items-center'>
        <Box className={styles.singleTokenPoolCardCheck}>
          {selected && <Check />}
        </Box>
        <DoubleCurrencyLogo
          currency0={vault.token0}
          currency1={vault.token1}
          size={18}
        />
        <small>
          {vault.token0?.symbol}/{vault.token1?.symbol}
        </small>
        <Box className={styles.singleTokenPoolFee}>
          {formatNumber(vault.fee)}% {t('fee')}
        </Box>
      </Box>
      <Box width='20%'>
        {isLoading || loadingUSDPrices ? (
          <CircularProgress size='16px' />
        ) : (
          <p className='small'>{formatNumber(apr)}%</p>
        )}
      </Box>
    </Box>
  );
};

export default SingleTokenPoolCard;
