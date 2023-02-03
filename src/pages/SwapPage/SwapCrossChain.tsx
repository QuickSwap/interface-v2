import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@material-ui/core';
// import { SquidWidget } from '@0xsquid/widget';

const SwapCrossChain: React.FC = () => {
  useEffect(() => {
    console.log('SwapCrossChain #init');
  }, []);

  return (
    <Grid>
      <Box>
        Squid Widget
        {/* <SquidWidget
          config={{
            companyName: 'Quickswap',
            apiUrl: 'https://api.0xsquid.com',
          }}
        /> */}
      </Box>
    </Grid>
  );
};

export default SwapCrossChain;
