import React, { useMemo } from 'react';
import { PoolState, usePool } from 'hooks/v3/usePools';
import { useToken } from 'hooks/v3/Tokens';
import { useV3PositionFromTokenId } from 'hooks/v3/useV3Positions';
import { NavLink, useParams } from 'react-router-dom';
import { BigNumber } from '@ethersproject/bignumber';
import Loader from 'components/Loader';
import usePrevious from 'hooks/usePrevious';
import { Box } from '@material-ui/core';
import PositionListItem from './MyLiquidityPoolsV3/components/PositionListItem';

export default function PositionPage() {
  const params: any = useParams();
  const tokenIdFromUrl = params.tokenId;

  const parsedTokenId = tokenIdFromUrl
    ? BigNumber.from(tokenIdFromUrl)
    : undefined;
  const { loading, position: positionDetails } = useV3PositionFromTokenId(
    parsedTokenId,
  );

  const prevPositionDetails = usePrevious({ ...positionDetails });
  const {
    token0: _token0Address,
    token1: _token1Address,
    liquidity: _liquidity,
    tickLower: _tickLower,
    tickUpper: _tickUpper,
  } = useMemo(() => {
    if (
      !positionDetails &&
      prevPositionDetails &&
      prevPositionDetails.liquidity
    ) {
      return { ...prevPositionDetails };
    }
    return { ...positionDetails };
  }, [positionDetails]);

  const token0 = useToken(_token0Address);
  const token1 = useToken(_token1Address);

  // construct Position from details returned
  const [poolState, pool] = usePool(token0 ?? undefined, token1 ?? undefined);
  const [prevPoolState, prevPool] = usePrevious([poolState, pool]) || [];
  const [_poolState, _pool] = useMemo(() => {
    if (!pool && prevPool && prevPoolState) {
      return [prevPoolState, prevPool];
    }
    return [poolState, pool];
  }, [pool, poolState]);

  return (
    <>
      {(loading || _poolState === PoolState.LOADING) && (
        <Box padding={4} className='flex justify-center'>
          <Loader stroke={'white'} size={'2rem'} />
        </Box>
      )}
      {!loading && _poolState !== PoolState.LOADING && positionDetails && (
        <>
          <Box mb={2}>
            <NavLink
              className='text-primary p'
              style={{ textDecoration: 'none' }}
              to='/pools/v3'
            >
              ← Back to Pools Overview
            </NavLink>
          </Box>
          <PositionListItem
            positionDetails={positionDetails}
            hideExpand={true}
          />
        </>
      )}
    </>
  );
}
