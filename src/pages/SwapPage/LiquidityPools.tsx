import React, { useEffect, useMemo, useState } from 'react';
import { Box, Divider, Typography, useMediaQuery } from '@material-ui/core';
import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { getTokenPairs, getBulkPairData, getEthPrice } from 'utils';
import { Token } from '@uniswap/sdk';
import LiquidityPoolRow from './LiquidityPoolRow';
import { useAllTokens } from 'hooks/Tokens';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(({ palette }) => ({
  liquidityMain: {
    '& p': {
      color: palette.text.secondary,
      fontWeight: 600,
    },
  },
  liquidityFilter: {
    '& p': {
      cursor: 'pointer',
      marginRight: 20,
      '&.active': {
        color: palette.primary.main,
      },
    },
  },
}));

const LiquidityPools: React.FC<{
  token1: Token;
  token2: Token;
}> = ({ token1, token2 }) => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [liquidityPoolClosed, setLiquidityPoolClosed] = useState(false);
  const [liquidityFilterIndex, setLiquidityFilterIndex] = useState(0);
  const [tokenPairs, updateTokenPairs] = useState<any[] | null>(null);
  const token1Address = token1.address.toLowerCase();
  const token2Address = token2.address.toLowerCase();
  const allTokenList = useAllTokens();
  const { t } = useTranslation();

  const liquidityPairs = useMemo(
    () =>
      tokenPairs
        ? tokenPairs
            .filter((pair: any) => {
              if (liquidityFilterIndex === 0) {
                return true;
              } else if (liquidityFilterIndex === 1) {
                return (
                  pair.token0.id === token1Address ||
                  pair.token1.id === token1Address
                );
              } else {
                return (
                  pair.token0.id === token2Address ||
                  pair.token1.id === token2Address
                );
              }
            })
            .slice(0, 5)
        : [],
    [tokenPairs, liquidityFilterIndex, token1Address, token2Address],
  );

  const whiteListAddressList = useMemo(
    () => Object.keys(allTokenList).map((item) => item.toLowerCase()),
    [allTokenList],
  );

  useEffect(() => {
    async function fetchTokenPairs() {
      const [newPrice] = await getEthPrice();
      const tokenPairs = await getTokenPairs(token1Address, token2Address);

      const formattedPairs = tokenPairs
        ? tokenPairs
            .filter((pair: any) => {
              return (
                whiteListAddressList.includes(pair?.token0?.id) &&
                whiteListAddressList.includes(pair?.token1?.id)
              );
            })
            .map((pair: any) => {
              return pair.id;
            })
        : [];

      const pairData = await getBulkPairData(formattedPairs, newPrice);

      if (pairData) {
        updateTokenPairs(pairData);
      }
    }
    fetchTokenPairs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token1Address, token2Address, whiteListAddressList]);

  return (
    <>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        marginBottom={liquidityPoolClosed ? 0 : '20px'}
      >
        <Box display='flex' alignItems='center'>
          <Typography
            variant='h6'
            style={{ color: palette.text.primary, marginRight: 8 }}
          >
            {t('liquidityPools')}
          </Typography>
          <Typography variant='body2' style={{ color: palette.text.secondary }}>
            ({token1.symbol?.toUpperCase()}, {token2.symbol?.toUpperCase()})
          </Typography>
        </Box>
        <Box
          display='flex'
          style={{ cursor: 'pointer', color: palette.text.secondary }}
          onClick={() => setLiquidityPoolClosed(!liquidityPoolClosed)}
        >
          {liquidityPoolClosed ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
        </Box>
      </Box>
      {!liquidityPoolClosed && (
        <>
          <Divider />
          <Box width={1}>
            <Box display='flex' padding={2} className={classes.liquidityMain}>
              <Box
                display='flex'
                width={0.5}
                className={classes.liquidityFilter}
              >
                <Typography
                  variant='body2'
                  className={liquidityFilterIndex === 0 ? 'active' : ''}
                  onClick={() => setLiquidityFilterIndex(0)}
                >
                  {t('all')}
                </Typography>
                <Typography
                  variant='body2'
                  className={liquidityFilterIndex === 1 ? 'active' : ''}
                  onClick={() => setLiquidityFilterIndex(1)}
                >
                  {token1.symbol?.toUpperCase()}
                </Typography>
                <Typography
                  variant='body2'
                  className={liquidityFilterIndex === 2 ? 'active' : ''}
                  onClick={() => setLiquidityFilterIndex(2)}
                >
                  {token2.symbol?.toUpperCase()}
                </Typography>
              </Box>
              {!isMobile && (
                <>
                  <Box width={0.2}>
                    <Typography variant='body2' align='left'>
                      {t('tvl')}
                    </Typography>
                  </Box>
                  <Box width={0.15}>
                    <Typography variant='body2' align='left'>
                      {t('24hVol')}
                    </Typography>
                  </Box>
                  <Box width={0.15}>
                    <Typography variant='body2' align='right'>
                      {t('apy')}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            {liquidityPairs.map((pair: any, ind: any) => (
              <LiquidityPoolRow pair={pair} key={ind} />
            ))}
          </Box>
        </>
      )}
    </>
  );
};

export default LiquidityPools;
