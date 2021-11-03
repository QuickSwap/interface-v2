import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Grid, Divider } from '@material-ui/core';
import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons';
import cx from 'classnames';
import { Token } from '@uniswap/sdk';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { DoubleCurrencyLogo, Swap, SwapTokenDetails } from 'components';
import { useEthPrice, useTopTokens, useTokenPairs } from 'state/application/hooks';
import { getEthPrice, getTopTokens, getTokenPairs, getBulkPairData, formatCompact } from 'utils';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { Field } from 'state/swap/actions';

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
  swapItem: {
    width: 100,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    '& p': {
      color: '#696c80'
    }
  },
  activeSwap: {
    background: '#282d3d',
    '& p': {
      color: 'white'
    }
  },
  headingItem: {
    cursor: 'pointer'
  },
  swapTokenDetails: {
    backgroundColor: '#1b1e29',
    borderRadius: 16,
    width: 'calc(50% - 16px)',
    [breakpoints.down('xs')]: {
      width: '100%'
    }
  },
  liquidityMain: {
    '& p': {
      color: '#696c80',
      fontWeight: 600
    }
  },
  liquidityFilter: {
    '& p': {
      cursor: 'pointer',
      marginRight: 20,
      '&.active': {
        color: '#448aff'
      }
    }
  },
  liquidityContent: {
    border: '1px solid #282d3d',
    borderRadius: '10px',
    marginBottom: '20px',
    '& p': {
      color: '#ebecf2'
    }
  }
}));

const SwapPage: React.FC = () => {
  const classes = useStyles();
  const [ swapIndex, setSwapIndex ] = useState(0);
  const { currencies } = useDerivedSwapInfo();

  const { ethPrice, updateEthPrice } = useEthPrice();
  const { updateTopTokens } = useTopTokens();
  const { tokenPairs, updateTokenPairs } = useTokenPairs();
  const [ liquidityPoolClosed, setLiquidityPoolClosed ] = useState(false);
  const [ liquidityFilterIndex, setLiquidityFilterIndex ] = useState(0);

  const token1 = currencies[Field.INPUT];
  const token2 = currencies[Field.OUTPUT];
  const token1Address = token1 === Token.ETHER ? '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270' : (token1 as Token)?.address.toLowerCase();
  const token2Address = token2 === Token.ETHER ? '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270' : (token2 as Token)?.address.toLowerCase();

  const liquidityPairs = tokenPairs ? tokenPairs.filter((pair: any) => {
    if (liquidityFilterIndex === 0) {
      return true;
    } else if (liquidityFilterIndex === 1) {
      return pair.token0.id === token1Address || pair.token1.id === token1Address;
    } else {
      return pair.token0.id === token2Address || pair.token1.id === token2Address;
    }
  }).slice(0, 5) : [];

  useEffect(() => {
    async function fetchEthPrice() {
      const [newPrice, oneDayPrice, priceChange] = await getEthPrice();
      updateEthPrice({ price: newPrice, oneDayPrice, ethPriceChange: priceChange });
    }
    async function fetchTopTokens() {
      const topTokens = await getTopTokens(ethPrice.price, ethPrice.oneDayPrice);
      if (topTokens) {
        updateTopTokens({ data: topTokens });
      }
    }
    if (!ethPrice.price) {
      fetchEthPrice();
    }
    fetchTopTokens();
  }, [ethPrice, updateEthPrice, updateTopTokens, updateTokenPairs])

  useEffect(() => {
    async function fetchTokenPairs() {
      const tokenPairs = await getTokenPairs(token1Address, token2Address);
      const formattedPairs = tokenPairs.map((pair: any) => {
        return pair.id
      })
      const pairData = await getBulkPairData(formattedPairs, ethPrice.price);
      if (pairData) {
        updateTokenPairs({ data: pairData });
      }
    }
    if (ethPrice.price && token1Address && token2Address) {
      fetchTokenPairs();
    }
  }, [ethPrice, token1Address, token2Address, updateTokenPairs])

  return (
    <Box width='100%'>
      <Box mb={2} display='flex' alignItems='center' justifyContent='space-between' width='100%'>
        <Typography variant='h4'>Swap</Typography>
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>Help</Typography>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item sm={12} md={5}>
          <Box className={classes.wrapper}>
            <Box display='flex' justifyContent='space-between'>
              <Box display='flex'>
                <Box className={cx(swapIndex === 0 && classes.activeSwap, classes.swapItem, classes.headingItem)} onClick={() => setSwapIndex(0)}>
                  <Typography variant='body1'>Market</Typography>
                </Box>
                <Box className={cx(swapIndex === 1 && classes.activeSwap, classes.swapItem, classes.headingItem)} onClick={() => setSwapIndex(1)}>
                  <Typography variant='body1'>Limit</Typography>
                </Box>
              </Box>
              <Box className={classes.headingItem}>
                <SettingsIcon />
              </Box>
            </Box>
            <Box mt={2.5}>
              <Swap />
            </Box>
          </Box>
        </Grid>
        <Grid item sm={12} md={7}>
          <Box display='flex' justifyContent='space-between' width='100%'>
            {
              currencies[Field.INPUT] &&
                <Box className={classes.swapTokenDetails}>
                  <SwapTokenDetails currency={currencies[Field.INPUT]} />
                </Box>
            }
            {
              currencies[Field.OUTPUT] &&
                <Box className={classes.swapTokenDetails}>
                  <SwapTokenDetails currency={currencies[Field.OUTPUT]} />
                </Box>
            }
          </Box>
          {
            currencies[Field.INPUT] && currencies[Field.OUTPUT] &&
              <Box className={classes.wrapper} marginTop='32px'>
                <Box display='flex' alignItems='center' justifyContent='space-between' marginBottom='20px'>
                  <Box display='flex' alignItems='center'>
                    <Typography variant='h6' style={{ color: '#ebecf2', marginRight: 8 }}>Liquidity Pools </Typography>
                    <Typography variant='body2' style={{ color: '#696c80' }}>({currencies[Field.INPUT]?.symbol?.toUpperCase()}, {currencies[Field.OUTPUT]?.symbol?.toUpperCase()})</Typography>
                  </Box>
                  <Box display='flex' style={{ cursor: 'pointer', color: '#696c80' }} onClick={() => setLiquidityPoolClosed(!liquidityPoolClosed)}>
                    {
                      liquidityPoolClosed ?
                        <KeyboardArrowDown />
                      :
                        <KeyboardArrowUp />
                    }
                  </Box>
                </Box>
                <Divider />
                <Box width={1}>
                  <Box display='flex' padding={2} className={classes.liquidityMain}>
                    <Box display='flex' width={0.5} className={classes.liquidityFilter}>
                      <Typography variant='body2' className={liquidityFilterIndex === 0 ? 'active' : ''} onClick={() => setLiquidityFilterIndex(0)}>All</Typography>
                      <Typography variant='body2' className={liquidityFilterIndex === 1 ? 'active' : ''} onClick={() => setLiquidityFilterIndex(1)}>{currencies[Field.INPUT]?.symbol?.toUpperCase()}</Typography>
                      <Typography variant='body2' className={liquidityFilterIndex === 2 ? 'active' : ''} onClick={() => setLiquidityFilterIndex(2)}>{currencies[Field.OUTPUT]?.symbol?.toUpperCase()}</Typography>
                    </Box>
                    <Box width={0.2}>
                    <Typography variant='body2' align='left'>TVL</Typography>
                    </Box>
                    <Box width={0.2}>
                    <Typography variant='body2' align='left'>24h Volume</Typography>
                    </Box>
                    <Box width={0.1}>
                    <Typography variant='body2' align='right'>APY</Typography>
                    </Box>
                  </Box>
                  {
                    liquidityPairs.map((pair: any) => {
                      const apy = (Number(pair.oneDayVolumeUSD ? pair.oneDayVolumeUSD : pair.oneDayVolumeUntracked) * 0.003 * 365 * 100) / Number(pair.oneDayVolumeUSD ? pair.trackedReserveUSD : pair.reserveUSD);
                      const liquidity = pair.trackedReserveUSD ? pair.trackedReserveUSD : pair.reserveUSD;
                      const volume = pair.oneDayVolumeUSD ? pair.oneDayVolumeUSD : pair.oneDayVolumeUntracked;
                      return (
                        <Box display='flex' className={cx(classes.liquidityContent, classes.liquidityMain)} padding={2}>
                          <Box display='flex' alignItems='center' width={0.5}>
                            <DoubleCurrencyLogo currency0={currencies[Field.INPUT]} currency1={currencies[Field.OUTPUT]} size={28} />
                            <Typography variant='body2' style={{ marginLeft: 12 }}>{pair.token0.symbol.toUpperCase()} / {pair.token1.symbol.toUpperCase()}</Typography>
                          </Box>
                          <Box width={0.2}>
                            <Typography variant='body2'>${ formatCompact(liquidity) }</Typography>
                          </Box>
                          <Box width={0.2}>
                            <Typography variant='body2'>${ formatCompact(volume) }</Typography>
                          </Box>
                          <Box width={0.1}>
                            <Typography variant='body2' align='right' style={{ color: '#0fc679' }}>{apy.toFixed(2)}%</Typography>
                          </Box>
                        </Box>    
                      )
                    })
                  }
                </Box>
              </Box>
          }
        </Grid>
      </Grid>
    </Box>
  );
};

export default SwapPage;
