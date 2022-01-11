import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import Skeleton from '@material-ui/lab/Skeleton';
import { Token, ChainId } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import { CurrencyLogo } from 'components';
import { getEthPrice, getTopTokens, getPriceColor } from 'utils';

const useStyles = makeStyles(() => ({
  content: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

interface TopMoversProps {
  background: string;
  hideArrow?: boolean;
}
const TopMovers: React.FC<TopMoversProps> = ({
  background,
  hideArrow = false,
}) => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const smallWindowSize = useMediaQuery(breakpoints.down('xs'));

  const topMoverTokens = useMemo(
    () => (topTokens && topTokens.length >= 5 ? topTokens.slice(0, 5) : null),
    [topTokens],
  );

  useEffect(() => {
    async function fetchTopTokens() {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const topTokensData = await getTopTokens(newPrice, oneDayPrice, 5);
      if (topTokensData) {
        updateTopTokens(topTokensData);
      }
    }
    fetchTopTokens();
  }, [updateTopTokens]);

  return (
    <Box
      width='100%'
      display='flex'
      flexWrap='wrap'
      flexDirection='column'
      justifyContent='center'
      alignItems={smallWindowSize ? 'center' : 'flex-start'}
      bgcolor={background}
      border={`1px solid ${
        background === 'transparent' ? palette.background.paper : 'transparent'
      }`}
      borderRadius={10}
      px={2.5}
      pt={2.5}
      pb={0.5}
    >
      <Typography variant='h6' style={{ color: palette.text.secondary }}>
        24h TOP MOVERS
      </Typography>
      <Box width={1} pb={2} style={{ overflowX: 'auto' }}>
        {topMoverTokens ? (
          <Box className={classes.content}>
            {topMoverTokens.map((token: any, index: number) => {
              const currency = new Token(
                ChainId.MATIC,
                getAddress(token.id),
                token.decimals,
              );
              const priceColor = getPriceColor(
                Number(token.priceChangeUSD),
                palette,
              );
              const priceUp = Number(token.priceChangeUSD) > 0;
              const priceDown = Number(token.priceChangeUSD) < 0;
              const priceUpPercent = Number(token.priceChangeUSD).toFixed(2);
              return (
                <Box
                  mr={index < topMoverTokens.length ? 2 : 0}
                  width={smallWindowSize ? 180 : 'unset'}
                  mt={2}
                  key={token.id}
                  display='flex'
                  flexDirection='row'
                  justifyContent={smallWindowSize ? 'flex-start' : 'center'}
                  alignItems='center'
                >
                  <CurrencyLogo currency={currency} size='28px' />
                  <Box ml={1}>
                    <Typography variant='body2' style={{ fontWeight: 'bold' }}>
                      {token.symbol}
                    </Typography>
                    <Box
                      display='flex'
                      flexDirection='row'
                      justifyContent='center'
                      alignItems='center'
                    >
                      <Typography variant='body2'>
                        ${Number(token.priceUSD).toFixed(2)}
                      </Typography>
                      <Box
                        ml={hideArrow ? 1 : 0}
                        display='flex'
                        flexDirection='row'
                        justifyContent='center'
                        alignItems='center'
                        px={0.75}
                        py={0.25}
                        borderRadius={12}
                        bgcolor={
                          !hideArrow ? 'transparent' : priceColor.bgColor
                        }
                        color={priceColor.textColor}
                      >
                        {!hideArrow && priceUp && <ArrowDropUp />}
                        {!hideArrow && priceDown && <ArrowDropDown />}
                        <Typography variant='caption'>
                          {hideArrow && priceUp ? '+' : ''}
                          {priceUpPercent}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Skeleton variant='rect' width='100%' height={100} />
        )}
      </Box>
    </Box>
  );
};

export default TopMovers;
