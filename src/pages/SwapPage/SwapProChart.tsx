import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from '~/hooks';
import React from 'react';
import { useIsV2 } from '~/state/application/hooks';

const SwapProChart: React.FC<{
  pairName: string;
  pairAddress: string;
  pairTokenReversed: boolean;
}> = ({ pairAddress, pairName, pairTokenReversed }) => {
  const { chainId } = useActiveWeb3React();
  const { isV2 } = useIsV2();

  return (
    <iframe
      src={`https://mode.quickswap.exchange?pairAddress=${pairAddress}&pairName=${pairName}&tokenReversed=${pairTokenReversed}&chainId=${chainId ??
        ChainId.MATIC}${isV2 !== undefined ? `&isV3=${!isV2}` : ''}`}
      height='100%'
      width='100%'
      style={{ border: 'none' }}
    />
  );
};

export default React.memo(SwapProChart);
