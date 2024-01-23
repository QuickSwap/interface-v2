import React from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';

export const LiquidityHubAd: React.FC = () => {
  return (
    <Box className='w-100' position='relative'>
      <Image
        layout='fill'
        objectFit='contain'
        src='/assets/images/ads/ads-liquidity-hub.png'
        alt='advertisement liquidity hub'
      />
    </Box>
  );
};
