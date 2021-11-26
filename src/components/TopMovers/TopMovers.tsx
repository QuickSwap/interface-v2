import React, { useEffect, useMemo } from 'react';
import { Box, Typography } from '@material-ui/core';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import Skeleton from '@material-ui/lab/Skeleton';
import { Token, ChainId } from '@uniswap/sdk';
import { CurrencyLogo } from 'components';
import { getEthPrice, getTopTokens } from 'utils';
import { useTopTokens } from 'state/application/hooks';

const TopMovers: React.FC<{ background: string }> = ({ background }) => {
  const { topTokens, updateTopTokens } = useTopTokens();

  const topMoverTokens = useMemo(
    () => (topTokens && topTokens.length > 5 ? topTokens.slice(0, 5) : null),
    [topTokens],
  );

  useEffect(() => {
    async function checkEthPrice() {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const topTokensData = await getTopTokens(newPrice, oneDayPrice, 20);
      if (topTokensData) {
        updateTopTokens({ data: topTokensData });
      }
    }
    checkEthPrice();
  }, [updateTopTokens, topTokens]);

  return (
    <Box
      width='100%'
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='flex-start'
      bgcolor={background}
      border={`1px solid ${background === 'transparent' ? '#1b1e29' : 'transparent'}`}
      borderRadius={10}
      padding={2.5}
    >
      <Typography style={{ color: '#696c80', fontSize: '12px' }}>
        24h TOP MOVERS
      </Typography>
      <Box mt={2} width={1}>
        {topMoverTokens ? (
          <Box
            width='100%'
            display='flex'
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
          >
            {topMoverTokens.map((token: any) => {
              const currency = new Token(
                ChainId.MATIC,
                token.id,
                token.decimals,
              );
              const priceUp = Number(token.priceChangeUSD) >= 0;
              const priceUpPercent = Number(token.priceChangeUSD).toFixed(2);
              return (
                <Box
                  key={token.id}
                  display='flex'
                  flexDirection='row'
                  justifyContent='center'
                  alignItems='center'
                >
                  <CurrencyLogo currency={currency} size='28px' />
                  <Box ml={1}>
                    <Typography variant='body2'>{token.symbol}</Typography>
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
                        display='flex'
                        flexDirection='row'
                        justifyContent='center'
                        alignItems='center'
                        style={{ color: priceUp ? '#0fc679' : '#ff5252' }}
                      >
                        {priceUp ? <ArrowDropUp /> : <ArrowDropDown />}
                        <Typography variant='body2'>
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
