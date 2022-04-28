<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  Grid,
  Divider,
  useMediaQuery,
} from '@material-ui/core';
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  LocalGasStation,
} from '@material-ui/icons';
import cx from 'classnames';
import { Currency, Token } from '@uniswap/sdk';
import {
  GelatoLimitOrderPanel,
  GelatoLimitOrdersHistoryPanel,
} from '@gelatonetwork/limit-orders-react';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import {
  DoubleCurrencyLogo,
  Swap,
  SwapTokenDetails,
  SettingsModal,
  ToggleSwitch,
  CustomTooltip,
} from 'components';
import {
  useEthPrice,
  useTopTokens,
  useTokenPairs,
  useBlockNumber,
  useSwapTokenPrice0,
  useSwapTokenPrice1,
} from 'state/application/hooks';
import {
  getEthPrice,
  getTopTokens,
  getTokenPairs,
  getBulkPairData,
  getIntervalTokenData,
  formatCompact,
} from 'utils';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { Field } from 'state/swap/actions';
import { useAllTokens } from 'hooks/Tokens';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useCurrency } from 'hooks/Tokens';
import dayjs from 'dayjs';
import { useGasPrice } from 'context/GasPrice';
import ToggleWithGasPrice from 'components/Biconomy/ToggleWithGasPrice';
import { useBiconomy } from 'context/Biconomy';
=======
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Grid } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { SwapTokenDetails } from 'components';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { Field } from 'state/swap/actions';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import SwapMain from './SwapMain';
import LiquidityPools from './LiquidityPools';
>>>>>>> dev

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
    padding: 24,
    backgroundColor: palette.background.paper,
    borderRadius: 20,
    [breakpoints.down('xs')]: {
      padding: '16px 12px',
    },
  },
  swapTokenDetails: {
    backgroundColor: palette.background.paper,
    borderRadius: 16,
    width: 'calc(50% - 16px)',
    [breakpoints.down('xs')]: {
      width: '100%',
      marginTop: 16,
      marginBottom: 16,
    },
  },
}));

const SwapPage: React.FC = () => {
  const classes = useStyles();

  const { currencies } = useDerivedSwapInfo();
  const { chainId } = useActiveWeb3React();

  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);

  return (
    <Box width='100%' mb={3} id='swap-page'>
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
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className={classes.wrapper}>
<<<<<<< HEAD
            <Box display='flex' justifyContent='space-between'>
              <Box display='flex'>
                <Box
                  className={cx(
                    swapIndex === 0 && classes.activeSwap,
                    classes.swapItem,
                    classes.headingItem,
                  )}
                  onClick={() => setSwapIndex(0)}
                >
                  <Typography variant='body1'>Market</Typography>
                </Box>
                <Box
                  className={cx(
                    swapIndex === 1 && classes.activeSwap,
                    classes.swapItem,
                    classes.headingItem,
                  )}
                  onClick={() => setSwapIndex(1)}
                >
                  <Typography variant='body1'>Limit</Typography>
                </Box>
              </Box>
              <Box display={'flex'} alignItems='center'>
                <ToggleWithGasPrice token={token1} />
                <Box className={classes.headingItem}>
                  <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
                </Box>
              </Box>
            </Box>
            <Box mt={2.5}>
              {swapIndex === 0 && (
                <Swap currency0={currency0} currency1={currency1} />
              )}
              {swapIndex === 1 && (
                <>
                  <GelatoLimitOrderPanel />
                  <GelatoLimitOrdersHistoryPanel />
                  <Box mt={2} textAlign='center'>
                    <Typography variant='body2'>
                      <b>* Disclaimer:</b> Limit Orders on QuickSwap are
                      provided by Gelato, a 3rd party protocol and should be
                      considered in beta. DYOR and use at your own risk.
                      QuickSwap is not responsible. More info can be found&nbsp;
                      <a
                        style={{ color: palette.text.primary }}
                        target='_blank'
                        rel='noopener noreferrer'
                        href='https://www.certik.org/projects/gelato'
                      >
                        here.
                      </a>
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
=======
            <SwapMain />
>>>>>>> dev
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
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
    </Box>
  );
};

export default SwapPage;
