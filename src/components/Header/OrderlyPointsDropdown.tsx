import React from 'react';
import { Box } from '@material-ui/core';
import { useActiveWeb3React } from 'hooks';
import { useQuery } from '@orderly.network/hooks';
import { ReactComponent as OrderlyEpochMeritIcon } from 'assets/images/OrderlyEpochMerit.svg';
import { ReactComponent as OrderlyEpochRankIcon } from 'assets/images/OrderlyEpochRank.svg';
import { ReactComponent as OrderlyGlobalRankIcon } from 'assets/images/OrderlyGlobalRank.svg';
import { ReactComponent as OrderlyTotalMeritIcon } from 'assets/images/OrderlyTotalMerit.svg';

const OrderlyPointsDropdown: React.FC = () => {
  const { account } = useActiveWeb3React();
  const { data } = useQuery(`/v1/client/points?address=${account}`, {
    formatter: (data) => data,
  });

  return (
    <Box className='orderlyPointsDropdown' gridGap={16}>
      <Box className='flex items-center justify-between' gridGap={8}>
        <Box className='flex items-center' gridGap={8}>
          <OrderlyGlobalRankIcon />
          <small>Global Rank:</small>
        </Box>
        <small>{data?.global_rank}</small>
      </Box>
      <Box className='flex items-center justify-between' gridGap={8}>
        <Box className='flex items-center' gridGap={8}>
          <OrderlyTotalMeritIcon />
          <small>Total Merits:</small>
        </Box>
        <small>{data?.total_points}</small>
      </Box>
      <Box className='flex items-center justify-between' gridGap={8}>
        <Box className='flex items-center' gridGap={8}>
          <OrderlyEpochMeritIcon />
          <small>Epoch Merits:</small>
        </Box>
        <small>{data?.current_epoch_points}</small>
      </Box>
      <Box className='flex items-center justify-between' gridGap={8}>
        <Box className='flex items-center' gridGap={8}>
          <OrderlyEpochRankIcon />
          <small>Epoch Rank:</small>
        </Box>
        <small>{data?.current_epoch_rank}</small>
      </Box>
    </Box>
  );
};

export default OrderlyPointsDropdown;
