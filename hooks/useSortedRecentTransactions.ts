import { useAllTransactions } from '../state/transactions/hooks';
import { useMemo } from 'react';

export function useSortedRecentTransactions() {
  const allTransactions = useAllTransactions();

  return useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs
      .filter((tx) => new Date().getTime() - tx.addedTime < 86_400_000)
      .sort((a, b) => b.addedTime - a.addedTime);
  }, [allTransactions]);
}
