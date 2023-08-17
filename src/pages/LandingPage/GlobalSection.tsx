import React from 'react';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import HeroSection from './HeroSection';
import TradingInfo from './TradingInfo';

const GlobalSection: React.FC = () => {
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));

  return (
    <>
      <Box margin={mobileWindowSize ? '64px 0' : '100px 0 80px'}>
        <HeroSection />
      </Box>
      <Box className='flex tradingInfo'>
        <TradingInfo />
      </Box>
    </>
  );
};

export default GlobalSection;
