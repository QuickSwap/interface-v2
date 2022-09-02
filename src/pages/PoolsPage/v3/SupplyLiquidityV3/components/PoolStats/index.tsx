import React, { ReactElement } from 'react';
import Loader from 'components/Loader';
import { Box } from '@material-ui/core';
import './index.scss';

interface IPoolStats {
  fee: string | ReactElement;
  apr: string | ReactElement | undefined;
  noLiquidity: boolean | undefined;
  loading: boolean;
}

export function PoolStats({ fee, apr, noLiquidity, loading }: IPoolStats) {
  if (loading)
    return (
      <Box className='flex justify-center items-center'>
        <Loader stroke={'white'} />
      </Box>
    );

  return (
    <Box className='poolStats'>
      <span>{noLiquidity ? `New pool` : `Current pool stats`}</span>
      <Box mt='6px' className='flex items-center'>
        <Box className='poolStatsWrapper bg-primaryLight'>
          <span>{fee}</span>
        </Box>
        {apr && (
          <Box ml='6px' className='poolStatsWrapper bg-successLight'>
            <span className='text-success'>{apr}% APR</span>
          </Box>
        )}
      </Box>
    </Box>
  );
}
