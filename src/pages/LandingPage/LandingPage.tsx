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

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  heroBkg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '135px 0 120px',
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
  }
}));

const LandingPage: React.FC = () => {
  const classes = useStyles();

  return (
    <Box>
      <img src={HeroBkg} alt='Hero Background' className={classes.heroBkg} />
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
    </Box>
  );
};

export default LandingPage;
