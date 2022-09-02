import React, { useMemo } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { BigNumber } from '@ethersproject/bignumber';
import { useV3PositionFromTokenId } from 'hooks/v3/useV3Positions';
import IncreaseLiquidityV3 from 'components/v3/IncreaseLiquidityV3';
import { Box } from '@material-ui/core';

export default function IncreaseLiquidityV3Page() {
  const params: any = useParams();
  const tokenId = params.tokenId;
  const parsedTokenId = useMemo(() => {
    try {
      return BigNumber.from(tokenId);
    } catch {
      return;
    }
  }, [tokenId]);

  const { position } = useV3PositionFromTokenId(parsedTokenId);

  if (!position) {
    return <Redirect to={{ ...location, pathname: '/v3Pools' }} />;
  }

  return (
    <Box className='wrapper'>
      <IncreaseLiquidityV3 positionDetails={position} />
    </Box>
  );
}
