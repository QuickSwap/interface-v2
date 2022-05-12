import React, { useState } from 'react';
import { Typography, Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { StakeQuickModal } from 'components';
import { useLairInfo, useTotalRewardsDistributed } from 'state/stake/hooks';
import { formatCompact, useLairDQUICKAPY } from 'utils';

export const TradingInfo: React.FC<{ globalData: any }> = ({ globalData }) => {
  const lairInfo = useLairInfo();
  const [openStakeModal, setOpenStakeModal] = useState(false);

  const dQUICKAPY = useLairDQUICKAPY(lairInfo);

  const totalRewardsUSD = useTotalRewardsDistributed();

  return (
    <>
      {openStakeModal && (
        <StakeQuickModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
        />
      )}
      <Box className='tradingSection'>
        {globalData ? (
          <Typography variant='h3'>
            {Number(globalData.oneDayTxns).toLocaleString()}
          </Typography>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <Typography>24H TRANSACTIONS</Typography>
      </Box>
      <Box className='tradingSection'>
        {globalData ? (
          <Box display='flex'>
            <Typography variant='h6'>$</Typography>
            <Typography variant='h3'>
              {formatCompact(globalData.oneDayVolumeUSD)}
            </Typography>
          </Box>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <Typography>24H TRADING VOLUME</Typography>
      </Box>
      <Box className='tradingSection'>
        {totalRewardsUSD ? (
          <Box display='flex'>
            <Typography variant='h6'>$</Typography>
            <Typography variant='h3'>
              {totalRewardsUSD.toLocaleString()}
            </Typography>
          </Box>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <Typography>24h REWARDS DISTRIBUTED</Typography>
      </Box>
      <Box className='tradingSection'>
        {globalData ? (
          <Typography variant='h3'>
            {Number(globalData.pairCount).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </Typography>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <Typography>TOTAL TRADING PAIRS</Typography>
      </Box>
      <Box className='tradingSection' pt='20px'>
        {dQUICKAPY ? (
          <Typography variant='h3'>{dQUICKAPY.toLocaleString()}%</Typography>
        ) : (
          <Skeleton variant='rect' width={100} height={45} />
        )}
        <Typography>dQUICK APY</Typography>
        <Typography variant='h4' onClick={() => setOpenStakeModal(true)}>
          stake {'>'}
        </Typography>
      </Box>
    </>
  );
};
