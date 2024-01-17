import React from 'react';
import { CustomTooltip } from 'components';
import { Box } from '@mui/material';
import { MerklFarmAPRTooltipItem } from './MerklFarmAPRTooltipItem';
import styles from 'styles/pages/Farm.module.scss';

export const MerklFarmAPRTooltip: React.FC<{
  farms: any[];
  token0?: string;
  token1?: string;
  children: any;
}> = ({ farms, token0, token1, children }) => {
  return (
    <CustomTooltip
      padding='0'
      placement='right'
      title={
        <Box className={styles.farmAPRTooltipWrapper}>
          {farms.map((farm, ind) => (
            <MerklFarmAPRTooltipItem
              farm={farm}
              token0={token0}
              token1={token1}
              key={ind}
            />
          ))}
        </Box>
      }
    >
      {children}
    </CustomTooltip>
  );
};
