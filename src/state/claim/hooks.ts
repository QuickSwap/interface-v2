import { GlobalValue } from 'constants/index';
import { TokenAmount, JSBI } from '@uniswap/sdk';
import { TransactionResponse } from '@ethersproject/providers';
import { useEffect, useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import { useMerkleDistributorContract } from 'hooks/useContract';
import { useSingleCallResult } from 'state/multicall/hooks';
import { calculateGasMargin, formatTokenAmount } from 'utils';
import { useTransactionAdder } from 'state/transactions/hooks';

interface UserClaimData {
  index: number;
  amount: string;
  proof: string[];
  flags?: {
    isSOCKS: boolean;
    isLP: boolean;
    isUser: boolean;
  };
}
// parse distributorContract blob and detect if user has claim data
// null means we know it does not
export function useUserClaimData(
  account: string | null | undefined,
): UserClaimData | null | undefined {
  const { chainId } = useActiveWeb3React();

  const key = `${chainId}:${account}`;
  const [claimInfo] = useState<{ [key: string]: UserClaimData | null }>({});

  useEffect(() => {
    return;
  }, [account, chainId, key]);

  return account && chainId ? claimInfo[key] : undefined;
}

// check if user is in blob and has not yet claimed UNI
export function useUserHasAvailableClaim(
  account: string | null | undefined,
): boolean {
  const userClaimData = useUserClaimData(account);
  const distributorContract = useMerkleDistributorContract();
  const isClaimedResult = useSingleCallResult(
    distributorContract,
    'isClaimed',
    [userClaimData?.index],
  );
  // user is in blob and contract marks as unclaimed
  return Boolean(
    userClaimData &&
      !isClaimedResult.loading &&
      isClaimedResult.result?.[0] === false,
  );
}

export function useUserUnclaimedAmount(
  account: string | null | undefined,
): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React();
  const userClaimData = useUserClaimData(account);
  const canClaim = useUserHasAvailableClaim(account);

  const uni = chainId ? GlobalValue.tokens.UNI[chainId] : undefined;
  if (!uni) return undefined;
  if (!canClaim || !userClaimData) {
    return new TokenAmount(uni, JSBI.BigInt(0));
  }
  return new TokenAmount(uni, JSBI.BigInt(userClaimData.amount));
}

export function useClaimCallback(
  account: string | null | undefined,
): {
  claimCallback: () => Promise<string>;
} {
  // get claim data for this account
  const { library, chainId } = useActiveWeb3React();
  const claimData = useUserClaimData(account);

  // used for popup summary
  const unClaimedAmount: TokenAmount | undefined = useUserUnclaimedAmount(
    account,
  );
  const addTransaction = useTransactionAdder();
  const distributorContract = useMerkleDistributorContract();

  const claimCallback = async function() {
    if (!claimData || !account || !library || !chainId || !distributorContract)
      return;

    const args = [claimData.index, account, claimData.amount, claimData.proof];

    return distributorContract.estimateGas['claim'](...args, {}).then(
      (estimatedGasLimit) => {
        return distributorContract
          .claim(...args, {
            value: null,
            gasLimit: calculateGasMargin(estimatedGasLimit),
          })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Claimed ${formatTokenAmount(unClaimedAmount)} QUICK`,
              claim: { recipient: account },
            });
            return response.hash;
          });
      },
    );
  };

  return { claimCallback };
}
