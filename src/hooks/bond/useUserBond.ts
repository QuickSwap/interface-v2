import { BillVersion } from '@ape.swap/apeswap-lists';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { useActiveWeb3React } from 'hooks';
import { Bond, BondConfig, UserBond } from 'types/bond';
import { ChainId } from '@uniswap/sdk';
import bondABI from 'constants/abis/bond.json';
import erc20ABI from 'constants/abis/erc20.json';
import {
  useMultipleContractMultipleData,
  useMultipleContractSingleData,
  useSingleCallResult,
} from 'state/multicall/v3/hooks';
import { Interface } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { useBondContract, useContract } from 'hooks/useContract';

export const useUserOwnedBond = (bond: Bond) => {
  const { chainId, account } = useActiveWeb3React();
  const bondContract = useBondContract(bond.contractAddress[chainId] ?? '');
  const bondIdCall = useSingleCallResult(bondContract, 'getBillIds', [account]);
  const bondId =
    !bondIdCall.loading && bondIdCall.result && bondIdCall.result.length > 0
      ? bondIdCall.result[0].toString()
      : undefined;

  const bondDataCall = useSingleCallResult(
    bondContract,
    bond.billVersion === BillVersion.V2 ? 'getBillInfo' : 'billInfo',
    [bondId],
  );
  const bondData =
    !bondDataCall.loading && bondDataCall.result
      ? bondDataCall.result
      : undefined;

  const bondPendingRewardCall = useSingleCallResult(
    bondContract,
    bond.billVersion === BillVersion.V2
      ? 'claimablePayout'
      : 'pendingPayoutFor',
    [bondId],
  );

  const bondPendingReward =
    !bondPendingRewardCall.loading && bondPendingRewardCall.result
      ? bondPendingRewardCall.result
      : undefined;

  const bondNFTCall = useSingleCallResult(bondContract, 'billNFT');

  const bondNFT =
    !bondNFTCall.loading && bondNFTCall.result ? bondNFTCall.result : undefined;

  return;

  // const data =
  //   bond.billVersion === BillVersion.V2
  //     ? {
  //         address: bondPendingRewardCall.result.address,
  //         id: billsPendingRewardCall[i].params[0].toString(),
  //         payout: new BigNumber(billData[billDataPos][0]?.payout.toString())
  //           .minus(billData[billDataPos][0]?.payoutClaimed.toString())
  //           .toString(),
  //         billNftAddress: billData[billDataPos + 1][0].toString(),
  //         vesting: billData[billDataPos][0]?.vesting.toString(),
  //         lastBlockTimestamp: billData[
  //           billDataPos
  //         ][0]?.lastClaimTimestamp.toString(),
  //         truePricePaid: billData[billDataPos][0]?.truePricePaid.toString(),
  //         pendingRewards: pendingRewardsCall[i][0].toString(),
  //       }
  //     : {
  //         address: billsPendingRewardCall[i].address,
  //         id: billsPendingRewardCall[i].params[0].toString(),
  //         payout: billData[billDataPos][0].toString(),
  //         billNftAddress: billData[billDataPos + 1][0].toString(),
  //         vesting: billData[billDataPos][1].toString(),
  //         lastBlockTimestamp: billData[billDataPos][2].toString(),
  //         truePricePaid: billData[billDataPos][3].toString(),
  //         pendingRewards: pendingRewardsCall[i][0].toString(),
  //       };

  // return data;
};

export const useBondUserBalances = (bonds: BondConfig[] | undefined) => {
  const { account, chainId } = useActiveWeb3React();
  const balanceCalls = useMultipleContractSingleData(
    account && bonds ? bonds.map((b) => b.lpToken.address[chainId]) : [],
    new Interface(erc20ABI),
    'balanceOf',
    account ? [account] : [],
  );

  const tokenBalances = useMemo(() => {
    if (!bonds) return {};
    return bonds.reduce((acc, bond, index) => {
      const bondAddress = bond.contractAddress[chainId];
      if (bondAddress) {
        const balanceCall = balanceCalls[index];
        const balance =
          !balanceCall.loading &&
          balanceCall.result &&
          balanceCall.result.length > 0
            ? balanceCall.result[0].toString()
            : undefined;
        acc = { ...acc, [bondAddress]: balance };
      }
      return acc;
    }, {});
  }, [balanceCalls, bonds, chainId]);

  return tokenBalances;
};
