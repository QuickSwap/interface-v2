import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import YourLiquidityPools from './YourLiquidityPools';
import 'pages/styles/pools.scss';

const PoolsPage: React.FC = () => {
  return (
    <Box width='100%' mb={3}>
      <Box
        mb={2}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        width='100%'
      >
        <Typography variant='h4'>Pool</Typography>
        <Box className='helpWrapper'>
          <Typography variant='body2'>Help</Typography>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className='wrapper'>
            <SupplyLiquidity />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className='wrapper'>
            <YourLiquidityPools />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
