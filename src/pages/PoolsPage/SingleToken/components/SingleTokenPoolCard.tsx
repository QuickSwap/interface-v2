import { Box, Typography } from '@material-ui/core';
import { DoubleCurrencyLogo } from 'components';
import { ICHIVault, useICHIVaultAPR } from 'hooks/useICHIData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from 'utils';
import { Check } from '@material-ui/icons';
import Loader from 'components/Loader';

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
      className={`singleTokenPoolCard ${
        selected
          ? 'singleTokenPoolCardSelected'
          : unselected
          ? 'singleTokenPoolCardUnSelected'
          : ''
      }`}
      onClick={onClick}
    >
      <Box width='80%' className='flex items-center'>
        <Box className='singleTokenPoolCardCheck'>{selected && <Check />}</Box>
        <DoubleCurrencyLogo
          currency0={vault.token0}
          currency1={vault.token1}
          size={18}
        />
        <small>
          {vault.token0?.symbol}/{vault.token1?.symbol}
        </small>
        <Box className='singleTokenPoolFee'>
          {formatNumber(vault.fee)}% {t('fee')}
        </Box>
      </Box>
      <Box width='20%'>
        {isLoading || loadingUSDPrices ? (
          <Loader />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gridGap: '4px' }}>
            <Typography style={{ color: '#0fc679' }}>
              {formatNumber(apr)}%
            </Typography>
            <img src='/icons/pools/star.webp' alt='star' width={20} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SingleTokenPoolCard;
