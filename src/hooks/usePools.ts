import { POOL_DEPLOYER_ADDRESS } from '../constants/v3/addresses';
import { Currency, Token } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { useActiveWeb3React } from 'hooks';
import abi from 'constants/abis/v3/pool.json';
import { Interface } from '@ethersproject/abi';
import { useToken } from './Tokens';
import { usePreviousNonErroredArray } from './usePrevious';
import { Pool } from 'lib/src/pool';
import { computePoolAddress } from './v3/computePoolAddress';
import { useMultipleContractSingleData } from 'state/multicall/v3/hooks';

const POOL_STATE_INTERFACE = new Interface(abi);

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePools(
  poolKeys: [Currency | undefined, Currency | undefined][],
): [PoolState, Pool | null][] {
  const { chainId } = useActiveWeb3React();

  const transformed: ([Token, Token] | null)[] = useMemo(() => {
    return poolKeys.map(([currencyA, currencyB]) => {
      if (!chainId || !currencyA || !currencyB) return null;

      const tokenA = currencyA?.wrapped;
      const tokenB = currencyB?.wrapped;
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return null;
      const [token0, token1] = tokenA.sortsBefore(tokenB)
        ? [tokenA, tokenB]
        : [tokenB, tokenA];
      return [token0, token1];
    });
  }, [chainId, poolKeys]);

  const poolAddresses: (string | undefined)[] = useMemo(() => {
    const poolDeployerAddress = chainId && POOL_DEPLOYER_ADDRESS[chainId];

    return transformed.map((value) => {
      if (!poolDeployerAddress || !value) return undefined;

      return computePoolAddress({
        poolDeployer: poolDeployerAddress,
        tokenA: value[0],
        tokenB: value[1],
      });
    });
  }, [chainId, transformed]);

  const globalState0s = useMultipleContractSingleData(
    poolAddresses,
    POOL_STATE_INTERFACE,
    'globalState',
  );

  // TODO: This is a bug, if all of the pool addresses error out, and the last call to use pools was from a different hook
  // You will get the results which don't match the pool keys
  const prevGlobalState0s = usePreviousNonErroredArray(globalState0s);

  const _globalState0s = useMemo(() => {
    if (!prevGlobalState0s || !globalState0s || globalState0s.length === 1)
      return globalState0s;

    if (
      globalState0s.every((el) => el.error) &&
      !prevGlobalState0s.every((el) => el.error)
    )
      return prevGlobalState0s;

    return globalState0s;
  }, [prevGlobalState0s, globalState0s]);

  const liquidities = useMultipleContractSingleData(
    poolAddresses,
    POOL_STATE_INTERFACE,
    'liquidity',
  );
  const prevLiquidities = usePreviousNonErroredArray(liquidities);

  const _liquidities = useMemo(() => {
    if (!prevLiquidities || !liquidities || liquidities.length === 1)
      return liquidities;

    if (
      liquidities.every((el) => el.error) &&
      !prevLiquidities.every((el) => el.error)
    )
      return prevLiquidities;

    return liquidities;
  }, [prevLiquidities, liquidities]);

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const [token0, token1] = transformed[index] ?? [];
      if (!token0 || !token1) return [PoolState.INVALID, null];

      const {
        result: globalState,
        loading: globalStateLoading,
        valid: globalStateValid,
      } = _globalState0s[index];
      const {
        result: liquidity,
        loading: liquidityLoading,
        valid: liquidityValid,
      } = _liquidities[index];

      if (!globalStateValid || !liquidityValid)
        return [PoolState.INVALID, null];
      if (globalStateLoading || liquidityLoading)
        return [PoolState.LOADING, null];

      if (!globalState || !liquidity) return [PoolState.NOT_EXISTS, null];

      if (!globalState.price || globalState.price.eq(0))
        return [PoolState.NOT_EXISTS, null];

      try {
        return [
          PoolState.EXISTS,
          new Pool(
            token0,
            token1,
            globalState.fee,
            globalState.price,
            liquidity[0],
            globalState.tick,
          ),
        ];
      } catch (error) {
        return [PoolState.NOT_EXISTS, null];
      }
    });
  }, [_liquidities, poolKeys, _globalState0s, transformed]);
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  // feeAmount: FeeAmount | undefined
): [PoolState, Pool | null] {
  const poolKeys: [
    Currency | undefined,
    Currency | undefined,
  ][] = useMemo(() => [[currencyA, currencyB]], [currencyA, currencyB]);

  return usePools(poolKeys)[0];
}

export function useTokensSymbols(token0: string, token1: string) {
  const _token0 = useToken(token0);
  const _token1 = useToken(token1);

  return useMemo(() => [_token0, _token1], [_token0, _token1]);
}
