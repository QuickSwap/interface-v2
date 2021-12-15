import React, { useEffect, useMemo } from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import Skeleton from '@material-ui/lab/Skeleton';
import { Token, ChainId } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import { CurrencyLogo } from 'components';
import { getEthPrice, getTopTokens } from 'utils';
import { useTopTokens } from 'state/application/hooks';

const useStyles = makeStyles(({ breakpoints }) => ({
  content: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    [breakpoints.down('sm')]: {
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
    },
    [breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
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
  const { topTokens, updateTopTokens } = useTopTokens();
  const smallWindowSize = useMediaQuery(breakpoints.down('xs'));

  const topMoverTokens = useMemo(
    () => (topTokens && topTokens.length >= 5 ? topTokens.slice(0, 5) : null),
    [topTokens],
  );

  useEffect(() => {
    async function checkEthPrice() {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const topTokensData = await getTopTokens(newPrice, oneDayPrice, 5);
      if (topTokensData) {
        updateTopTokens(topTokensData);
      }
    }
    if (!topTokens || topTokens.length < 5) {
      checkEthPrice();
    }
  }, [updateTopTokens, topTokens]);

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
      padding={2.5}
    >
      <Typography variant='h6' style={{ color: palette.text.secondary }}>
        24h TOP MOVERS
      </Typography>
      <Box width={1}>
        {topMoverTokens ? (
          <Box className={classes.content}>
            {topMoverTokens.map((token: any, index: number) => {
              const currency = new Token(
                ChainId.MATIC,
                getAddress(token.id),
                token.decimals,
              );
              const priceUp = Number(token.priceChangeUSD) > 0;
              const priceDown = Number(token.priceChangeUSD) < 0;
              const priceUpPercent = Number(token.priceChangeUSD).toFixed(2);
              return (
                <Box
                  mr={!smallWindowSize && index < topMoverTokens.length ? 2 : 0}
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
                          !hideArrow
                            ? 'transparent'
                            : priceUp
                            ? 'rgba(15, 198, 121, 0.1)'
                            : priceDown
                            ? 'rgba(255, 82, 82, 0.1)'
                            : 'rgba(99, 103, 128, 0.1)'
                        }
                        style={{
                          color: priceUp
                            ? palette.success.main
                            : priceDown
                            ? palette.error.main
                            : palette.text.hint,
                        }}
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
