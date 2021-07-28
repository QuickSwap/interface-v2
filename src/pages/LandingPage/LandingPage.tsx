import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
} from '@material-ui/core';
import HeroBkg from 'assets/images/heroBkg.svg';
import Motif from 'assets/images/Motif.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
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

  },
  rewardsContainer: {

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

  return (
    <Box>
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
      </Box>
      <Box className={classes.rewardsContainer}>
      </Box>
      <Box className={classes.buyFiatContainer}>
      </Box>
      <Box className={classes.featureContainer}>
      </Box>
      <Box className={classes.communityContainer}>
      </Box>
    </Box>
  );
};

export default LandingPage;
