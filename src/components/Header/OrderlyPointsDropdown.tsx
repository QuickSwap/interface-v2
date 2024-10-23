import React from 'react';
import { Box } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { useQuery } from '@orderly.network/hooks';
import { ReactComponent as OrderlyEpochMeritIcon } from 'assets/images/OrderlyEpochMerit.svg';
import { ReactComponent as OrderlyEpochRankIcon } from 'assets/images/OrderlyEpochRank.svg';
import { ReactComponent as OrderlyGlobalRankIcon } from 'assets/images/OrderlyGlobalRank.svg';
import { ReactComponent as OrderlyTotalMeritIcon } from 'assets/images/OrderlyTotalMerit.svg';
import { formatNumber } from 'utils';

const OrderlyPointsDropdown: React.FC = () => {
  const { account } = useActiveWeb3React();
  const { data } = useQuery(
    `/v1/public/trading_rewards/current_epoch_estimate?address=${account}`,
    {
      formatter: (data) => data,
    },
  );

  return (
    <Box className='orderlyPointsDropdown' gridGap={16}>
      <Box className='flex items-center justify-between' gridGap={8}>
        <Box className='flex items-center' gridGap={8}>
          <OrderlyGlobalRankIcon />
          <small>My est. rewards:</small>
        </Box>
        <small>{data?.est_r_wallet}</small>
      </Box>
      <Box className='flex items-center justify-between' gridGap={8}>
        <Box className='flex items-center' gridGap={8}>
          <OrderlyTotalMeritIcon />
          <small>My Trading Volume:</small>
        </Box>
        <small>{data?.est_trading_volume}</small>
      </Box>
      <Box className='flex items-center justify-between' gridGap={8}>
        <Box className='flex items-center' gridGap={8}>
          <OrderlyEpochMeritIcon />
          <small>Avg. staked amount:</small>
        </Box>
        <small>{data?.est_avg_stake}</small>
      </Box>
      <Box className='flex items-center justify-between' gridGap={8}>
        <Box className='flex items-center' gridGap={8}>
          <OrderlyEpochRankIcon />
          <small>Booster:</small>
        </Box>
        <small>{formatNumber(data?.est_stake_boost)}</small>
      </Box>
    </Box>
  );
};

export default OrderlyPointsDropdown;
