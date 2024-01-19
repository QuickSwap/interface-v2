import { useQuery } from '@tanstack/react-query';
import { ChainId, Token } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useContract } from 'hooks/useContract';
import { useLastTransactionHash } from 'state/transactions/hooks';
import GammaPairABI from 'constants/abis/gamma-hypervisor.json';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import { formatUnits } from 'ethers/lib/utils';
import { useEffect } from 'react';

const gammaChainName = (chainId?: ChainId) => {
  switch (chainId) {
    case ChainId.ZKEVM:
      return 'polygon-zkevm';
    default:
      return 'polygon';
  }
};

const getGammaData = async (chainId?: ChainId) => {
  if (!chainId) return null;
  try {
    const data = await fetch(
      `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/${gammaChainName(
        chainId,
      )}/hypervisors/allData`,
    );
    const gammaData = await data.json();
    return gammaData;
  } catch {
    try {
      const data = await fetch(
        `${
          process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP
        }/quickswap/${gammaChainName(chainId)}/hypervisors/allData`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
};

const getGammaPositions = async (account?: string, chainId?: ChainId) => {
  if (!account || !chainId) return null;
  try {
    const data = await fetch(
      `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/${gammaChainName(
        chainId,
      )}/user/${account}`,
    );
    const positions = await data.json();
    return positions[account.toLowerCase()];
  } catch {
    try {
      const data = await fetch(
        `${
          process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP
        }/quickswap/${gammaChainName(chainId)}/user/${account}`,
      );
      const positions = await data.json();
      return positions[account.toLowerCase()];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
};

const getGammaRewards = async (chainId?: ChainId) => {
  if (!chainId) return null;
  try {
    const data = await fetch(
      `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/${gammaChainName(
        chainId,
      )}/allRewards2`,
    );
    const gammaData = await data.json();
    return gammaData;
  } catch {
    try {
      const data = await fetch(
        `${
          process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP
        }/quickswap/${gammaChainName(chainId)}/allRewards2`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
};

export const useGammaData = () => {
  const { chainId } = useActiveWeb3React();
  return useQuery({
    queryKey: ['fetchGammaData', chainId],
    queryFn: async () => {
      const gammaData = await getGammaData(chainId);
      return gammaData;
    },
    refetchInterval: 300000,
  });
};

export const useGammaRewards = () => {
  const { chainId } = useActiveWeb3React();
  return useQuery({
    queryKey: ['fetchGammaRewards', chainId],
    queryFn: async () => {
      const gammaRewards = await getGammaRewards(chainId);
      return gammaRewards;
    },
    refetchInterval: 300000,
  });
};

export const useGammaPositions = () => {
  const { account, chainId } = useActiveWeb3React();
  const lastTx = useLastTransactionHash();
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['fetchGammaPositions', account, chainId],
    queryFn: async () => {
      const gammaRewards = await getGammaPositions(account, chainId);
      return gammaRewards;
    },
    refetchInterval: 300000,
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTx]);

  return { isLoading, data };
};

export const useGammaPosition = (
  address?: string,
  token0?: Token,
  token1?: Token,
) => {
  const { account } = useActiveWeb3React();
  const gammaContract = useContract(address, GammaPairABI);
  const lpBalanceCallData = useSingleCallResult(gammaContract, 'balanceOf', [
    account ?? undefined,
  ]);

  const totalAmountsCalldata = useSingleCallResult(
    gammaContract,
    'getTotalAmounts',
  );
  const totalSupplyCalldata = useSingleCallResult(gammaContract, 'totalSupply');
  const totalAmount0 =
    !totalAmountsCalldata.loading &&
    totalAmountsCalldata.result &&
    totalAmountsCalldata.result.length > 0
      ? totalAmountsCalldata.result[0]
      : undefined;
  const totalAmount1 =
    !totalAmountsCalldata.loading &&
    totalAmountsCalldata.result &&
    totalAmountsCalldata.result.length > 1
      ? totalAmountsCalldata.result[1]
      : undefined;
  const totalSupply =
    !totalSupplyCalldata.loading &&
    totalSupplyCalldata.result &&
    totalSupplyCalldata.result.length > 0
      ? Number(formatUnits(totalSupplyCalldata.result[0], 18))
      : 0;
  const lpBalance =
    !lpBalanceCallData.loading &&
    lpBalanceCallData.result &&
    lpBalanceCallData.result.length > 0
      ? lpBalanceCallData.result[0]
      : '0';

  const lpAmount = Number(formatUnits(lpBalance));

  const amount0 =
    totalAmount0 && token0
      ? Number(formatUnits(totalAmount0, token0.decimals))
      : 0;
  const amount1 =
    totalAmount1 && token1
      ? Number(formatUnits(totalAmount1, token1.decimals))
      : 0;
  const balance0 = totalSupply > 0 ? (amount0 * lpAmount) / totalSupply : 0;
  const balance1 = totalSupply > 0 ? (amount1 * lpAmount) / totalSupply : 0;

  if (!address) return { loading: false, data: undefined };

  return {
    loading:
      lpBalanceCallData.loading ||
      totalAmountsCalldata.loading ||
      totalSupplyCalldata.loading,
    data: {
      balance0,
      balance1,
      shares: lpBalance,
      lpAmount: Number(formatUnits(lpBalance)),
      pairAddress: address,
      token0,
      token1,
    },
  };
};
