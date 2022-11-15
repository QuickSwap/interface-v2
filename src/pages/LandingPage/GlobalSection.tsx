import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useEthPrice, useGlobalData } from 'state/application/hooks';
import { HeroSection } from './HeroSection';
import { TradingInfo } from './TradingInfo';
import { getGlobalData } from 'utils';
import { getGlobalDataV3 } from 'utils/v3-graph';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { V2_FACTORY_ADDRESSES } from 'constants/v3/addresses';
import { getConfig } from 'config';

export const GlobalSection: React.FC = () => {
  const { globalData, updateGlobalData } = useGlobalData();
  const { breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const [v3GlobalData, updateV3GlobalData] = useState<any>(undefined);
  const { ethPrice } = useEthPrice();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const v2 = config['v2'];
  const v3 = config['v3'];

  useEffect(() => {
    async function fetchGlobalData() {
      if (v2 && ethPrice.price && ethPrice.oneDayPrice) {
        const newGlobalData = await getGlobalData(
          ethPrice.price,
          ethPrice.oneDayPrice,
          V2_FACTORY_ADDRESSES[chainIdToUse],
          chainIdToUse,
        );
        if (newGlobalData) {
          updateGlobalData({ data: newGlobalData });
        }
      }
      if (v3) {
        const globalDataV3 = await getGlobalDataV3(chainIdToUse);
        updateV3GlobalData(globalDataV3);
      }
    }
    fetchGlobalData();
  }, [
    updateGlobalData,
    ethPrice.price,
    ethPrice.oneDayPrice,
    chainIdToUse,
    v2,
    v3,
  ]);

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
