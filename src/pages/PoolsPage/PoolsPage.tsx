import React, { useMemo, useState } from 'react';
import { Pair, Currency } from '@uniswap/sdk';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ReactComponent as HelpIconLarge } from 'assets/images/HelpIcon2.svg';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import NoLiquidity from 'assets/images/NoLiquidityPool.png';
import { AddLiquidity, PoolPositionCard } from 'components';
import { useActiveWeb3React } from 'hooks';
import { usePairs } from 'data/Reserves';
import { toV2LiquidityToken, useTrackedTokenPairs } from 'state/user/hooks';
import { useTokenBalancesWithLoadingIndicator } from 'state/wallet/hooks';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  helpWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    border: '1px solid #252833',
    borderRadius: 10,
    '& p': {
      color: '#636780',
    },
    '& svg': {
      marginLeft: 8
    }
  },
  wrapper: {
    padding: 24,
    backgroundColor: '#1b1e29',
    borderRadius: 20
  },
  headingItem: {
    cursor: 'pointer',
    display: 'flex'
  },
  liquidityText: {
    color: '#696c80',
    '& span': {
      color: '#448aff',
      cursor: 'pointer'
    }
  },
  noLiquidityImage: {
    maxWidth: 286,
    width: '80%',
    filter: 'grayscale(1)' 
  }
}));

const PoolsPage: React.FC = () => {
  const classes = useStyles();
  const { account } = useActiveWeb3React();
  const [ currency0, setCurrency0 ] = useState<Currency | undefined>();
  const [ currency1, setCurrency1 ] = useState<Currency | undefined>()
  const trackedTokenPairs = useTrackedTokenPairs();
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  return (
    <Box width='100%' mb={3}>
      <Box mb={2} display='flex' alignItems='center' justifyContent='space-between' width='100%'>
        <Typography variant='h4'>Pool</Typography>
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>Help</Typography>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item sm={12} md={5}>
          <Box className={classes.wrapper}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Typography variant='body1' style={{ fontWeight: 600 }}>Supply Liquidity</Typography>
              <Box display='flex' alignItems='center'>
                <Box className={classes.headingItem}>
                  <HelpIconLarge />
                </Box>
                <Box className={classes.headingItem}>
                  <SettingsIcon />
                </Box>
              </Box>
            </Box>
            <Box mt={2.5}>
              <AddLiquidity currency0={currency0} currency1={currency1} />
            </Box>
          </Box>
        </Grid>
        <Grid item sm={12} md={7}>
          <Box className={classes.wrapper}>
            <Typography variant='body1' style={{ fontWeight: 600 }}>Your Liquidity Pools</Typography>
            <Box mt={3}>
            {
              v2IsLoading ?
                <Box width={1}>
                  <Skeleton width='100%' height={50} />
                </Box>
              : allV2PairsWithLiquidity.length > 0 ?
                <Box>
                  <Typography variant='body2' className={classes.liquidityText}>Don’t see a pool you joined? <span>Import it</span>.<br/>Unstake your LP Tokens from Farms to see them here.</Typography>
                  {
                    allV2PairsWithLiquidity.map(pair => (
                      <Box mt={2}>
                        <PoolPositionCard
                          key={pair.liquidityToken.address}
                          pair={pair}
                          handleAddLiquidity={(currency0: Currency, currency1: Currency) => {
                            setCurrency0(currency0);
                            setCurrency1(currency1);
                          }} />
                      </Box>
                    ))
                  }
                </Box>
              :
                <Box textAlign='center'>
                  <img src={NoLiquidity} alt='No Liquidity' className={classes.noLiquidityImage} />
                  <Typography variant='body2' className={classes.liquidityText}>Don’t see a pool you joined? <span>Import it</span>.<br/>Unstake your LP Tokens from Farms to see them here.</Typography>
                </Box>
            }
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
