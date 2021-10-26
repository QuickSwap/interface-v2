import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  useMediaQuery
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { CurrencyLogo } from 'components';
import { Currency } from '@uniswap/sdk';
import useUSDCPrice from 'utils/useUSDCPrice';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  wrapper: {

  }
}));

const SwapTokenDetails: React.FC<{ currency: Currency | undefined }> = ({ currency }) => {
  const classes = useStyles();
  const usdPrice = useUSDCPrice(currency);

  return (
    <Box>
      <Box display='flex' alignItems='center' px={2} py={1.5}>
        <Box width='28px' height='28px' borderRadius='14px' overflow='hidden'>
          <CurrencyLogo currency={currency} size='28px' />
        </Box>
        <Box>
          <Typography variant='body2'>{ currency?.symbol }</Typography>
          <Typography variant='body2'>${usdPrice?.toSignificant(3)}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SwapTokenDetails;
