import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { ReactComponent as ArrowLeft } from 'assets/images/ArrowLeft.svg';
import { QuestionHelper, PoolFinderModal } from 'components';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import Loader from 'components/Loader';
import V2PositionCard from './components/V2PositionCard';
import './index.scss';

export default function MigrateV2LiquidityPage() {
  const history = useHistory();
  const { account } = useActiveWeb3React();
  const {
    loading: v2PairsLoading,
    pairs: allV2PairsWithLiquidity,
  } = useV2LiquidityPools(account ?? undefined);
  const [openPoolFinder, setOpenPoolFinder] = useState(false);

  return (
    <>
      {openPoolFinder && (
        <PoolFinderModal
          open={openPoolFinder}
          onClose={() => setOpenPoolFinder(false)}
        />
      )}
      <Box className='wrapper' maxWidth='464px' width='100%'>
        <Box className='flex justify-between items-center'>
          <Box
            className='flex cursor-pointer'
            onClick={() => history.push('pools/v3')}
          >
            <ArrowLeft />
          </Box>
          <p className='weight-600'>Migrate V2 Liquidity</p>
          <Box
            width={28}
            height={28}
            className='flex items-center justify-center'
          >
            <QuestionHelper size={24} className='text-secondary' text='' />
          </Box>
        </Box>
        <Box mt={3}>
          <small>
            For each pool shown below, click ‘Migrate liquidity’ to remove
            liquidity from Quickswap V2 and deposit it into Quickswap V3.
          </small>
        </Box>
        <Box mt={3}>
          {v2PairsLoading ? (
            <Box className='flex justify-center'>
              <Loader stroke='white' size={'2rem'} />
            </Box>
          ) : allV2PairsWithLiquidity.length > 0 ? (
            allV2PairsWithLiquidity.map((pair) => (
              <V2PositionCard key={pair.liquidityToken.address} pair={pair} />
            ))
          ) : (
            <Box textAlign='center'>
              <small>There are no v2 liquidity pools</small>
            </Box>
          )}
        </Box>
        <Box mt={2} textAlign='center'>
          <small className='text-secondary'>
            Don‘t see your V2 liquidity?{' '}
            <small
              className='text-primary cursor-pointer'
              onClick={() => setOpenPoolFinder(true)}
            >
              Import it
            </small>
          </small>
        </Box>
      </Box>
    </>
  );
}
