import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Box, Typography, Grid, useMediaQuery } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { SwapTokenDetails, ToggleSwitch } from 'components';
import { useIsProMode } from 'state/application/hooks';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { Field } from 'state/swap/actions';
import { getSwapTransactions } from 'utils';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import SwapMain from './SwapMain';
import LiquidityPools from './LiquidityPools';
import SwapProChartTrade from './SwapProChartTrade';
import SwapProInfo from './SwapProInfo';
import SwapProFilter from './SwapProFilter';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  helpWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    border: `1px solid ${palette.secondary.light}`,
    borderRadius: 10,
    '& p': {
      color: palette.text.hint,
    },
    '& svg': {
      marginLeft: 8,
    },
  },
  wrapper: {
    padding: (props: any) => (props.isProMode ? '24px 0' : 24),
    backgroundColor: palette.background.paper,
    borderRadius: (props: any) => (props.isProMode ? 0 : 20),
    [breakpoints.down('xs')]: {
      padding: '16px 12px',
    },
  },
  swapTokenDetails: {
    backgroundColor: palette.background.paper,
    borderRadius: 16,
    width: 'calc(50% - 16px)',
    [breakpoints.down('md')]: {
      width: '100%',
      marginBottom: 16,
    },
    [breakpoints.down('sm')]: {
      width: 'calc(50% - 16px)',
      margin: 0,
    },
    [breakpoints.down('xs')]: {
      width: '100%',
      marginTop: 16,
      marginBottom: 16,
    },
  },
}));

const SwapPage: React.FC = () => {
  const { isProMode, updateIsProMode } = useIsProMode();
  const classes = useStyles({ isProMode });
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const isTablet = useMediaQuery(breakpoints.down('md'));
  const [showChart, setShowChart] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [transactions, setTransactions] = useState<any[] | undefined>(
    undefined,
  );
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [infoPos, setInfoPos] = useState('left');

  const { currencies } = useDerivedSwapInfo();
  const { chainId } = useActiveWeb3React();

  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);

  // this is for refreshing data of trades table every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function getTradesData(token1Address: string, token2Address: string) {
      const transactions = await getSwapTransactions(
        token1Address,
        token2Address,
      );
      setTransactions(transactions);
    }
    if (token1?.address && token2?.address) {
      getTradesData(token1.address, token2.address);
    }
  }, [token1?.address, token2?.address, currentTime]);

  return (
    <Box width='100%' mb={3} id='swap-page'>
      {!isProMode && (
        <Box
          mb={2}
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          width='100%'
        >
          <Typography variant='h4'>Swap</Typography>
          <Box className={classes.helpWrapper}>
            <Typography variant='body2'>Help</Typography>
            <HelpIcon />
          </Box>
        </Box>
      )}
      {!isProMode ? (
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={6} lg={5}>
            <Box className={classes.wrapper}>
              <SwapMain />
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={7}>
            <Box
              display='flex'
              flexWrap='wrap'
              justifyContent='space-between'
              width='100%'
            >
              {token1 && (
                <Box className={classes.swapTokenDetails}>
                  <SwapTokenDetails token={token1} />
                </Box>
              )}
              {token2 && (
                <Box className={classes.swapTokenDetails}>
                  <SwapTokenDetails token={token2} />
                </Box>
              )}
            </Box>
            {token1 && token2 && (
              <Box className={classes.wrapper} marginTop='32px'>
                <LiquidityPools token1={token1} token2={token2} />
              </Box>
            )}
          </Grid>
        </Grid>
      ) : (
        <Box
          borderTop={`1px solid ${palette.divider}`}
          borderBottom={`1px solid ${palette.divider}`}
          bgcolor={palette.background.paper}
          display='flex'
          flexWrap='wrap'
          minHeight='calc(100vh - 140px)'
        >
          <Box
            width={isMobile ? 1 : '450px'}
            padding='20px 0'
            borderRight={isMobile ? 'none' : `1px solid ${palette.divider}`}
          >
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
              padding='0 24px'
              mb={3}
            >
              <Typography variant='h4'>Swap</Typography>
              <Box display='flex' alignItems='center' mr={1}>
                <Typography
                  variant='caption'
                  style={{ color: palette.text.secondary, marginRight: 8 }}
                >
                  PRO MODE
                </Typography>
                <ToggleSwitch
                  toggled={isProMode}
                  onToggle={() => updateIsProMode(!isProMode)}
                />
              </Box>
            </Box>
            <SwapMain />
          </Box>
          <Box
            flex={isMobile ? 'none' : 1}
            display='flex'
            flexDirection='column'
            maxHeight='100vh'
          >
            <SwapProFilter
              infoPos={infoPos}
              setInfoPos={setInfoPos}
              showChart={showChart}
              setShowChart={setShowChart}
              showTrades={showTrades}
              setShowTrades={setShowTrades}
            />
            {token1 && token2 && (
              <SwapProChartTrade
                showChart={showChart}
                showTrades={showTrades}
                token1={token1}
                token2={token2}
                transactions={transactions}
              />
            )}
          </Box>
          <Box
            borderLeft={isMobile ? 'none' : `1px solid ${palette.divider}`}
            borderTop={isTablet ? `1px solid ${palette.divider}` : 'none'}
            width={isTablet ? 1 : 250}
          >
            <SwapProInfo
              token1={token1}
              token2={token2}
              transactions={transactions}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SwapPage;
