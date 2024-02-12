import { calculateGasMargin } from 'utils';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { useMerklContract } from 'hooks/useContract';
import { useActiveWeb3React } from 'hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useClaimMerklRewards = () => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const [claiming, setClaiming] = useState(false);
  const merklDistributorContract = useMerklContract();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const claimReward = async () => {
    if (!merklDistributorContract || !account) return;
    setClaiming(true);
    let data: any;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_MERKL_API_URL}?chainIds[]=${chainId}&AMMs[]=quickswapalgebra&user=${account}`,
      );
      const merklData = await res.json();
      data =
        merklData && merklData[chainId]
          ? merklData[chainId].transactionData
          : undefined;
    } catch {
      setClaiming(false);
      throw 'Angle API not responding';
    }
    // Distributor address is the same across different chains
    const tokens = Object.keys(data).filter((k) => data[k].proof !== undefined);
    const claims = tokens.map((t) => data[t].claim);
    const proofs = tokens.map((t) => data[t].proof);

    try {
      const estimatedGas = await merklDistributorContract.estimateGas.claim(
        tokens.map((t) => account),
        tokens,
        claims,
        proofs as string[][],
      );
      const response: TransactionResponse = await merklDistributorContract.claim(
        tokens.map((t) => account),
        tokens,
        claims,
        proofs as string[][],
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      );
      addTransaction(response, {
        summary: t('claimingReward'),
      });
      const receipt = await response.wait();
      finalizedTransaction(receipt, {
        summary: t('claimedReward'),
      });
      setClaiming(false);
    } catch {
      setClaiming(false);
    }
  };

  return { claiming, claimReward };
};
