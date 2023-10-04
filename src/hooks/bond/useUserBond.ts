import { BillVersion } from '@ape.swap/apeswap-lists';
import { useActiveWeb3React } from 'hooks';
import { Bond, BondConfig, UserBond } from 'types/bond';
import bondABI from 'constants/abis/bond.json';
import erc20ABI from 'constants/abis/erc20.json';
import {
  useMultipleContractsMultipleData,
  useMultipleContractSingleData,
} from 'state/multicall/v3/hooks';
import { Interface } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { useBondContracts } from 'hooks/useContract';

export const useUserOwnedBonds = (bonds: Bond[]) => {
  const { chainId, account } = useActiveWeb3React();
  const bondAddresses = bonds.map(
    (bond) => bond.contractAddress[chainId] ?? '',
  );
  const bondContracts = useBondContracts(bondAddresses);
  const bondIdCalls = useMultipleContractSingleData(
    bondAddresses,
    new Interface(bondABI),
    'getBillIds',
    [account],
  );
  const bondIds: string[][] = bondIdCalls.map((call) =>
    !call.loading && call.result && call.result.length > 0
      ? call.result[0].map((id: any) => id.toString())
      : [],
  );

  const bondDataCalls = useMultipleContractsMultipleData(
    bondContracts,
    bonds.map((bond) =>
      bond.billVersion === BillVersion.V2 ? 'getBillInfo' : 'billInfo',
    ),
    bonds.map((_, ind) => bondIds[ind].map((id) => [id])),
  );

  const bondsData = bondDataCalls.map((callStates, ind) => {
    return callStates.map((call) => {
      const data = !call.loading ? call.result : undefined;
      return { loading: call.loading, data };
    });
  });

  const bondPendingRewardCalls = useMultipleContractsMultipleData(
    bondContracts,
    bonds.map((bond) =>
      bond.billVersion === BillVersion.V2
        ? 'claimablePayout'
        : 'pendingPayoutFor',
    ),
    bonds.map((_, ind) => bondIds[ind].map((id: any) => [id])),
  );

  const bondsPendingRewards = bondPendingRewardCalls.map((callStates, ind) => {
    return callStates.map((call) => {
      const data =
        !call.loading && call.result && call.result.length > 0
          ? call.result[0]
          : undefined;
      return { loading: call.loading, data };
    });
  });

  const userBonds: UserBond[] = bonds.reduce((memo: UserBond[], bond, ind) => {
    const idArray = bondIds[ind];
    const bondData = bondsData[ind];
    const bondPendingRewards = bondsPendingRewards[ind];
    const bondAddress = bond.contractAddress[chainId] ?? '';
    idArray.forEach((id, index) => {
      const userBondData = bondData[index];
      const userBondPendingReward = bondPendingRewards[index];
      const userbond = memo.find(
        (item) =>
          item.address.toLowerCase() === bondAddress.toLowerCase() &&
          item.id === id,
      );
      const loading = userBondData.loading || userBondPendingReward.loading;
      if (!userbond) {
        if (bond.billVersion === BillVersion.V2) {
          const userBondDetail =
            userBondData.data && userBondData.data.length > 0
              ? userBondData.data[0]
              : undefined;
          memo.push({
            loading,
            address: bondAddress,
            id,
            payout:
              userBondDetail && userBondDetail.payout > 0
                ? userBondDetail.payout.toString()
                : undefined,
            vesting:
              userBondDetail && userBondDetail.vesting
                ? userBondDetail.vesting.toString()
                : undefined,
            lastBlockTimestamp:
              userBondDetail && userBondDetail.lastClaimTimestamp
                ? userBondDetail.lastClaimTimestamp.toString()
                : undefined,
            truePricePaid:
              userBondDetail && userBondDetail.truePricePaid
                ? userBondDetail.truePricePaid.toString()
                : undefined,
            pendingRewards: userBondPendingReward.data
              ? userBondPendingReward.data.toString()
              : undefined,
            bond,
          });
        } else {
          memo.push({
            address: bondAddress,
            id,
            payout:
              userBondData.data &&
              userBondData.data.length > 0 &&
              userBondData.data[0]
                ? userBondData.data[0].toString()
                : undefined,
            vesting:
              userBondData.data &&
              userBondData.data.length > 1 &&
              userBondData.data[1]
                ? userBondData.data[1].toString()
                : undefined,
            lastBlockTimestamp:
              userBondData.data &&
              userBondData.data.length > 2 &&
              userBondData.data[2]
                ? userBondData.data[2].toString()
                : undefined,
            truePricePaid:
              userBondData.data &&
              userBondData.data.length > 3 &&
              userBondData.data[3]
                ? userBondData.data[3].toString()
                : undefined,
            pendingRewards: userBondPendingReward.data
              ? userBondPendingReward.data.toString()
              : undefined,
            loading,
            bond,
          });
        }
      }
    });

    return memo;
  }, []);

  return userBonds;
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
