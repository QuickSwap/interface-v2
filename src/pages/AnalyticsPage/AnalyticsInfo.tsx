import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

const AnalyticsInfo: React.FC<{ data: any }> = ({ data }) => {
  const { palette } = useTheme();

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
          24h Fees: ${(data.oneDayVolumeUSD * 0.003).toLocaleString()}
        </Typography>
      </Box>
    </>
  );
};

export default AnalyticsInfo;
