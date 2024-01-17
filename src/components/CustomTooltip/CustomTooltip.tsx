import React from 'react';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';
import { Box } from '@mui/material';

interface CustomTooltipProps extends TooltipProps {
  padding?: string | number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  padding = '14px',
  title,
  ...props
}) => <Tooltip {...props} arrow title={<Box padding={padding}>{title}</Box>} />;

export default CustomTooltip;
