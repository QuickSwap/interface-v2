import { SquidWidget } from '@0xsquid/widget';
import { Box, Grid } from '@material-ui/core';
import React, { useEffect } from 'react';

const SwapCrossChain: React.FC = () => {
  useEffect(() => {
    console.log('SwapCrossChain #init');
  }, []);

  return (
    <Grid style={{ display: 'flex' }}>
      <Box style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <SquidWidget
          config={{
            companyName: 'Quickswap',
            apiUrl: 'https://api.0xsquid.com',
          }}
        />
      </Box>
    </Grid>
  );
};

export default SwapCrossChain;
