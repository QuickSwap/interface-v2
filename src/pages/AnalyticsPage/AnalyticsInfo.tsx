import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { GlobalConst } from 'constants/index';

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
          24h Fees: $
          {(
            data.oneDayVolumeUSD * GlobalConst.utils.FEEPERCENT
          ).toLocaleString()}
        </Typography>
      </Box>
    </>
  );
};

export default AnalyticsInfo;
