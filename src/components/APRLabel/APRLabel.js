import React from "react";

import useSWR from "swr";

import {
  PLACEHOLDER_ACCOUNT,
  fetcher,
  formatKeyAmount,
  getBalanceAndSupplyData,
  getDepositBalanceData,
  getStakingData,
  getProcessedData,
} from "../../Helpers";

import Vault from "../../abis/Vault.json";
import Reader from "../../abis/Reader.json";
import RewardReader from "../../abis/RewardReader.json";
import QlpManager from "../../abis/QlpManager.json";

import { useWeb3React } from "@web3-react/core";

import { getContract } from "../../Addresses";

export default function APRLabel({ chainId, label }) {
  let { active } = useWeb3React();

  const rewardReaderAddress = getContract(chainId, "RewardReader");
  const readerAddress = getContract(chainId, "Reader");

  const vaultAddress = getContract(chainId, "Vault");
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN");
  const qlpAddress = getContract(chainId, "QLP");


  const stakedQlpTrackerAddress = getContract(chainId, "StakedQlpTracker");
  const feeQlpTrackerAddress = getContract(chainId, "FeeQlpTracker");

  const qlpManagerAddress = getContract(chainId, "QlpManager");

  const walletTokens = [qlpAddress];
  const depositTokens = [

    qlpAddress,
  ];
  const rewardTrackersForDepositBalances = [

    feeQlpTrackerAddress,
  ];
  const rewardTrackersForStakingInfo = [
    stakedQlpTrackerAddress,
    feeQlpTrackerAddress,
  ];

  const { data: walletBalances } = useSWR(
    [`StakeV2:walletBalances:${active}`, chainId, readerAddress, "getTokenBalancesWithSupplies", PLACEHOLDER_ACCOUNT],
    {
      fetcher: fetcher(undefined, Reader, [walletTokens]),
    }
  );

  const { data: depositBalances } = useSWR(
    [`StakeV2:depositBalances:${active}`, chainId, rewardReaderAddress, "getDepositBalances", PLACEHOLDER_ACCOUNT],
    {
      fetcher: fetcher(undefined, RewardReader, [depositTokens, rewardTrackersForDepositBalances]),
    }
  );

  const { data: stakingInfo } = useSWR(
    [`StakeV2:stakingInfo:${active}`, chainId, rewardReaderAddress, "getStakingInfo", PLACEHOLDER_ACCOUNT],
    {
      fetcher: fetcher(undefined, RewardReader, [rewardTrackersForStakingInfo]),
    }
  );



  const { data: aums } = useSWR([`StakeV2:getAums:${active}`, chainId, qlpManagerAddress, "getAums"], {
    fetcher: fetcher(undefined, QlpManager),
  });

  const { data: nativeTokenPrice } = useSWR(
    [`StakeV2:nativeTokenPrice:${active}`, chainId, vaultAddress, "getMinPrice", nativeTokenAddress],
    {
      fetcher: fetcher(undefined, Vault),
    }
  );


  let aum;
  if (aums && aums.length > 0) {
    aum = aums[0].add(aums[1]).div(2);
  }

  const { balanceData, supplyData } = getBalanceAndSupplyData(walletBalances);
  const depositBalanceData = getDepositBalanceData(depositBalances);
  const stakingData = getStakingData(stakingInfo);


  const processedData = getProcessedData(
    balanceData,
    supplyData,
    depositBalanceData,
    stakingData,
    aum,
    nativeTokenPrice,
  );

  return <>{`${formatKeyAmount(processedData, label, 2, 2, true)}%`}</>;
}
