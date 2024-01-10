import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BigNumber } from '@ethersproject/bignumber';
import { useV3PositionFromTokenId } from 'hooks/v3/useV3Positions';
import RemoveLiquidityV3 from 'components/v3/RemoveLiquidityV3';
import { Box } from '@material-ui/core';
import useParsedQueryString from 'hooks/useParsedQueryString';

export default function RemoveLiquidityV3Page() {
  const parsedQuery = useParsedQueryString();
  const params: any = useParams();
  const tokenId = params?.tokenId;
  const parsedTokenId = useMemo(() => {
    try {
      return BigNumber.from(tokenId);
    } catch {
      return;
    }
  }, [tokenId]);

  const isUni = parsedQuery?.isUni === 'true';
  const { position } = useV3PositionFromTokenId(parsedTokenId, isUni);

  return (
    <Box className='wrapper'>
      {position && <RemoveLiquidityV3 position={position} />}
    </Box>
  );
}
