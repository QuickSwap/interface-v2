import {
  POOL_DEPLOYER_ADDRESS,
  UNI_V3_FACTORY_ADDRESS,
  ALGEBRA_INTEGRAL_POOL_DEPLOYER_ADDRESS,
} from 'constants/v3/addresses';
import { Currency, Token } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { useActiveWeb3React } from 'hooks';
import { useMultipleContractSingleData } from 'state/multicall/v3/hooks';
import { Interface } from '@ethersproject/abi';
import abi from 'constants/abis/v3/pool.json';
import uniV3ABI from 'constants/abis/v3/univ3Pool.json';
import { computePoolAddress } from 'v3lib/utils/computePoolAddress';
import { useToken } from './Tokens';
import { Pool } from 'v3lib/entities/pool';
import { usePreviousNonErroredArray } from 'hooks/usePrevious';
import { FeeAmount } from 'v3lib/utils';

const POOL_STATE_INTERFACE = new Interface(abi);
const UNIV3POOL_STATE_INTERFACE = new Interface(uniV3ABI);

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePools(
  poolKeys: [
    Currency | undefined,
    Currency | undefined,
    FeeAmount | undefined,
  ][],
  isUni?: boolean,
  isAlgebraIntegral?: boolean,
): [PoolState, Pool | null][] {
  const { chainId } = useActiveWeb3React();

  const transformed: (
    | [Token, Token, FeeAmount | undefined]
    | null
  )[] = useMemo(() => {
    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (!chainId || !currencyA || !currencyB) return null;

      const tokenA = currencyA?.wrapped;
      const tokenB = currencyB?.wrapped;
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return null;
      const [token0, token1] = tokenA.sortsBefore(tokenB)
        ? [tokenA, tokenB]
        : [tokenB, tokenA];
      return [token0, token1, feeAmount];
    });
  }, [chainId, poolKeys]);

  const poolAddresses: (string | undefined)[] = useMemo(() => {
    return transformed.map((value) => {
      const poolDeployerAddress =
        chainId && value && value[2]
          ? UNI_V3_FACTORY_ADDRESS[chainId]
          : isAlgebraIntegral
          ? ALGEBRA_INTEGRAL_POOL_DEPLOYER_ADDRESS[chainId]
          : POOL_DEPLOYER_ADDRESS[chainId];
      if (!poolDeployerAddress || !value) return undefined;

      return computePoolAddress({
        poolDeployer: poolDeployerAddress,
        tokenA: value[0],
        tokenB: value[1],
        fee: value[2],
      });
    });
  }, [chainId, transformed, isAlgebraIntegral]);

  const globalState0s = useMultipleContractSingleData(
    poolAddresses,
    isUni ? UNIV3POOL_STATE_INTERFACE : POOL_STATE_INTERFACE,
    isUni ? 'slot0' : 'globalState',
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
    isUni ? UNIV3POOL_STATE_INTERFACE : POOL_STATE_INTERFACE,
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
      const [token0, token1, fee] = transformed[index] ?? [];
      const globalState0s =
        _globalState0s.length < index ? undefined : _globalState0s[index];
      const liquidities =
        _liquidities.length < index ? undefined : _liquidities[index];
      if (!token0 || !token1 || !globalState0s || !liquidities)
        return [PoolState.INVALID, null];

      const {
        result: globalState,
        loading: globalStateLoading,
        valid: globalStateValid,
      } = globalState0s;
      const {
        result: liquidity,
        loading: liquidityLoading,
        valid: liquidityValid,
      } = liquidities;

      if (!globalStateValid || !liquidityValid)
        return [PoolState.INVALID, null];
      if (globalStateLoading || liquidityLoading)
        return [PoolState.LOADING, null];

      if (!globalState || !liquidity) return [PoolState.NOT_EXISTS, null];

      const poolPrice = globalState
        ? isUni
          ? globalState.sqrtPriceX96
          : globalState.price
        : undefined;
      if (!poolPrice || poolPrice.eq(0)) return [PoolState.NOT_EXISTS, null];

      try {
        return [
          PoolState.EXISTS,
          new Pool(
            token0,
            token1,
            isUni ? fee : globalState.fee,
            poolPrice,
            liquidity[0],
            globalState.tick,
            undefined,
            isUni,
          ),
        ];
      } catch (error) {
        return [PoolState.NOT_EXISTS, null];
      }
    });
  }, [poolKeys, transformed, _globalState0s, _liquidities, isUni]);
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount?: FeeAmount,
  isUni?: boolean,
  isAlgebraIntegral?: boolean,
): [PoolState, Pool | null] {
  const poolKeys: [
    Currency | undefined,
    Currency | undefined,
    FeeAmount | undefined,
  ][] = useMemo(() => [[currencyA, currencyB, feeAmount]], [
    currencyA,
    currencyB,
    feeAmount,
  ]);

  return usePools(poolKeys, isUni, isAlgebraIntegral)[0];
}

export function useTokensSymbols(token0: string, token1: string) {
  const _token0 = useToken(token0);
  const _token1 = useToken(token1);

  return useMemo(() => [_token0, _token1], [_token0, _token1]);
}
