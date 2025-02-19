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
    let resRewards: any;
    try {
      const merklAPIURL = process.env.REACT_APP_MERKL_API_URL;
      const res = await fetch(
        `${merklAPIURL}/v4/users/${account}/rewards?chainId=${chainId}`,
      );
      resRewards = await res.json();
    } catch {
      setClaiming(false);
      throw 'Angle API not responding';
    }
    if ((resRewards as any[]).length < 1) {
      return;
    }
    const rewards = resRewards[0];
    // Distributor address is the same across different chains
    const tokens = rewards.rewards.map(
      (reward: { token: { address: string } }) => reward.token.address,
    );
    const claims = rewards.rewards.map(
      (reward: { amount: string }) => reward.amount,
    );
    const proofs = rewards.rewards.map(
      (reward: { proofs: any }) => reward.proofs,
    );

    try {
      const estimatedGas = await merklDistributorContract.estimateGas.claim(
        tokens.map(() => account),
        tokens,
        claims,
        proofs as string[][],
      );
      const response: TransactionResponse = await merklDistributorContract.claim(
        tokens.map(() => account),
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
