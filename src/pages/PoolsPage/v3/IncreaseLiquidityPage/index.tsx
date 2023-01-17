import React, { useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { BigNumber } from '@ethersproject/bignumber';
import { useV3PositionFromTokenId } from 'hooks/v3/useV3Positions';
import IncreaseLiquidityV3 from 'components/v3/IncreaseLiquidityV3';

export default function IncreaseLiquidityV3Page() {
  const params: any = useParams();
  const history = useHistory();
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
    history.push('/pools/v3');
    return <></>;
  }

  return (
    <div className='wrapper'>
      <IncreaseLiquidityV3 positionDetails={position} />
    </div>
  );
}
