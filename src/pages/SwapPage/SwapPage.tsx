import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Grid } from '@material-ui/core';
import cx from 'classnames';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { Swap } from 'components';

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
  }
}));

const SwapPage: React.FC = () => {
  const classes = useStyles();
  const [ swapIndex, setSwapIndex ] = useState(0);

  return (
    <Box width='100%'>
      <Box mb={2} display='flex' alignItems='center' justifyContent='space-between' width='100%'>
        <Typography variant='h4'>Swap</Typography>
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>Help</Typography>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default SwapPage;
