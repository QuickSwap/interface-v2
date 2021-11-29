import React, { useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useGlobalData, useEthPrice } from 'state/application/hooks';
import { getEthPrice, getGlobalData } from 'utils';
import { Skeleton } from '@material-ui/lab';

const AnalyticsInfo: React.FC = () => {
  const { ethPrice, updateEthPrice } = useEthPrice();
  const { globalData, updateGlobalData } = useGlobalData();
  useEffect(() => {
    async function checkEthPrice() {
      if (!ethPrice.price) {
        const [newPrice, oneDayPrice, priceChange] = await getEthPrice();
        updateEthPrice({
          price: newPrice,
          oneDayPrice,
          ethPriceChange: priceChange,
        });
        const globalData = await getGlobalData(newPrice, oneDayPrice);
        if (globalData) {
          updateGlobalData({ data: globalData });
        }
      }
    }
    checkEthPrice();
  }, [ethPrice, updateEthPrice, updateGlobalData]);
  return (
    <Box
      paddingX={4}
      paddingY={1.5}
      bgcolor='#1b1d26'
      borderRadius={20}
      display='flex'
      alignItems='center'
      flexWrap='wrap'
    >
      {globalData ? (
        <>
          <Box mr={5}>
            <Typography variant='body2'>
              Pairs: {globalData.pairCount.toLocaleString()}
            </Typography>
          </Box>
          <Box mr={5}>
            <Typography variant='body2'>
              24h Transactions: {globalData.oneDayTxns.toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant='body2'>
              24h Fees: ${(globalData.oneDayVolumeUSD * 0.003).toLocaleString()}
            </Typography>
          </Box>
        </>
      ) : (
        <Skeleton width='100%' height={30} />
      )}
    </Box>
  );
};

export default AnalyticsInfo;
