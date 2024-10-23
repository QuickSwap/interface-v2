import { Box, Divider } from '@material-ui/core';
import React from 'react';
import { MeldAdvertisement } from './MeldAdvertisement';
import { DragonDispatchAdvertisement } from './DragonDispatchAdvertisement';

const SwapBuySellMiniWidget: React.FC = () => {
  return (
    <Box>
      <DragonDispatchAdvertisement />
      <Divider
        style={{
          marginTop: '1rem',
          marginBottom: '1rem',
        }}
      />
      <MeldAdvertisement />
    </Box>
  );
};

export default SwapBuySellMiniWidget;
