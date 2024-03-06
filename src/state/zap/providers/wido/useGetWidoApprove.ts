import { useQuery } from '@tanstack/react-query';
import { approve, ApproveResult } from 'wido';
import { ChainId } from '@uniswap/sdk';
import { BOND_QUERY_KEYS } from '~/constants/index';
import { useActiveWeb3React } from '~/hooks';

const getWidoApprove = async ({
  chainId,
  fromToken,
  toToken,
  fromChainId,
  toChainId,
  amount,
}: {
  chainId: ChainId;
  fromToken: string;
  toToken: string;
  amount: string;
  fromChainId: ChainId;
  toChainId: ChainId;
}): Promise<ApproveResult | null> => {
  try {
    const tokenAllowance = approve({
      chainId: chainId,
      toChainId,
      fromToken,
      toToken,
      amount,
      fromChainId,
    });
    return tokenAllowance;
  } catch (e) {
    console.error({ e });
    return null;
  }
};

const useGetWidoApprove = ({
  fromToken,
  toToken,
  fromChainId,
  toChainId,
  amount,
  isEnabled,
}: {
  fromToken: string;
  toToken: string;
  amount: string;
  isEnabled: boolean;
  fromChainId: ChainId;
  toChainId: ChainId;
}) => {
  const { account = '', chainId } = useActiveWeb3React();
  return useQuery({
    queryKey: [
      BOND_QUERY_KEYS.WIDO_APPROVAL,
      { account },
      { fromToken },
      { toToken },
    ],
    queryFn: () =>
      getWidoApprove({
        chainId,
        toToken,
        fromToken,
        amount,
        fromChainId,
        toChainId,
      }),
    enabled: isEnabled && !!account && !!chainId,
  });
};

export default useGetWidoApprove;
