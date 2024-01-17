import { Box, Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { formatNumber } from 'utils';
import { V3Farm } from './Farms';
import styles from 'styles/pages/Farm.module.scss';

export const V3FarmAPRTooltipItem: React.FC<{
  farm: V3Farm;
  token0?: string;
  token1?: string;
}> = ({ farm, token0, token1 }) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box className='flex items-center' gap='6px'>
        {farm.title && (
          <Box
            className={`${styles.farmAPRTitleWrapper} ${
              farm.title.toLowerCase() === 'narrow'
                ? 'bg-purple8'
                : farm.title.toLowerCase() === 'wide'
                ? 'bg-blue12'
                : farm.title.toLowerCase() === 'stable'
                ? 'bg-green4'
                : 'bg-gray32'
            }`}
          >
            <span className='text-bgColor'>{farm.title}</span>
          </Box>
        )}
        <Box className={`${styles.farmAPRTitleWrapper} bg-textSecondary`}>
          <span className='text-gray32'>{farm.type.toUpperCase()}</span>
        </Box>
      </Box>
      <Box mt='8px'>
        <small>{t('totalAPR')}</small>
        <h5 className='text-success'>
          {formatNumber(farm.poolAPR + farm.farmAPR)}
          <small> %</small>
        </h5>
      </Box>
      <Box mt='4px'>
        <small>
          {t('poolAPR')}: {formatNumber(farm.poolAPR)}% + {t('rewardsAPR')}:{' '}
          {formatNumber(farm.farmAPR)}%
        </small>
      </Box>
      <Box mt={2}>
        <Button
          className={styles.farmAPRGetLPButton}
          onClick={() => {
            let currencyStr = '';
            if (token0) {
              currencyStr += `currency0=${token0}`;
            }
            if (token1) {
              if (token0) {
                currencyStr += '&';
              }
              currencyStr += `currency1=${token1}`;
            }
            window.open(`#/pools?${currencyStr}`, '_blank');
          }}
        >
          {t('getLP')}
        </Button>
      </Box>
    </Box>
  );
};
