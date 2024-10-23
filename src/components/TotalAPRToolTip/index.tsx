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
  poolAPRText?: string;
  farmAPRText?: string;
}

const TotalAPRTooltip: React.FC<TotalAPRToolTipProps> = ({
  poolAPR,
  farmAPR,
  children,
  poolAPRText,
  farmAPRText,
}) => {
  const { t } = useTranslation();
  return (
    <CustomTooltip
      padding='0'
      placement='top'
      color='#1b1e29'
      title={
        <Box className='totalAPRTooltipWrapper'>
          <Box>
            <small>{poolAPRText ?? t('poolAPR')}</small>
            <small>{formatNumber(poolAPR)}%</small>
          </Box>
          <Box my='10px'>
            <small>{farmAPRText ?? t('farmAPR')}</small>
            <small>{formatNumber(farmAPR)}%</small>
          </Box>
          <Box pt='10px'>
            <small>{t('totalAPR')}</small>
            <small className='text-success'>
              {formatNumber(poolAPR + farmAPR)}%
            </small>
          </Box>
        </Box>
      }
    >
      {children}
    </CustomTooltip>
  );
};

export default TotalAPRTooltip;
