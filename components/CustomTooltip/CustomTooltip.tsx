import React from 'react';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

const CustomTooltip: React.FC<TooltipProps> = (props: TooltipProps) => {
  return <Tooltip arrow {...props} />;
};

export default CustomTooltip;
