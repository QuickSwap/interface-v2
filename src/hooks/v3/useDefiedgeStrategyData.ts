import { formatUnits } from 'ethers/lib/utils';
import { useDefiedgeStrategyContract } from 'hooks/useContract';
import { useState } from 'react';
import { useSingleCallResult } from 'state/multicall/v3/hooks';

export function useDefiedgeStrategyData(strategy: string) {
  const strategyContract = useDefiedgeStrategyContract(strategy);
  const totalSupplyResult = useSingleCallResult(
    strategyContract,
    'totalSupply',
  );

  const [amounts, setAmounts] = useState<{
    amount0: number;
    amount1: number;
  }>();

  strategyContract?.callStatic
    .getAUMWithFees(true)
    .then((data) => {
      setAmounts({
        amount0: Number(formatUnits(data.amount0.add(data.totalFee0), 18)),
        amount1: Number(formatUnits(data.amount1.add(data.totalFee1), 18)),
      });
    })
    .catch((e) => {
      console.warn(e);
    });

  return {
    totalSupply:
      totalSupplyResult.result &&
      Number(formatUnits(totalSupplyResult.result[0] ?? 0, 18)),
    amount0: amounts?.amount0,
    amount1: amounts?.amount1,
  };
}
