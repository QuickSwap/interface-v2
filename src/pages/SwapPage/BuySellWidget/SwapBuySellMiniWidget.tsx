import { Box, Divider } from '@material-ui/core';
import React from 'react';
import { SpritzAdvertisement } from './SpritzAdvertisement';
import { MeldAdvertisement } from './MeldAdvertisement';
import { DragonDispatchAdvertisement } from './DragonDipatchAdvertisement';

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
