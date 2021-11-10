import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Typography
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { CurrencyLogo } from 'components';
import { useTopTokens } from 'state/application/hooks';
import { Currency, Token } from '@uniswap/sdk';
import useCopyClipboard from 'hooks/useCopyClipboard'
import { ReactComponent as CopyIcon } from 'assets/images/CopyIcon.svg';
import { shortenAddress, formatCompact } from 'utils';
import { LineChart } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  success: {
    color: '#0fc679'
  },
  danger: {
    color: '#ff5252'
  },
}));

const SwapTokenDetails: React.FC<{ currency: Currency | undefined, priceData: any }> = ({ currency, priceData }) => {
  const classes = useStyles();
  const { topTokens } = useTopTokens();
  const tokenData = useMemo(() => {
    if (topTokens) {
      return topTokens.find((token: any) => currency?.symbol === Token.ETHER.symbol ? token.symbol.toLowerCase() === 'wmatic' : token.id.toLowerCase() === (currency as Token).address.toLowerCase() );
    }
    return null;
  }, [topTokens, currency]);
  const priceUp = Number(tokenData?.priceChangeUSD) > 0;
  const priceUpPercent = Number(tokenData?.priceChangeUSD).toFixed(2);
  const [isCopied, setCopied] = useCopyClipboard();
  const prices = priceData ? priceData.map((price: any) => price.close) : [];

  return (
    <Box>
      <Box display='flex' alignItems='center' justifyContent='space-between' px={2} py={1.5}>
        <Box display='flex' alignItems='center'>
          <CurrencyLogo currency={currency} size='28px' />
          <Box ml={1}>
            <Typography variant='body2'>{ currency?.symbol }</Typography>
            {
              tokenData ?
                <Box display='flex' alignItems='center'>
                  <Typography variant='body2'>${Number(tokenData?.priceUSD).toFixed(Number(tokenData?.priceUSD) > 0.01 ? 2 : 5)}</Typography>
                  <Box ml={0.5} display='flex' alignItems='center' className={priceUp ? classes.success : classes.danger}>
                    {
                      priceUp ? <ArrowDropUp /> : <ArrowDropDown />
                    }
                    <Typography variant='body2'>{ priceUpPercent }%</Typography>
                  </Box>
                </Box>
                :
                <Skeleton variant='rect' width={100} height={20} />
            }
          </Box>
        </Box>
        {
          priceData ?
            <Box width={88} height={47} position='relative'>
              <Box position='absolute' top={-30} width={1}>
                {
                  prices.length > 0 &&
                    <LineChart data={prices} width='100%' height={120} color={priceUp ? '#0fc679' : '#ff5252' } />
                }
              </Box>
            </Box>
            :
            <Skeleton variant='rect' width={88} height={47} />
        }
      </Box>
      <Box borderTop='1px solid #252833' borderBottom='1px solid #252833' px={2}>
        <Grid container>
          <Grid item xs={6}>
            <Box borderRight='1px solid #252833' py={1}>
              {
                tokenData ?
                  <Typography variant='body2' style={{ color: '#696c80' }}>TVL: {formatCompact(tokenData?.totalLiquidityUSD)}</Typography>
                  :
                  <Skeleton variant='rect' width={100} height={16} />
              }
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box py={1} pl={2}>
              {
                tokenData ?
                  <Typography variant='body2' style={{ color: '#696c80' }}>24h VOL: {formatCompact(tokenData?.oneDayVolumeUSD)}</Typography>
                  :
                  <Skeleton variant='rect' width={100} height={16} />
              }
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box display='flex' justifyContent='space-between' alignItems='center' py={1} px={2}>
        {
          tokenData ?
            <a href={`https://polygonscan.com/token/${tokenData.id}`} target='_blank' rel='noreferrer' style={{ textDecoration: 'none' }}>
              <Typography variant='body2' style={{ color: '#448aff' }}>{ tokenData ? shortenAddress(tokenData.id) : '' }</Typography>
            </a>
            :
            <Skeleton variant='rect' width={100} height={16} />
        }
        <Box display='flex' style={{ cursor: 'pointer' }} onClick={() => { setCopied(tokenData?.id) }}>
          <CopyIcon />
        </Box>
      </Box>
    </Box>
  );
};

export default SwapTokenDetails;
