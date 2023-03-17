import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useEthPrice } from 'state/application/hooks';
import { getGlobalData } from 'utils';
import { getGlobalDataV3 } from 'utils/v3-graph';
import HeroSection from './HeroSection';
import TradingInfo from './TradingInfo';

const GlobalSection: React.FC = () => {
  const [globalData, updateGlobalData] = useState<any>(undefined);
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const [v3GlobalData, updateV3GlobalData] = useState<any>(undefined);
  const { ethPrice } = useEthPrice();

  useEffect(() => {
    async function fetchGlobalData() {
      if (ethPrice.price && ethPrice.oneDayPrice) {
        const newGlobalData = await getGlobalData(
          ethPrice.price,
          ethPrice.oneDayPrice,
        );
        if (newGlobalData) {
          updateGlobalData(newGlobalData);
        }
      }
      const globalDataV3 = await getGlobalDataV3();
      updateV3GlobalData(globalDataV3);
    }
    fetchGlobalData();
  }, [ethPrice.price, ethPrice.oneDayPrice]);

  return (
    <>
      <Box margin={mobileWindowSize ? '64px 0' : '100px 0 80px'}>
        <HeroSection globalData={globalData} v3GlobalData={v3GlobalData} />
      </Box>
      <Box className='flex tradingInfo'>
        <TradingInfo globalData={globalData} v3GlobalData={v3GlobalData} />
      </Box>
    </>
  );
};

export default GlobalSection;
