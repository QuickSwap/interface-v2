import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import HeroSection from './HeroSection';
import TradingInfo from './TradingInfo';
import styles from 'styles/pages/Home.module.scss';

const GlobalSection: React.FC = () => {
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));

  return (
    <>
      <Box margin={mobileWindowSize ? '64px 0' : '100px 0 80px'}>
        <HeroSection />
      </Box>
      <Box className={`flex ${styles.tradingInfo}`}>
        <TradingInfo />
      </Box>
    </>
  );
};

export default GlobalSection;
