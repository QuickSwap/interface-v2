import React from 'react';
import { V3Farm } from './Farms';
import { CustomTooltip } from 'components';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formatNumber } from 'utils';
import { useHistory } from 'react-router-dom';

export const FarmAPRTooltip: React.FC<{ farms: V3Farm[]; children: any }> = ({
  farms,
  children,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  return (
    <CustomTooltip
      padding='0'
      placement='right'
      color='#1b1e29'
      title={
        <Box className='farmAPRTooltipWrapper'>
          {farms.map((farm, ind) => (
            <Box key={ind}>
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
                  {t('poolAPR')}: {formatNumber(farm.poolAPR)}% +{' '}
                  {t('rewardsAPR')}: {formatNumber(farm.farmAPR)}%
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
          ))}
        </Box>
      }
    >
      {children}
    </CustomTooltip>
  );
};
