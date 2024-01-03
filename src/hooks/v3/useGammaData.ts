import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useLastTransactionHash } from 'state/transactions/hooks';

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
  return useQuery({
    queryKey: ['fetchGammaPositions', account, chainId, lastTx],
    queryFn: async () => {
      const gammaRewards = await getGammaPositions(account, chainId);
      return gammaRewards;
    },
    refetchInterval: 300000,
  });
};
