import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Grid } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import DragonBg1 from 'assets/images/DragonBg1.svg';
import DragonBg2 from 'assets/images/DragonBg2.svg';
import DragonLairMask from 'assets/images/DragonLairMask.svg';

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
    margin: '24px 0 49px',
    '& h5': {
      marginBottom: 16,
      color: '#c7cad9'
    },
    '& p': {
      maxWidth: 280,
      color: '#c7cad9'
    }
  }
}));

const DragonPage: React.FC = () => {
  const classes = useStyles();

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
            <img src={DragonLairMask} alt='Dragon Mask' style={{ width: '100%', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }} />
            <Box className={classes.stepWrapper}>
              <Typography variant='caption'>STEP 1:</Typography>
            </Box>
            <Box className={classes.dragonTitle}>
              <Typography variant='h5'>Dragons Lair</Typography>
              <Typography variant='body2'>Stake QUICK, Receive dQUICK as receipt representing your share of the pool.</Typography>
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
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DragonPage;
