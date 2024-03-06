import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from '~/hooks';
import React from 'react';
import { useIsV2 } from '~/state/application/hooks';
import { Field } from '~/state/swap/actions';
import { wrappedCurrency } from '~/utils/wrappedCurrency';
import { useDerivedSwapInfo } from '~/state/swap/hooks';
import { useQuery } from '@tanstack/react-query';

const SwapProChart: React.FC<{
  pairName: string;
}> = ({ pairName }) => {
  const { chainId } = useActiveWeb3React();
  const { isV2 } = useIsV2();
  const { currencies } = useDerivedSwapInfo();
  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);
  const getPairId = async () => {
    if (token1 && token2) {
      const res = await fetch(
        `${import.meta.env.VITE_LEADERBOARD_APP_URL}/utils/pair-address/${token1.address}/${token2.address}?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();

      if (data && data.data) {
        return {
          tokenReversed: isV2
            ? data.data.v2
              ? data.data.v2.tokenReversed
              : false
            : data.data.v3
            ? data.data.v3.tokenReversed
            : false,
          pairId: { v2: data.data.v2?.pairId, v3: data.data.v3?.pairId },
        };
      }
    }
    return null;
  };

  const { data } = useQuery({
    queryKey: ['fetchPairId', token1?.address, token2?.address, chainId],
    queryFn: getPairId,
  });
  const pairTokenReversed = data?.tokenReversed ?? false;
  const pairAddress = data?.pairId?.v2;

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
