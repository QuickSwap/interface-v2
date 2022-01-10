import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { FEE_PERCENT } from 'constants/index';

interface AnalyticsInfoProps {
  data: any;
}

const AnalyticsInfo: React.FC<AnalyticsInfoProps> = ({ data }) => {
  return (
    <>
      <Box mr={5}>
        <Typography variant='body2'>
          Pairs: {data.pairCount.toLocaleString()}
        </Typography>
      </Box>
      <Box mr={5}>
        <Typography variant='body2'>
          24h Transactions: {data.oneDayTxns.toLocaleString()}
        </Typography>
      </Box>
      <Box>
        <Typography variant='body2'>
          24h Fees: ${(data.oneDayVolumeUSD * FEE_PERCENT).toLocaleString()}
        </Typography>
      </Box>
    </>
  );
};

export default AnalyticsInfo;
