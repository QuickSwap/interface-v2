import React, { useEffect, useMemo } from 'react';
import { Box, Typography } from '@material-ui/core';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import Skeleton from '@material-ui/lab/Skeleton';
import { Token, ChainId } from '@uniswap/sdk';
import { CurrencyLogo } from 'components';
import { getEthPrice, getTopTokens } from 'utils';
import { useTopTokens } from 'state/application/hooks';

interface TopMoversProps {
  background: string;
  hideArrow?: boolean;
}
const TopMovers: React.FC<TopMoversProps> = ({
  background,
  hideArrow = false,
}) => {
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
      border={`1px solid ${
        background === 'transparent' ? '#1b1e29' : 'transparent'
      }`}
      borderRadius={10}
      padding={2.5}
    >
      <Typography variant='h6' style={{ color: '#696c80' }}>
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
              const priceUp = Number(token.priceChangeUSD) > 0;
              const priceDown = Number(token.priceChangeUSD) < 0;
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
                            ? '#0fc679'
                            : priceDown
                            ? '#ff5252'
                            : '#636780',
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
