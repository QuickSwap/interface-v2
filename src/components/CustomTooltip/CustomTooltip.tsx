import React from 'react';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Box } from '@material-ui/core';

interface CustomTooltipProps extends TooltipProps {
  padding?: string | number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  padding = '14px',
  title,
  ...props
}) => (
  <Tooltip
    {...props}
    arrow
    interactive
    title={<Box padding={padding}>{title}</Box>}
  />
);

export default CustomTooltip;
