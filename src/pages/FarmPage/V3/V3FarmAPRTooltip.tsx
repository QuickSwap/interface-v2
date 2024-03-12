import React from 'react';
import { CustomTooltip } from 'components';
import { Box } from '@material-ui/core';
import { V3FarmAPRTooltipItem } from './V3FarmAPRTooltipItem';
import { V3FarmPair } from './AllV3Farms';

export const V3FarmAPRTooltip: React.FC<{
  farm: V3FarmPair;
  children: any;
}> = ({ farm, children }) => {
  return (
    <CustomTooltip
      padding='0'
      placement='right'
      title={
        <Box className='farmAPRTooltipWrapper'>
          {farm.farms.map((item, ind) => (
            <V3FarmAPRTooltipItem
              farm={item}
              token0={farm.token0.address}
              token1={farm.token1.address}
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
