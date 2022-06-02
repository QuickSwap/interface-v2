import React from 'react';
import { Box } from '@material-ui/core';
import { GlobalConst } from 'constants/index';

interface AnalyticsInfoProps {
  data: any;
}

const AnalyticsInfo: React.FC<AnalyticsInfoProps> = ({ data }) => {
  return (
    <>
      <Box mr={5}>
        <small>Pairs: {data.pairCount.toLocaleString()}</small>
      </Box>
      <Box mr={5}>
        <small>24h Transactions: {data.oneDayTxns.toLocaleString()}</small>
      </Box>
      <Box>
        <small>
          24h Fees: $
          {(
            data.oneDayVolumeUSD * GlobalConst.utils.FEEPERCENT
          ).toLocaleString()}
        </small>
      </Box>
    </>
  );
};

export default AnalyticsInfo;
