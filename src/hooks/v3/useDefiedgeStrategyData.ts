import { Interface, formatUnits } from 'ethers/lib/utils';
import { useContract, useDefiedgeStrategyContract } from 'hooks/useContract';
import { useEffect, useState } from 'react';
import {
  useMultipleContractSingleData,
  useSingleCallResult,
} from 'state/multicall/v3/hooks';
import PoolABI from 'constants/abis/v3/pool.json';
import { TickMath, tickToPrice } from 'v3lib/utils';
import { BigNumber } from 'ethers';
import DEFIEDGE_STRATEGY_ABI from 'constants/abis/defiedge-strategy.json';
import { useActiveWeb3React } from 'hooks';
import { getAllDefiedgeStrategies } from 'utils';
import { Token } from '@uniswap/sdk';
import { useQuery } from '@tanstack/react-query';

export function useDefiedgeStrategyData(strategy?: string) {
  const strategyContract = useDefiedgeStrategyContract(strategy);
  const totalSupplyResult = useSingleCallResult(
    strategyContract,
    'totalSupply',
  );

  const { isLoading, data } = useQuery({
    queryKey: ['defiEdge-strategy-amounts', strategy],
    queryFn: async () => {
      if (!strategyContract) return null;
      const data = await strategyContract?.callStatic.getAUMWithFees(true);
      return {
        amount0: BigNumber.from(data.amount0).add(
          BigNumber.from(data.totalFee0),
        ),
        amount1: BigNumber.from(data.amount1).add(
          BigNumber.from(data.totalFee1),
        ),
      };
    },
  });

  return {
    loading: isLoading || totalSupplyResult.loading,
    totalSupply:
      totalSupplyResult.result &&
      Number(formatUnits(totalSupplyResult.result[0] ?? 0, 18)),
    amount0: data?.amount0,
    amount1: data?.amount1,
  };
}

function getRatio(p: number, pmin: number, pmax: number) {
  const sqp = Math.sqrt(p);
  return (sqp * (sqp - Math.sqrt(pmin))) / (1 - sqp / Math.sqrt(pmax));
}

export function useDefiedgeTicks(strategyAddress: string, poolAddress: string) {
  const strategyContract = useDefiedgeStrategyContract(strategyAddress);
  const poolContract = useContract(poolAddress, new Interface(PoolABI));

  const ticksResult = useSingleCallResult(strategyContract, 'ticks', [0]);
  const currentTickResult = useSingleCallResult(poolContract, 'globalState');

  const strategyTicksResult =
    !ticksResult.loading && ticksResult.result && ticksResult.result.length > 0
      ? ticksResult.result
      : undefined;

  const tickLower = strategyTicksResult ? strategyTicksResult[0] : undefined;
  const tickUpper = strategyTicksResult ? strategyTicksResult[1] : undefined;
  const currentTick =
    !currentTickResult.loading &&
    currentTickResult.result &&
    currentTickResult.result.length > 1 &&
    currentTickResult.result[1];

  const loading = ticksResult.loading || currentTickResult.loading;

  return {
    tickLower,
    tickUpper,
    currentTick,
    loading,
  };
}

export function useDefiedgeLiquidityRatio(
  strategyAddress: string,
  poolAddress: string,
  token0: any,
  token1: any,
) {
  const [ratio, setRatio] = useState<number | null>(null);

  const { tickLower, tickUpper, currentTick, loading } = useDefiedgeTicks(
    strategyAddress,
    poolAddress,
  );

  useEffect(() => {
    if (!loading && tickLower && tickUpper && currentTick) {
      const pa = +tickToPrice(token0, token1, tickLower).toSignificant(6);
      const pb = +tickToPrice(token0, token1, tickUpper).toSignificant(6);
      const cp = +tickToPrice(token0, token1, currentTick).toSignificant(6);

      setRatio(getRatio(cp, pa, pb));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return {
    loading,
    ratio,
  };
}

export function useDefiEdgeRangeTitles(addresses: string[]) {
  const ticksResult = useMultipleContractSingleData(
    addresses,
    new Interface(DEFIEDGE_STRATEGY_ABI),
    'ticks',
    [0],
  );

  return addresses.map((address, ind) => {
    const callData = ticksResult[ind];
    const strategyTicksResult =
      !callData.loading && callData.result && callData.result.length > 0
        ? callData.result
        : undefined;

    const tickLower = strategyTicksResult ? strategyTicksResult[0] : undefined;
    const tickUpper = strategyTicksResult ? strategyTicksResult[1] : undefined;

    const isTicksAtLimit =
      tickLower === TickMath.MIN_TICK && tickUpper === TickMath.MAX_TICK;
    return {
      address,
      title: callData.loading ? '' : isTicksAtLimit ? 'Full' : 'Narrow',
    };
  });
}

export function useDefiEdgePosition(
  address?: string,
  token0?: Token,
  token1?: Token,
) {
  const { chainId, account } = useActiveWeb3React();
  const strategy = getAllDefiedgeStrategies(chainId).find(
    (item) => address && item.id.toLowerCase() === address.toLowerCase(),
  );
  const defiEdgeContract = useContract(address, DEFIEDGE_STRATEGY_ABI);
  const lpBalancesData = useSingleCallResult(defiEdgeContract, 'balanceOf', [
    account ?? undefined,
  ]);
  const { loading, totalSupply, amount0, amount1 } = useDefiedgeStrategyData(
    address,
  );
  const amount =
    !lpBalancesData.loading &&
    lpBalancesData.result &&
    lpBalancesData.result.length > 0
      ? Number(formatUnits(lpBalancesData.result[0], 18))
      : 0;
  if (strategy) {
    const amount0Number = amount0
      ? Number(formatUnits(amount0, token0?.decimals))
      : 0;
    const amount1Number = amount1
      ? Number(formatUnits(amount1, token1?.decimals))
      : 0;
    const balance0 =
      amount0 && totalSupply && amount0Number * (amount / totalSupply);
    const balance1 =
      amount1 && totalSupply && amount1Number * (amount / totalSupply);
    return {
      loading: lpBalancesData.loading || loading,
      data: {
        ...strategy,
        share: amount,
        lpAmount: amount,
        token0,
        token1,
        balance0,
        balance1,
      },
    };
  }
  return { loading: false };
}
