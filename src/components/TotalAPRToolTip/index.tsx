import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { formatNumber } from 'utils';
import { useTranslation } from 'react-i18next';
import 'components/styles/TotalAPRToolTip.scss';
import { CustomTooltip } from 'components';

interface TotalAPRToolTipProps {
  poolAPR: number;
  farmAPR: number;
  children: any;
}

const TotalAPRTooltip: React.FC<TotalAPRToolTipProps> = ({
  poolAPR,
  farmAPR,
  children,
}) => {
  const { t } = useTranslation();
  return (
    <CustomTooltip
      padding='0'
      placement='top'
      color='#12131a'
      title={
        <Box className='totalAPRTooltipWrapper'>
          <Box
            className='flex justify-between items-center bg-grey29'
            height='40px'
          >
            <small>{t('totalAPR')}</small>
            <small className='text-sucess'>
              {formatNumber(poolAPR + farmAPR)}%
            </small>
          </Box>
          <Box className='flex justify-between' mt='16px'>
            <small className='text-secondary'>{t('poolAPR')}</small>
            <small>{formatNumber(poolAPR)}%</small>
          </Box>
          <Box className='flex justify-between' my='10px'>
            <small className='text-secondary'>{t('farmAPR')}</small>
            <small>{formatNumber(farmAPR)}%</small>
          </Box>
        </Box>
      }
    >
      {children}
    </CustomTooltip>
  );
};

export default TotalAPRTooltip;
