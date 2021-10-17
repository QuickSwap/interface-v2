import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
}));

const SwapPage: React.FC = () => {
  const classes = useStyles();

  return (
    <Box display='flex' width='100%'>
      <h1>Swap</h1>
    </Box>
  );
};

export default SwapPage;
