import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Typography
} from '@material-ui/core';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { CurrencyLogo } from 'components';
import { Currency, Token } from '@uniswap/sdk';
import useUSDCPrice from 'utils/useUSDCPrice';
import useCopyClipboard from 'hooks/useCopyClipboard'
import { ReactComponent as CopyIcon } from 'assets/images/CopyIcon.svg';
import { shortenAddress } from 'utils';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  wrapper: {

  },
  success: {
    color: '#0fc679'
  },
  danger: {
    color: '#ff5252'
  },
}));

const SwapTokenDetails: React.FC<{ currency: Currency | undefined }> = ({ currency }) => {
  const classes = useStyles();
  const usdPrice = useUSDCPrice(currency);
  const priceUp = false;
  const priceUpPercent = 5.47;
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <Box>
      <Box display='flex' alignItems='center' px={2} py={1.5}>
        <CurrencyLogo currency={currency} size='28px' />
        <Box ml={1}>
          <Typography variant='body2'>{ currency?.symbol }</Typography>
          <Box display='flex' alignItems='center'>
            <Typography variant='body2'>${usdPrice?.toSignificant(3)}</Typography>
            <Box ml={0.5} display='flex' alignItems='center' className={priceUp ? classes.success : classes.danger}>
              {
                priceUp ? <ArrowDropUp /> : <ArrowDropDown />
              }
              <Typography variant='body2'>{ priceUpPercent }%</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box borderTop='1px solid #252833' borderBottom='1px solid #252833' px={2}>
        <Grid container>
          <Grid item xs={6}>
            <Box borderRight='1px solid #252833' py={1}>
              <Typography variant='body2' style={{ color: '#696c80' }}>TVL: 120.32M</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box py={1} pl={2}>
              <Typography variant='body2' style={{ color: '#696c80' }}>24h VOL: 9.47m</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' py={1} px={2}>
        <Typography variant='body2' style={{ color: '#448aff' }}>{ (currency as Token).address ? shortenAddress((currency as Token).address) : '' }</Typography>
        <Box display='flex' style={{ cursor: 'pointer' }} onClick={() => { setCopied((currency as Token).address || '') }}>
          <CopyIcon />
        </Box>
      </Box>
    </Box>
  );
};

export default SwapTokenDetails;
