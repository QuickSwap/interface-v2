import React from 'react';
import { Box } from '@mui/material';
import { formatNumber } from 'utils';
import styles from 'styles/components/FarmingAPRToolTip.module.scss';
import { CustomTooltip } from 'components';

interface FarmingAPRTooltipProps {
  qsAPR: number;
  gammaAPRs: { title: string; apr: number }[];
  children: any;
}

const FarmingAPRTooltip: React.FC<FarmingAPRTooltipProps> = ({
  qsAPR,
  gammaAPRs,
  children,
}) => {
  return (
    <CustomTooltip
      padding='0'
      color='#12131a'
      title={
        <Box className={styles.farmingAPRTooltipWrapper}>
          <Box
            className='flex justify-between'
            margin={gammaAPRs.length > 0 ? '10px 0 0' : '10px 0'}
          >
            <small className='text-secondary'>QuickSwap APR</small>
            <small>{formatNumber(qsAPR)}%</small>
          </Box>
          {gammaAPRs.map((apr, ind) => (
            <Box key={ind} className='flex justify-between' my='10px'>
              <small className='text-secondary'>Gamma {apr.title} APR</small>
              <small>{formatNumber(apr.apr)}%</small>
            </Box>
          ))}
        </Box>
      }
    >
      {children}
    </CustomTooltip>
  );
};

export default FarmingAPRTooltip;
