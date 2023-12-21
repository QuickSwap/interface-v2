import React from 'react';
import { CustomTooltip } from 'components';
import { Box } from '@material-ui/core';
import { FarmAPRTooltipItem } from './FarmAPRTooltipItem';

export const FarmAPRTooltip: React.FC<{ farms: any[]; children: any }> = ({
  farms,
  children,
}) => {
  return (
    <CustomTooltip
      padding='0'
      placement='right'
      color='#1b1e29'
      title={
        <Box className='farmAPRTooltipWrapper'>
          {farms.map((farm, ind) => (
            <FarmAPRTooltipItem farm={farm} key={ind} />
          ))}
        </Box>
      }
    >
      {children}
    </CustomTooltip>
  );
};
