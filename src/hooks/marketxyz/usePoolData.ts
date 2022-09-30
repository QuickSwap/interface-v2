import { useQuery } from 'react-query';
import { useMarket } from './useMarket';
import { useActiveWeb3React } from '../index';
import { fetchPoolData, PoolData } from '../../utils/marketxyz/fetchPoolData';
import { PoolDirectoryV1 } from 'market-sdk';
import { ChainId } from '@uniswap/sdk';

export const usePoolsData = (
  poolAddresses: string[],
  directory: PoolDirectoryV1 | string,
) => {
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const { sdk } = useMarket();
  const _directory = sdk
    ? typeof directory === 'string'
      ? new PoolDirectoryV1(sdk, directory)
      : directory
    : undefined;
  const getPoolsData = async () => {
    if (!_directory) return;
    const allPools = await _directory.getAllPools();
    const poolsData = await Promise.all(
      poolAddresses.map(async (poolAddress) => {
        const poolId = allPools.findIndex((p) => {
          return p.comptroller.address === poolAddress;
        });
        if (poolId === -1) return;
        const poolData = await fetchPoolData(
          chainIdToUse,
          poolId.toString(),
          account ?? undefined,
          _directory,
        );
        return poolData;
      }),
    );
    return poolsData;
  };
  const { data } = useQuery('FetchPoolsData', getPoolsData, {
    refetchInterval: 3000,
  });

  return data;
};

export const usePoolData = (
  poolId: string | null | undefined,
  directory: PoolDirectoryV1 | string,
): PoolData | undefined => {
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const { sdk } = useMarket();
  const _directory = sdk
    ? typeof directory === 'string'
      ? new PoolDirectoryV1(sdk, directory)
      : directory
    : undefined;
  const getPoolData = async () => {
    if (!_directory) return;
    const poolData = await fetchPoolData(
      chainIdToUse,
      poolId ?? undefined,
      account ?? undefined,
      _directory,
    );
    return poolData;
  };
  const { data } = useQuery('FetchPoolData', getPoolData, {
    refetchInterval: 3000,
  });

  return data;
};
