import React from 'react';
import { Box, Typography } from '@material-ui/core';

interface SortButtonProps {
  toggleSortOrder: () => void;
  ascending: boolean;
}

const SortButton: React.FC<SortButtonProps> = ({
  toggleSortOrder,
  ascending,
}) => {
  return (
    <Box className='filterWrapper' onClick={toggleSortOrder}>
      <Typography>{ascending ? '↑' : '↓'}</Typography>
    </Box>
  );
};

export default SortButton;
