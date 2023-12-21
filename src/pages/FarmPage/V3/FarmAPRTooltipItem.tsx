import { Box, Button } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { formatNumber } from 'utils';

export const FarmAPRTooltipItem: React.FC<{ farm: any }> = ({ farm }) => {
  const { t } = useTranslation();
  const farmType = farm.label.split(' ')[0];
  const history = useHistory();

  return (
    <Box>
      <Box className='flex items-center' gridGap={6}>
        {farm.title && (
          <Box
            className={`farmAPRTitleWrapper ${
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
        <Box className='farmAPRTitleWrapper bg-textSecondary'>
          <span className='text-gray32'>{farmType.toUpperCase()}</span>
        </Box>
      </Box>
      <Box mt='8px'>
        <small>{t('totalAPR')}</small>
        <h5 className='text-success'>
          {formatNumber(farm.poolAPR + farm.almAPR)}
          <small> %</small>
        </h5>
      </Box>
      <Box mt='4px'>
        <small>
          {t('poolAPR')}: {formatNumber(farm.poolAPR)}% + {t('rewardsAPR')}:{' '}
          {formatNumber(farm.almAPR)}%
        </small>
      </Box>
      <Box mt={2}>
        <Button
          className='farmAPRGetLPButton'
          onClick={() => {
            let currencyStr = '';
            if (farm.token0) {
              currencyStr += `currency0=${farm.token0.address}`;
            }
            if (farm.token1) {
              if (farm.token0) {
                currencyStr += '&';
              }
              currencyStr += `currency1=${farm.token1.address}`;
            }
            history.push(`/pools?${currencyStr}`);
          }}
        >
          {t('getLP')}
        </Button>
      </Box>
    </Box>
  );
};
