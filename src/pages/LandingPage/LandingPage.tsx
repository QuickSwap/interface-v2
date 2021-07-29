import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  ButtonGroup,
  Typography,
  Button,
  Box,
  Grid,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import HeroBkg from 'assets/images/heroBkg.svg';
import Motif from 'assets/images/Motif.svg';
import { ReactComponent as PolygonSwapIcon } from 'assets/images/Currency/PolygonSwap.svg';
import { ReactComponent as QuickIcon } from 'assets/images/quickIcon.svg';
import { ReactComponent as SwapIcon2 } from 'assets/images/SwapIcon2.svg';
import { ReactComponent as SwapChangeIcon } from 'assets/images/SwapChangeIcon.svg';
import FiatMask from 'assets/images/FiatMask.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  landingPage: {
    '& h3': {
      color: palette.success.dark,
      fontSize: 26,
      fontWeight: 'bold'
    },
    '& p': {
      fontSize: 18,
      lineHeight: '32px',
      color: palette.text.primary
    }
  },
  heroBkg: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    width: '100%',
    '& img': {
      width: '100%'
    }
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '135px 0 120px',
    position: 'relative',
    zIndex: 2,
    '& h3': {
      color: 'white',
      fontSize: 16,
      textTransform: 'uppercase',
      fontWeight: 'bold',
      lineHeight: '18px',
    },
    '& h1': {
      fontSize: 64,
      fontWeight: 'bold',
      color: palette.primary.main,
      lineHeight: '72px',
      margin: '20px 0',
    },
    '& > p': {
      fontSize: 18,
      lineHeight: '20px',
      marginBottom: 50
    },
    '& > button': {
      height: 56,
      width: 194,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  tradingInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: '0 96px',
    position: 'relative',
    zIndex: 2,
    '& div': {
      background: palette.background.default,
      width: 288,
      height: 133,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      '& p': {
        fontSize: 13,
        lineHeight: '14px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      },
      '& h1': {
        fontSize: 40,
        fontWeight: 'bold',
        lineHeight: '45px',
        marginTop: 24
      }
    }
  },
  quickInfo: {
    textAlign: 'center',
    margin: '128px 0 60px',
    '& h2': {
      fontSize: 26,
      lineHeight: '42px',
      marginBottom: 60
    }
  },
  swapContainer: {
    textAlign: 'center',
    padding: 20,
    maxWidth: 1024,
    margin: 'auto',
    '& .MuiButtonGroup-root': {
      marginBottom: 50,
      '& button': {
        width: 180,
        height: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        border: `1px solid ${palette.primary.dark}`,
        color: 'white',
        '&.active': {
          background: '#FFFFFFDE',
          border: `1px solid transparent`,
          color: palette.background.default
        },
        '&:first-child': {
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
        },
        '&:last-child': {
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        }
      }
    }
  },
  swapBox: {
    padding: 24,
    borderRadius: 20,
    border: `1px solid ${palette.primary.dark}`,
    zIndex: 1,
    position: 'relative',
    textAlign: 'left',
    '& > p': {
      fontSize: 14,
      marginBottom: 16,
    },
    '& > div': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      '& button': {
        height: 40,
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        borderRadius: 20,
        background: palette.primary.dark,
        '& svg:first-child': {
          width: 28,
          height: 28,
          marginRight: 8
        },
        '& p': {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      '& input': {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        outline: 'none',
        textAlign: 'right',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold'
      }
    }
  },
  exchangeSwap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    background: palette.background.default,
    border: `2px solid ${palette.primary.dark}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '-20px auto',
    zIndex: 2,
    position: 'relative'
  },
  swapInfo: {
    textAlign: 'left',
    marginBottom: 60,
    '& h3': {
      marginBottom: 16,
    },
  },
  swapPrice: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '20px 8px',
    '& p': {
      fontSize: 16,
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginLeft: 8,
        width: 16,
        height: 16
      }
    }
  },
  swapButton: {
    width: '100%',
    height: 56,
    '& p': {
      fontSize: 16
    }
  },
  rewardsContainer: {
    textAlign: 'center',
    margin: '172px 0',
  },
  buyFiatContainer: {

  },
  featureContainer: {

  },
  communityContainer: {
    
  }
}));

const LandingPage: React.FC = () => {
  const classes = useStyles();
  const [swapIndex, setSwapIndex] = useState(0);
  const [swapInputFrom, setSwapInputFrom] = useState('0.00');
  const [swapInputTo, setSwapInputTo] = useState('0.00');

  return (
    <Box className={classes.landingPage}>
      <Box className={classes.heroBkg}>
        <img src={HeroBkg} alt='Hero Background' />
      </Box>
      <Box className={classes.heroSection}>
        <Typography component='h3'>
          Total Value Locked
        </Typography>
        <Typography component='h1'>
          $14,966,289,380
        </Typography>
        <Typography>
          The Top Asset Exchange on the Polygon Network
        </Typography>
        <Button color='primary'>
          <Typography>Connect Wallet</Typography>
        </Button>
      </Box>
      <Box className={classes.tradingInfo}>
        <Box>
          <Typography>Total Trading Pairs</Typography>
          <Typography component='h1'>11,029</Typography>
        </Box>
        <Box>
          <Typography>24 Hours Volume</Typography>
          <Typography component='h1'>$99.6M+</Typography>
        </Box>
        <Box>
          <Typography>24 Hours Transactions</Typography>
          <Typography component='h1'>333,372</Typography>
        </Box>
        <Box>
          <Typography>24 Hours Fees</Typography>
          <Typography component='h1'>$223,512</Typography>
        </Box>
      </Box>
      <Box className={classes.quickInfo}>
        <Typography component='h2'>
          QuickSwap is a next-generation layer-2 decentralized exchange<br/>and Automated Market Maker.
        </Typography>
        <img src={Motif} alt='Motif' />
      </Box>
      <Box className={classes.swapContainer}>
        <ButtonGroup>
          <Button className={swapIndex === 0 ? 'active' : ''} onClick={() => setSwapIndex(0)}>For Traders</Button>
          <Button className={swapIndex === 1 ? 'active' : ''} onClick={() => setSwapIndex(1)}>For Investors</Button>
        </ButtonGroup>
        <Grid container spacing={8} alignItems='center'>
          <Grid item xs={12} sm={6}>
            <Box className={classes.swapBox}>
              <Typography>You Pay:</Typography>
              <Box>
                <Button>
                  <PolygonSwapIcon />
                  <Typography>MATIC</Typography>
                  <KeyboardArrowDownIcon />
                </Button>
                <input value={swapInputFrom} onChange={(e) => setSwapInputFrom(e.target.value)} />
              </Box>
            </Box>
            <Box className={classes.exchangeSwap}>
              <SwapChangeIcon />
            </Box>
            <Box className={classes.swapBox}>
              <Typography>You Pay:</Typography>
              <Box>
                <Button>
                  <QuickIcon />
                  <Typography>QUICK</Typography>
                  <KeyboardArrowDownIcon />
                </Button>
                <input value={swapInputTo} onChange={(e) => setSwapInputTo(e.target.value)} />
              </Box>
            </Box>
            <Box className={classes.swapPrice}>
              <Typography>Price:</Typography>
              <Typography>1 MATIC = 0.002 QUICK <SwapIcon2 /></Typography>
            </Box>
            <Button color='primary' className={classes.swapButton}>
              <Typography>Connect Wallet</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} className={classes.swapInfo}>
            <Typography component='h3'>
              Swap tokens at near-zero gas fees
            </Typography>
            <Typography>
              Exchange any combination of ERC-20 tokens permissionless, with ease
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.rewardsContainer}>
        <Typography component='h3'>
          Earn additional rewards in $QUICK by depositing<br/>your LP Tokens
        </Typography>
        <Typography>
          Deposit your Liquidity Provider tokens to receive<br/>Rewards in $QUICK on top of LP Fees.
        </Typography>
      </Box>
      <Box className={classes.buyFiatContainer}>
        <img src={FiatMask} alt='Fiat Mask' />
      </Box>
      <Box className={classes.featureContainer}>
      </Box>
      <Box className={classes.communityContainer}>
      </Box>
    </Box>
  );
};

export default LandingPage;
