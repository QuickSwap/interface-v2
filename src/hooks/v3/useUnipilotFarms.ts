import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';
import { Interface, formatUnits } from 'ethers/lib/utils';
import { useMultipleContractSingleData } from 'state/multicall/v3/hooks';
import {
  getTokenFromAddress,
  getUnipilotFarmData,
  getUnipilotFarms,
  getUnipilotUserFarms,
} from 'utils';
import { BigNumber } from 'ethers';
import { Token } from '@uniswap/sdk';
import UNIPILOT_SINGLE_REWARD_ABI from 'constants/abis/unipilot-single-reward.json';
import UNIPILOT_DUAL_REWARD_ABI from 'constants/abis/unipilot-dual-reward.json';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { GlobalConst, GlobalData, unipilotVaultTypes } from 'constants/index';
import { useLastTransactionHash } from 'state/transactions/hooks';
import { V3Farm } from 'pages/FarmPage/V3/Farms';
import { getConfig } from 'config/index';
import { useGetUnipilotVaults } from 'state/mint/v3/hooks';
import { useEffect } from 'react';

interface RewardRate {
  rewardA?: BigNumber;
  rewardB?: BigNumber;
  tokenA?: Token;
  tokenB?: Token;
  address?: string;
}

export function useUnipilotFarms(chainId?: ChainId) {
  const config = getConfig(chainId);
  const unipilotAvailable = config['unipilot']['available'];
  const fetchUnipilotFarms = async () => {
    if (!unipilotAvailable || !chainId) return [];
    const unipilotFarms = await getUnipilotFarms(chainId);
    return unipilotFarms;
  };

  const { isLoading: farmsLoading, data } = useQuery({
    queryKey: ['fetchUnipilotFarms', chainId],
    queryFn: fetchUnipilotFarms,
    refetchInterval: 300000,
  });

  return { loading: farmsLoading, data };
}

export function useUnipilotFarmData(
  farmAddresses?: string[],
  chainId?: ChainId,
) {
  const config = getConfig(chainId);
  const unipilotAvailable = config['unipilot']['available'];
  const fetchUnipilotFarmData = async () => {
    if (!chainId || !unipilotAvailable) return null;
    const unipilotFarms = await getUnipilotFarmData(farmAddresses, chainId);
    return unipilotFarms;
  };

  const { isLoading, data } = useQuery({
    queryKey: ['fetchUnipilotFarmData', farmAddresses, chainId],
    queryFn: fetchUnipilotFarmData,
    refetchInterval: 300000,
  });

  return { loading: isLoading, data };
}

export function useUnipilotUserFarms(chainId?: ChainId, account?: string) {
  const config = getConfig(chainId);
  const unipilotAvailable = config['unipilot']['available'];
  const fetchUnipilotUserFarms = async () => {
    if (!chainId || !unipilotAvailable) return [];
    const unipilotFarms = await getUnipilotUserFarms(chainId, account);
    return unipilotFarms
      ? unipilotFarms.filter((farm: any) => farm.rewards.length > 0)
      : [];
  };

  const lastTxHash = useLastTransactionHash();
  const { isLoading: farmsLoading, data, refetch } = useQuery({
    queryKey: ['fetchUnipilotUserFarms', chainId, account],
    queryFn: fetchUnipilotUserFarms,
    refetchInterval: 300000,
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTxHash]);

  return { loading: farmsLoading, data };
}

export function useUnipilotFilteredFarms(
  unipilotFarms: any[],
  unipilotFarmData: any,
  farmFilter?: string,
  searchVal?: string,
  sortBy?: string,
  sortDesc?: boolean,
) {
  const { v3FarmSortBy, v3FarmFilter } = GlobalConst.utils;
  const sortMultiplier = sortDesc ? -1 : 1;
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const singleFarmAddresses = unipilotFarms
    .filter((farm: any) => !farm.isDualReward)
    .map((farm: any) => farm.id);
  const unipilotVaults = useGetUnipilotVaults();
  const singleRewardRateResults = useMultipleContractSingleData(
    singleFarmAddresses,
    new Interface(UNIPILOT_SINGLE_REWARD_ABI),
    'rewardRate',
    [],
  );
  const singleRewardTokenResults = useMultipleContractSingleData(
    singleFarmAddresses,
    new Interface(UNIPILOT_SINGLE_REWARD_ABI),
    'rewardsToken',
    [],
  );
  const singleRewardRates: RewardRate[] = singleRewardRateResults.map(
    (callData, index) => {
      const rewardRate =
        !callData.loading && callData.result && callData.result.length > 0
          ? callData.result[0]
          : undefined;
      const rewardTokenResult =
        singleRewardTokenResults.length >= index
          ? singleRewardTokenResults[index]
          : undefined;
      const rewardTokenAddress =
        rewardTokenResult &&
        !rewardTokenResult.loading &&
        rewardTokenResult.result &&
        rewardTokenResult.result.length > 0
          ? rewardTokenResult.result[0]
          : '';
      const rewardToken = getTokenFromAddress(
        rewardTokenAddress,
        chainId,
        tokenMap,
        [],
      );
      return {
        rewardA: rewardRate,
        tokenA: rewardToken,
        rewardB: undefined,
        tokenB: undefined,
        address:
          singleFarmAddresses.length >= index
            ? singleFarmAddresses[index]
            : undefined,
      };
    },
  );

  const dualFarmAddresses = unipilotFarms
    .filter((farm: any) => farm.isDualReward)
    .map((farm: any) => farm.id);
  const dualRewardARateResults = useMultipleContractSingleData(
    dualFarmAddresses,
    new Interface(UNIPILOT_DUAL_REWARD_ABI),
    'rewardRateA',
    [],
  );
  const dualRewardBRateResults = useMultipleContractSingleData(
    dualFarmAddresses,
    new Interface(UNIPILOT_DUAL_REWARD_ABI),
    'rewardRateB',
    [],
  );
  const dualRewardTokenAResults = useMultipleContractSingleData(
    dualFarmAddresses,
    new Interface(UNIPILOT_DUAL_REWARD_ABI),
    'rewardRateA',
    [],
  );
  const dualRewardTokenBResults = useMultipleContractSingleData(
    dualFarmAddresses,
    new Interface(UNIPILOT_DUAL_REWARD_ABI),
    'rewardRateB',
    [],
  );
  const dualRewardRates: RewardRate[] = dualRewardARateResults.map(
    (callData, index) => {
      const rewardRateA =
        !callData.loading && callData.result && callData.result.length > 0
          ? callData.result[0]
          : undefined;

      const rewardRateBResult =
        dualRewardBRateResults.length >= index
          ? dualRewardBRateResults[index]
          : undefined;
      const rewardRateB =
        rewardRateBResult &&
        !rewardRateBResult.loading &&
        rewardRateBResult.result &&
        rewardRateBResult.result.length > 0
          ? rewardRateBResult.result[0]
          : undefined;

      const rewardTokenAResult =
        dualRewardTokenAResults.length >= index
          ? dualRewardTokenAResults[index]
          : undefined;
      const rewardTokenAAddress =
        rewardTokenAResult &&
        !rewardTokenAResult.loading &&
        rewardTokenAResult.result &&
        rewardTokenAResult.result.length > 0
          ? rewardTokenAResult.result[0]
          : '';
      const rewardTokenA = getTokenFromAddress(
        rewardTokenAAddress,
        chainId,
        tokenMap,
        [],
      );

      const rewardTokenBResult =
        dualRewardTokenBResults.length >= index
          ? dualRewardTokenBResults[index]
          : undefined;
      const rewardTokenBAddress =
        rewardTokenBResult &&
        !rewardTokenBResult.loading &&
        rewardTokenBResult.result &&
        rewardTokenBResult.result.length > 0
          ? rewardTokenBResult.result[0]
          : '';
      const rewardTokenB = getTokenFromAddress(
        rewardTokenBAddress,
        chainId,
        tokenMap,
        [],
      );

      return {
        rewardA: rewardRateA,
        rewardB: rewardRateB,
        tokenA: rewardTokenA,
        tokenB: rewardTokenB,
        address:
          dualFarmAddresses.length >= index
            ? dualFarmAddresses[index]
            : undefined,
      };
    },
  );

  const rewardRates = singleRewardRates.concat(dualRewardRates);

  const farmTokenAddresses = unipilotFarms.reduce(
    (memo: string[], farm: any) => {
      const rate = rewardRates.find(
        (rate) =>
          rate.address && rate.address.toLowerCase() === farm.id.toLowerCase(),
      );
      if (!memo.includes(farm.token0.id.toLowerCase())) {
        memo.push(farm.token0.id.toLowerCase());
      }
      if (!memo.includes(farm.token1.id.toLowerCase())) {
        memo.push(farm.token1.id.toLowerCase());
      }
      if (
        rate &&
        rate.tokenA &&
        !memo.includes(rate.tokenA.address.toLowerCase())
      ) {
        memo.push(rate.tokenA.address.toLowerCase());
      }
      if (
        rate &&
        rate.tokenB &&
        !memo.includes(rate.tokenB.address.toLowerCase())
      ) {
        memo.push(rate.tokenB.address.toLowerCase());
      }
      return memo;
    },
    [],
  );

  const { prices: rewardsWithUSDPrice } = useUSDCPricesFromAddresses(
    farmTokenAddresses,
  );

  const filteredFarms: V3Farm[] = unipilotFarms
    .map((farm: any) => {
      const rewardRate = rewardRates.find(
        (rate) =>
          rate.address && rate.address.toLowerCase() === farm.id.toLowerCase(),
      );
      const farmStakingAddress = farm?.stakingAddress ?? '';
      const vaultInfo = unipilotVaults.find(
        (vault) => vault.id.toLowerCase() === farmStakingAddress.toLowerCase(),
      );
      const symbolData = (vaultInfo?.symbol ?? '').split('-');
      const pairType = Number(symbolData[symbolData.length - 1]);
      const title = unipilotVaultTypes[pairType - 1];
      const totalLockedTokenA = Number(
        formatUnits(farm.totalLockedToken0, farm.token0.decimals),
      );
      const totalLockedTokenB = Number(
        formatUnits(farm.totalLockedToken1, farm.token1.decimals),
      );
      const farmTokenAUSD = rewardsWithUSDPrice?.find(
        (item) => item.address.toLowerCase() === farm.token0.id.toLowerCase(),
      );
      const farmTokenBUSD = rewardsWithUSDPrice?.find(
        (item) => item.address.toLowerCase() === farm.token1.id.toLowerCase(),
      );
      const tvl =
        totalLockedTokenA * (farmTokenAUSD?.price ?? 0) +
        totalLockedTokenB * (farmTokenBUSD?.price ?? 0);

      const farmRewardA = Number(
        formatUnits(
          rewardRate?.rewardA ?? '0',
          rewardRate?.tokenA?.decimals ?? 18,
        ),
      );
      const farmRewardB = Number(
        formatUnits(
          rewardRate?.rewardB ?? '0',
          rewardRate?.tokenB?.decimals ?? 18,
        ),
      );
      const farmRewardTokenAUSD = rewardsWithUSDPrice?.find(
        (item) =>
          rewardRate &&
          rewardRate.tokenA &&
          item.address.toLowerCase() ===
            rewardRate.tokenA.address.toLowerCase(),
      );
      const farmRewardTokenBUSD = rewardsWithUSDPrice?.find(
        (item) =>
          rewardRate &&
          rewardRate.tokenB &&
          item.address.toLowerCase() ===
            rewardRate.tokenB.address.toLowerCase(),
      );
      const rewardUSD =
        farmRewardA * (farmRewardTokenAUSD?.price ?? 0) +
        farmRewardB * (farmRewardTokenBUSD?.price ?? 0);

      const token0 = getTokenFromAddress(farm.token0.id, chainId, tokenMap, []);
      const token1 = getTokenFromAddress(farm.token1.id, chainId, tokenMap, []);

      const farmData =
        unipilotFarmData && farm && farm.id
          ? unipilotFarmData[farm.id.toLowerCase()]
          : undefined;
      const poolAPR = Number(farmData?.stats ?? 0);

      const farmTVL = tvl > 0 ? tvl : 1000;
      const farmAPR =
        ((farmRewardA * 24 * 3600 * (farmRewardTokenAUSD?.price ?? 0) +
          farmRewardB * 24 * 3600 * (farmRewardTokenBUSD?.price ?? 0)) /
          farmTVL) *
        36500;

      const rewards: any[] = [];
      if (rewardRate?.tokenA) {
        rewards.push({
          amount:
            Number(
              formatUnits(
                rewardRate?.rewardA ?? '0',
                rewardRate?.tokenA?.decimals ?? 18,
              ),
            ) *
            24 *
            3600,
          token: rewardRate?.tokenA,
        });
      }

      if (rewardRate?.tokenB) {
        rewards.push({
          amount:
            Number(
              formatUnits(
                rewardRate?.rewardB ?? '0',
                rewardRate?.tokenB?.decimals ?? 18,
              ),
            ) *
            24 *
            3600,
          token: rewardRate?.tokenB,
        });
      }

      return {
        ...farm,
        token0,
        token1,
        rewards,
        tvl,
        rewardUSD,
        poolAPR,
        farmAPR,
        type: 'Unipilot',
        title,
      };
    })
    .filter((item: any) => {
      const search = searchVal ?? '';
      const searchCondition =
        (item.token0 &&
          item.token0.symbol &&
          item.token0.symbol.toLowerCase().includes(search.toLowerCase())) ||
        (item.token0 &&
          item.token0.address.toLowerCase().includes(search.toLowerCase())) ||
        (item.token1 &&
          item.token1.symbol &&
          item.token1.symbol.toLowerCase().includes(search.toLowerCase())) ||
        (item.token1 &&
          item.token1.address.toLowerCase().includes(search.toLowerCase())) ||
        item.title.toLowerCase().includes(search.toLowerCase());
      const blueChipCondition =
        !!GlobalData.blueChips[chainId].find(
          (token) =>
            item.token0 &&
            token.address.toLowerCase() === item.token0.address.toLowerCase(),
        ) &&
        !!GlobalData.blueChips[chainId].find(
          (token) =>
            item.token1 &&
            token.address.toLowerCase() === item.token1.address.toLowerCase(),
        );
      const stableCoinCondition =
        !!GlobalData.stableCoins[chainId].find(
          (token) =>
            item.token0 &&
            token.address.toLowerCase() === item.token0.address.toLowerCase(),
        ) &&
        !!GlobalData.stableCoins[chainId].find(
          (token) =>
            item.token1 &&
            token.address.toLowerCase() === item.token1.address.toLowerCase(),
        );

      const stablePair0 = GlobalData.stablePairs[chainId].find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              item.token0 &&
              token.address.toLowerCase() === item.token0.address.toLowerCase(),
          ),
      );
      const stablePair1 = GlobalData.stablePairs[chainId].find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              item.token1 &&
              token.address.toLowerCase() === item.token1.address.toLowerCase(),
          ),
      );
      const stableLPCondition =
        item.token0 &&
        item.token1 &&
        ((stablePair0 &&
          stablePair0.find(
            (token) =>
              token.address.toLowerCase() === item.token1.address.toLowerCase(),
          )) ||
          (stablePair1 &&
            stablePair1.find(
              (token) =>
                token.address.toLowerCase() ===
                item.token0.address.toLowerCase(),
            )));

      return (
        searchCondition &&
        (farmFilter === v3FarmFilter.blueChip
          ? blueChipCondition
          : farmFilter === v3FarmFilter.stableCoin
          ? stableCoinCondition
          : farmFilter === v3FarmFilter.stableLP
          ? stableLPCondition
          : farmFilter === v3FarmFilter.otherLP
          ? !blueChipCondition && !stableCoinCondition && !stableLPCondition
          : true)
      );
    })
    .sort((farm0: any, farm1: any) => {
      if (sortBy === v3FarmSortBy.pool) {
        const farm0Title =
          (farm0.token0?.symbol ?? '') +
          (farm0.token1?.symbol ?? '') +
          farm0.title;
        const farm1Title =
          (farm1.token0?.symbol ?? '') +
          (farm1.token1?.symbol ?? '') +
          farm1.title;
        return farm0Title > farm1Title ? sortMultiplier : -1 * sortMultiplier;
      } else if (sortBy === v3FarmSortBy.tvl) {
        return farm0.tvl > farm1.tvl ? sortMultiplier : -1 * sortMultiplier;
      } else if (sortBy === v3FarmSortBy.rewards) {
        return farm0.rewardUSD > farm1.rewardUSD
          ? sortMultiplier
          : -1 * sortMultiplier;
      } else if (sortBy === v3FarmSortBy.apr) {
        return farm0.poolAPR + farm0.farmAPR > farm1.poolAPR + farm1.farmAPR
          ? sortMultiplier
          : -1 * sortMultiplier;
      }
      return 1;
    });

  return filteredFarms;
}
