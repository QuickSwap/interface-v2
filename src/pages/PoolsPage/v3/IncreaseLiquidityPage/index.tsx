import React, { useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { BigNumber } from '@ethersproject/bignumber';
import { useV3PositionFromTokenId } from 'hooks/v3/useV3Positions';
import IncreaseLiquidityV3 from 'components/v3/IncreaseLiquidityV3';
import { Box } from '@material-ui/core';
import useParsedQueryString from 'hooks/useParsedQueryString';

export default function IncreaseLiquidityV3Page() {
  const parsedQuery = useParsedQueryString();
  const params: any = useParams();
  const history = useHistory();
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

  if (!position) {
    history.push('/pools/v3');
    return <></>;
  }

  return (
    <Box className='wrapper'>
      <IncreaseLiquidityV3 positionDetails={position} />
    </Box>
  );
}
