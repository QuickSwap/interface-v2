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
import { TransactionType } from 'models/enums';

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
      const merklAPIURL = process.env.REACT_APP_MERKL_API_URL;
      const res = await fetch(
        `${merklAPIURL}/v3/userRewards?chainId=${chainId}&user=${account}&proof=true`,
      );
      data = await res.json();
    } catch {
      setClaiming(false);
      throw 'Angle API not responding';
    }
    // Distributor address is the same across different chains
    const tokens = Object.keys(data).filter((k) => data[k].proof !== undefined);
    const claims = tokens.map((t) => data[t].accumulated);
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
        type: TransactionType.CLAIMED_REWARDS,
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
