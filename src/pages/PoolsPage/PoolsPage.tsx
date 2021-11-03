import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid, Typography } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ReactComponent as HelpIconLarge } from 'assets/images/HelpIcon2.svg';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import NoLiquidity from 'assets/images/NoLiquidityPool.png';
import { AddLiquidity } from 'components';

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
  noLiquidity: {
    textAlign: 'center',
    margin: '12px 0 48px',
    '& img': {
      maxWidth: 286,
      width: '80%',
      filter: 'grayscale(1)' 
    },
    '& p': {
      color: '#696c80',
      margin: '0 auto',
      '& span': {
        color: '#448aff'
      }
    }
  }
}));

const PoolsPage: React.FC = () => {
  const classes = useStyles();

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
              <AddLiquidity />
            </Box>
          </Box>
        </Grid>
        <Grid item sm={12} md={7}>
          <Box className={classes.wrapper}>
            <Typography variant='body1' style={{ fontWeight: 600 }}>Your Liquidity Pools</Typography>
            <Box className={classes.noLiquidity}>
              <img src={NoLiquidity} alt='No Liquidity' />
              <Typography variant='body2'>Don’t see a pool you joined? <span>Import it</span>.<br/>Unstake your LP Tokens from Farms to see them here.</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
