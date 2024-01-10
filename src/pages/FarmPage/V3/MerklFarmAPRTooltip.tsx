import React from 'react';
import { CustomTooltip } from 'components';
import { Box } from '@material-ui/core';
import { MerklFarmAPRTooltipItem } from './MerklFarmAPRTooltipItem';

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
        <Box className='farmAPRTooltipWrapper'>
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
