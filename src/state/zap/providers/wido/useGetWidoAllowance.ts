import { useQuery } from '@tanstack/react-query';
import { TokenAllowanceResult, getTokenAllowance } from 'wido';
import { ChainId } from '@uniswap/sdk';
import { BOND_QUERY_KEYS } from 'constants/index';
import { useActiveWeb3React } from 'hooks';

const getWidoAllowance = async ({
  chainId,
  fromToken,
  toToken,
  account,
  fromChainId,
  toChainId,
}: {
  chainId: ChainId;
  fromToken: string;
  toToken: string;
  account: string;
  fromChainId?: ChainId;
  toChainId: ChainId;
}): Promise<TokenAllowanceResult | null> => {
  try {
    const tokenAllowance = getTokenAllowance({
      chainId: chainId,
      fromToken,
      toToken,
      accountAddress: account,
      fromChainId,
      toChainId,
    });
    return tokenAllowance;
  } catch (e) {
    console.error({ e });
    return null;
  }
};

const useGetWidoAllowance = ({
  toToken,
  fromToken,
  isEnabled,
  fromChainId,
  toChainId,
}: {
  toToken: string;
  fromToken: string;
  isEnabled: boolean;
  fromChainId: ChainId;
  toChainId: ChainId;
}) => {
  const { isActive, account = '', chainId } = useActiveWeb3React();

  return useQuery({
    queryKey: [
      BOND_QUERY_KEYS.WIDO_ALLOWANCE,
      { account },
      { fromToken },
      { toToken },
    ],
    queryFn: () =>
      getWidoAllowance({
        chainId,
        toToken,
        fromToken,
        account,
        fromChainId,
        toChainId,
      }),
    enabled:
      isEnabled &&
      !!fromToken &&
      !!toToken &&
      isActive &&
      !!account &&
      !!chainId,
  });
};

export default useGetWidoAllowance;
