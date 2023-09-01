import React from 'react';
import { Box } from '@mui/material';
import { formatNumber } from 'utils';
import { useTranslation } from 'next-i18next';
import styles from 'styles/components/TotalAPRToolTip.module.scss';
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
      color='#12131a'
      title={
        <Box className={styles.totalAPRTooltipWrapper}>
          <Box
            className='flex items-center justify-between bg-grey29'
            height='40px'
          >
            <small>{t('totalAPR')}</small>
            <small className='text-sucess'>
              {formatNumber(poolAPR + farmAPR)}%
            </small>
          </Box>
          <Box className='flex justify-between' mt='16px'>
            <small className='text-secondary'>
              {poolAPRText ?? t('poolAPR')}
            </small>
            <small>{formatNumber(poolAPR)}%</small>
          </Box>
          <Box className='flex justify-between' my='10px'>
            <small className='text-secondary'>
              {farmAPRText ?? t('farmAPR')}
            </small>
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
