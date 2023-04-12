import React, { lazy, useEffect, useState } from 'react';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useEthPrice } from 'state/application/hooks';
import { getGlobalData } from 'utils';
import { getGlobalDataV3 } from 'utils/v3-graph';
import { useActiveWeb3React } from 'hooks';
import { V2_FACTORY_ADDRESSES } from 'constants/v3/addresses';
import { getConfig } from 'config';
const HeroSection = lazy(() => import('./HeroSection'));
const TradingInfo = lazy(() => import('./TradingInfo'));

const GlobalSection: React.FC = () => {
  const [globalData, updateGlobalData] = useState<any>(undefined);
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const [v3GlobalData, updateV3GlobalData] = useState<any>(undefined);
  const { ethPrice } = useEthPrice();
  const { chainId } = useActiveWeb3React();
  const config = chainId ? getConfig(chainId) : undefined;
  const v2 = config ? config['v2'] : undefined;
  const v3 = config ? config['v3'] : undefined;

  useEffect(() => {
    async function fetchGlobalData() {
      if (
        chainId &&
        v2 &&
        ethPrice.price !== undefined &&
        ethPrice.oneDayPrice !== undefined
      ) {
        const newGlobalData = await getGlobalData(
          ethPrice.price,
          ethPrice.oneDayPrice,
          V2_FACTORY_ADDRESSES[chainId],
          chainId,
        );
        if (newGlobalData) {
          updateGlobalData(newGlobalData);
        }
      }
      if (v3 && chainId) {
        const globalDataV3 = await getGlobalDataV3(chainId);
        updateV3GlobalData(globalDataV3);
      }
    }
    fetchGlobalData();
  }, [ethPrice.price, ethPrice.oneDayPrice, chainId, v2, v3]);

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
