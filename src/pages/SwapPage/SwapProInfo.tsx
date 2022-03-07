import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  Grid,
  useMediaQuery,
  Checkbox,
} from '@material-ui/core';

const useStyles = makeStyles(({ palette, breakpoints }) => ({}));

const SwapProInfo: React.FC = () => {
  const classes = useStyles();

  return (
    <Box p={1}>
      <Typography variant='body1'>Info:</Typography>
    </Box>
  );
};

export default SwapProInfo;
