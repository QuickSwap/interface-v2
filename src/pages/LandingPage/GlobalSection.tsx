import React, { lazy, useEffect, useState } from 'react';
import { Box } from 'theme/components';
import { useEthPrice, useGlobalData } from 'state/application/hooks';
import { getGlobalData } from 'utils';
import { getGlobalDataV3 } from 'utils/v3-graph';
import { useIsXS } from 'hooks/useMediaQuery';
const HeroSection = lazy(() => import('./HeroSection'));
const TradingInfo = lazy(() => import('./TradingInfo'));

const GlobalSection: React.FC = () => {
  const { globalData, updateGlobalData } = useGlobalData();
  const [v3GlobalData, updateV3GlobalData] = useState<any>(undefined);
  const { ethPrice } = useEthPrice();
  const isMobile = useIsXS();

  useEffect(() => {
    async function fetchGlobalData() {
      if (ethPrice.price && ethPrice.oneDayPrice) {
        const newGlobalData = await getGlobalData(
          ethPrice.price,
          ethPrice.oneDayPrice,
        );
        if (newGlobalData) {
          updateGlobalData({ data: newGlobalData });
        }
      }
      const globalDataV3 = await getGlobalDataV3();
      updateV3GlobalData(globalDataV3);
    }
    fetchGlobalData();
  }, [updateGlobalData, ethPrice.price, ethPrice.oneDayPrice]);

  return (
    <>
      <Box margin={isMobile ? '64px 0' : '100px 0 80px'}>
        <HeroSection globalData={globalData} v3GlobalData={v3GlobalData} />
      </Box>
      <Box className='flex tradingInfo'>
        <TradingInfo globalData={globalData} v3GlobalData={v3GlobalData} />
      </Box>
    </>
  );
};

export default GlobalSection;
