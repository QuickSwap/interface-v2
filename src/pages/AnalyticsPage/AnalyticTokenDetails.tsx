import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { ChainId, Token } from '@uniswap/sdk';
import cx from 'classnames';
import { shortenAddress } from 'utils';
import { CurrencyLogo } from 'components';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';

const useStyles = makeStyles(({}) => ({
  panel: {
    background: '#1b1d26',
    borderRadius: 20,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    color: '#636780',
    marginBottom: 50,
    '& svg': {
      width: 12,
      margin: '0 6px',
    },
  },
  link: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ebecf2',
    lineHeight: 1,
  },
  heading2: {
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 600,
    color: '#636780',
    marginLeft: 6,
  },
  priceChangeWrapper: {
    height: 25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: '0 8px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    height: 40,
    padding: '0 28px',
    borderRadius: 10,
    color: '#ebecf2',
  },
  filledButton: {
    background: 'linear-gradient(279deg, rgb(0, 76, 230), rgb(61, 113, 255))',
  },
}));

const AnalyticsTokenDetails: React.FC<{ token: any }> = ({ token }) => {
  const classes = useStyles();
  const currency = new Token(ChainId.MATIC, token.id, token.decimals);

  return (
    <>
      <Box className={classes.breadcrumb}>
        <Typography variant='caption' className={classes.link}>
          Analytics
        </Typography>
        <ArrowForwardIos />
        <Typography variant='caption' className={classes.link}>
          Tokens
        </Typography>
        <ArrowForwardIos />
        <Typography variant='caption'>
          <span style={{ color: '#b6b9cc' }}>{token.symbol}</span> (
          {shortenAddress(token.id)})
        </Typography>
      </Box>
      <Box display='flex' justifyContent='space-between'>
        <Box display='flex'>
          <CurrencyLogo currency={currency} size='32px' />
          <Box ml={1.5}>
            <Box display='flex' alignItems='center'>
              <Box display='flex' alignItems='flex-end' mr={0.5}>
                <Typography className={classes.heading1}>
                  {token.name}{' '}
                </Typography>
                <Typography className={classes.heading2}>
                  ({token.symbol})
                </Typography>
              </Box>
              <StarChecked />
            </Box>
            <Box mt={1.25} display='flex' alignItems='center'>
              <Typography variant='h5' style={{ color: '#ebecf2' }}>
                ${Number(token.priceUSD).toLocaleString()}
              </Typography>
              <Box
                className={classes.priceChangeWrapper}
                ml={2}
                bgcolor={
                  Number(token.priceChangeUSD) > 0
                    ? 'rgba(15, 198, 121, 0.1)'
                    : Number(token.priceChangeUSD) < 0
                    ? 'rgba(255, 82, 82, 0.1)'
                    : 'rgba(99, 103, 128, 0.1)'
                }
                color={
                  Number(token.priceChangeUSD) > 0
                    ? 'rgb(15, 198, 121)'
                    : Number(token.priceChangeUSD) < 0
                    ? 'rgb(255, 82, 82)'
                    : 'rgb(99, 103, 128)'
                }
              >
                <Typography variant='body2'>
                  {Number(token.priceChangeUSD) < 0.001 &&
                  Number(token.priceChangeUSD) > 0
                    ? '<0.001'
                    : Number(token.priceChangeUSD) > -0.001 &&
                      Number(token.priceChangeUSD) < 0
                    ? '>-0.001'
                    : (Number(token.priceChangeUSD) > 0 ? '+' : '') +
                      Number(token.priceChangeUSD).toLocaleString()}
                  %
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box display='flex'>
          <Box className={classes.button} mr={1.5} border='1px solid #448aff'>
            <Typography variant='body2'>Add Liquidity</Typography>
          </Box>
          <Box className={cx(classes.button, classes.filledButton)}>
            <Typography variant='body2'>Swap</Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AnalyticsTokenDetails;
