import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Grid, Divider } from '@material-ui/core';
import { useLairInfo, useSyrupInfo } from 'state/stake/hooks';
import { QUICK } from 'constants/index';
import { CurrencyLogo, SyrupCard, ToggleSwitch } from 'components';
import { useGlobalData } from 'state/application/hooks';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import DragonBg1 from 'assets/images/DragonBg1.svg';
import DragonBg2 from 'assets/images/DragonBg2.svg';
import DragonLairMask from 'assets/images/DragonLairMask.svg';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';

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
  dragonWrapper: {
    backgroundColor: '#1b1e29',
    borderRadius: 20,
    padding: 32,
    position: 'relative',
    overflow: 'hidden'
  },
  dragonBg: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    background: 'rgb(225, 190, 231, 0.1)',
    maxHeight: 207,
    overflow: 'hidden',
    '& img': {
      width: '100%'
    }
  },
  stepWrapper: {
    width: 80,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121319',
    '& span': {
      fontWeight: 'bold',
      color: '#b6b9cc'
    },
  },
  dragonTitle: {
    margin: '24px 0 64px',
    '& h5': {
      marginBottom: 16,
      color: '#c7cad9'
    },
    '& p': {
      maxWidth: 280,
      color: '#c7cad9'
    }
  },
  stakeButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  searchInput: {
    height: 50,
    background: '#121319',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    '& input': {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      marginLeft: 8,
      fontSize: 14,
      fontWeight: 500,
      color: '#c7cad9',
      flex: 1
    }
  }
}));

const DragonPage: React.FC = () => {
  const classes = useStyles();
  const [ isQUICKRate, setIsQUICKRate ] = useState(false);
  const lairInfo = useLairInfo();
  const syrupInfo = useSyrupInfo();
  const { globalData } = useGlobalData();
  const APR =(((Number(lairInfo?.oneDayVol) * 0.04 * 0.01) / Number(lairInfo?.dQuickTotalSupply.toSignificant(6))) * 365) / (Number(lairInfo?.dQUICKtoQUICK.toSignificant()) * Number(lairInfo?.quickPrice));
  const APY = APR ? (Math.pow(1 + APR / 365, 365) - 1).toFixed(4) : 0;
  const [ stakedOnly, setStakeOnly ] = useState(false);
  const [ syrupSearch, setSyrupSearch ] = useState('');

  return (
    <Box width='100%' mb={3}>
      <Box mb={4} display='flex' alignItems='flex-start' justifyContent='space-between' width='100%'>
        <Box>
          <Typography variant='h4'>Dragons Den</Typography>
          <Typography variant='body1'>Stake your QUICK here to earn more!</Typography>
        </Box>
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>Help</Typography>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item sm={12} md={4}>
          <Box className={classes.dragonWrapper}>
            <Box className={classes.dragonBg}>
              <img src={DragonBg2} alt='Dragon Lair' />
            </Box>
            <img src={DragonLairMask} alt='Dragon Mask' style={{ width: '100%', position: 'absolute', top: 207 }} />
            <Box className={classes.stepWrapper}>
              <Typography variant='caption'>STEP 1:</Typography>
            </Box>
            <Box className={classes.dragonTitle}>
              <Typography variant='h5'>Dragons Lair</Typography>
              <Typography variant='body2'>Stake QUICK, Receive dQUICK as receipt representing your share of the pool.</Typography>
            </Box>
            <Box position='relative' zIndex={3}>
              <Box display='flex'>
                <CurrencyLogo currency={QUICK} size='32px' />
                <Box ml={1.5}>
                  <Typography variant='body2' style={{ color: '#ebecf2', lineHeight: 1 }}>QUICK</Typography>
                  <Typography variant='caption' style={{ color: '#636780' }}>Single Stake — Auto compounding</Typography>
                </Box>
              </Box>
              <Box display='flex' justifyContent='space-between' mt={1.5}>
                <Typography variant='body2'>Total QUICK</Typography>
                <Typography variant='body2'>{ lairInfo ? lairInfo.totalQuickBalance.toFixed(2, {groupSeparator: ','}): 0 }</Typography>
              </Box>
              {
                globalData &&
                  <Box display='flex' justifyContent='space-between' mt={1.5}>
                    <Typography variant='body2'>TVL:</Typography>              
                    <Typography variant='body2'>${Number(globalData.totalLiquidityUSD).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
                  </Box>
              }
              <Box display='flex' justifyContent='space-between' mt={1.5}>
                <Typography variant='body2'>APY</Typography>
                <Typography variant='body2' style={{ color: '#0fc679' }}>{ APY }%</Typography>
              </Box>
              <Box display='flex' justifyContent='space-between' mt={1.5}>
                <Typography variant='body2'>Your Deposits</Typography>
                <Typography variant='body2'>{lairInfo.dQUICKBalance.toSignificant(4)}</Typography>
              </Box>
              <Box mt={2.5} width={1} height='40px' display='flex' alignItems='center' justifyContent='center' borderRadius={10} border='1px solid #252833'>
                <CurrencyLogo currency={QUICK} />
                <Typography variant='body2' style={{ margin: '0 8px' }}>{ isQUICKRate ? 1 : lairInfo.dQUICKtoQUICK.toSignificant(4) } QUICK =</Typography>
                <CurrencyLogo currency={QUICK} />
                <Typography variant='body2' style={{ margin: '0 8px' }}>{ isQUICKRate ? lairInfo.QUICKtodQUICK.toSignificant(4) : 1} dQUICK</Typography>
                <PriceExchangeIcon style={{ cursor: 'pointer' }} onClick={() => setIsQUICKRate(!isQUICKRate)} />
              </Box>
              <Box className={classes.stakeButton} bgcolor='#252833'>
                <Typography variant='body2' style={{ color: '#ebecf2' }}>- Unstake QUICK</Typography>
              </Box>
              <Box className={classes.stakeButton} style={{ backgroundImage: 'linear-gradient(279deg, #004ce6, #3d71ff)' }}>
                <Typography variant='body2'>Stake QUICK</Typography>
              </Box>
              <Box mt={3} textAlign='center'>
                <Typography variant='caption' style={{ color: '#696c80', fontWeight: 500 }}>⭐️  When you unstake, the contract will automatically claim QUICK on your behalf.</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item sm={12} md={8}>
          <Box className={classes.dragonWrapper}>
            <Box className={classes.dragonBg}>
              <img src={DragonBg1} alt='Dragon Syrup' />
            </Box>
            <Box className={classes.stepWrapper}>
              <Typography variant='caption'>STEP 2:</Typography>
            </Box>
            <Box className={classes.dragonTitle}>
              <Typography variant='h5'>Dragons Syrup</Typography>
              <Typography variant='body2'>Stake dQUICK, Earn tokens of your choice over time.</Typography>
            </Box>
            <Box display='flex' alignItems='center' mb={3.5}>
              <Box className={classes.searchInput} flex={1}>
                <SearchIcon />
                <input placeholder='Search name, symbol or paste address' value={syrupSearch} onChange={(evt: any) => setSyrupSearch(evt.target.value)} />
              </Box>
              <Box display='flex' alignItems='center' ml={4}>
                <Typography variant='body2' style={{ color: '#626680', marginRight: 8 }}>Staked Only</Typography>
                <ToggleSwitch toggled={stakedOnly} onToggle={() => setStakeOnly(!stakedOnly)} />
              </Box>
            </Box>
            <Divider />
            <Box mt={2.5} display='flex' paddingX={2}>
              <Box width={0.3}>
                <Typography variant='body2'>Earn</Typography>
              </Box>
              <Box width={0.3}>
                <Typography variant='body2'>dQUICK Deposits</Typography>
              </Box>
              <Box width={0.2}>
                <Typography variant='body2'>APR</Typography>
              </Box>
              <Box width={0.2} textAlign='right'>
                <Typography variant='body2'>Earned</Typography>
              </Box>
            </Box>
            {
              syrupInfo && syrupInfo.map(syrup => (
                <SyrupCard syrup={syrup} />
              ))
            }
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DragonPage;
