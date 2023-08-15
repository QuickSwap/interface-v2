import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';
import { Interface, formatUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
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
import { GlobalConst, GlobalData } from 'constants/index';

interface RewardRate {
  rewardA?: BigNumber;
  rewardB?: BigNumber;
  tokenA?: Token;
  tokenB?: Token;
  address?: string;
}

export function useUnipilotFarms(chainId?: ChainId) {
  const fetchUnipilotFarms = async () => {
    if (!chainId) return [];
    const unipilotFarms = await getUnipilotFarms(chainId);
    return unipilotFarms;
  };

  const {
    isLoading: farmsLoading,
    data,
    refetch: refetchUnipilotFarms,
  } = useQuery({
    queryKey: ['fetchUnipilotFarms', chainId],
    queryFn: fetchUnipilotFarms,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetchUnipilotFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { loading: farmsLoading, data };
}

export function useUnipilotFarmData(
  farmAddresses?: string[],
  chainId?: ChainId,
) {
  const fetchUnipilotFarmData = async () => {
    if (!chainId) return;
    const unipilotFarms = await getUnipilotFarmData(farmAddresses, chainId);
    return unipilotFarms;
  };

  const { isLoading, data, refetch: refetchUnipilotFarmData } = useQuery({
    queryKey: ['fetchUnipilotFarmData', farmAddresses, chainId],
    queryFn: fetchUnipilotFarmData,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetchUnipilotFarmData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { loading: isLoading, data };
}

export function useUnipilotUserFarms(chainId?: ChainId, account?: string) {
  const fetchUnipilotUserFarms = async () => {
    if (!chainId) return [];
    const unipilotFarms = await getUnipilotUserFarms(chainId, account);
    return unipilotFarms
      ? unipilotFarms.filter((farm: any) => farm.rewards.length > 0)
      : [];
  };

  const {
    isLoading: farmsLoading,
    data,
    refetch: refetchUnipilotUserFarms,
  } = useQuery({
    queryKey: ['fetchUnipilotUserFarms', chainId, account],
    queryFn: fetchUnipilotUserFarms,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetchUnipilotUserFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

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
        rateA: rewardRate,
        tokenA: rewardToken,
        rateB: undefined,
        tokenB: undefined,
        address:
          singleFarmAddresses.length >= index
            ? singleFarmAddresses[index]
            : undefined,
      };
    },
  );

  const dualFarmAddresses = unipilotFarms
    .filter((farm: any) => !farm.isDualReward)
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
        rateA: rewardRateA,
        rateB: rewardRateB,
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

  const rewardsWithUSDPrice = useUSDCPricesFromAddresses(farmTokenAddresses);

  const filteredFarms = unipilotFarms
    .map((farm: any) => {
      const rewardRate = rewardRates.find(
        (rate) =>
          rate.address && rate.address.toLowerCase() === farm.id.toLowerCase(),
      );
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
      if (chainId) {
        const token0 = getTokenFromAddress(
          farm.token0.id,
          chainId,
          tokenMap,
          [],
        );
        const token1 = getTokenFromAddress(
          farm.token1.id,
          chainId,
          tokenMap,
          [],
        );
        return { ...farm, token0, token1, rewardRate, tvl };
      }
      return { ...farm, token0: undefined, token1: undefined, rewardRate, tvl };
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
        const farm0RewardA =
          farm0.rewardRate && farm0.rewardRate.rateA && farm0.rewardRate.tokenA
            ? Number(
                formatUnits(
                  farm0.rewardRate.rateA,
                  farm0.rewardRate.tokenA.decimals,
                ),
              )
            : 0;
        const farm0RewardB =
          farm0.rewardRate && farm0.rewardRate.rateB && farm0.rewardRate.tokenB
            ? Number(
                formatUnits(
                  farm0.rewardRate.rateB,
                  farm0.rewardRate.tokenB.decimals,
                ),
              )
            : 0;
        const farm0RewardTokenAUSD = rewardsWithUSDPrice?.find(
          (item) =>
            farm0.rewardRate &&
            farm0.rewardRate.tokenA &&
            item.address.toLowerCase() ===
              farm0.rewardRate.tokenA.address.toLowerCase(),
        );
        const farm0RewardTokenBUSD = rewardsWithUSDPrice?.find(
          (item) =>
            farm0.rewardRate &&
            farm0.rewardRate.tokenB &&
            item.address.toLowerCase() ===
              farm0.rewardRate.tokenB.address.toLowerCase(),
        );
        const farm0RewardUSD =
          farm0RewardA * (farm0RewardTokenAUSD?.price ?? 0) +
          farm0RewardB * (farm0RewardTokenBUSD?.price ?? 0);

        const farm1RewardA =
          farm1.rewardRate && farm1.rewardRate.rateA && farm1.rewardRate.tokenA
            ? Number(
                formatUnits(
                  farm1.rewardRate.rateA,
                  farm1.rewardRate.tokenA.decimals,
                ),
              )
            : 0;
        const farm1RewardB =
          farm1.rewardRate && farm1.rewardRate.rateB && farm1.rewardRate.tokenB
            ? Number(
                formatUnits(
                  farm1.rewardRate.rateB,
                  farm1.rewardRate.tokenB.decimals,
                ),
              )
            : 0;
        const farm1RewardTokenAUSD = rewardsWithUSDPrice?.find(
          (item) =>
            farm1.rewardRate &&
            farm1.rewardRate.tokenA &&
            item.address.toLowerCase() ===
              farm1.rewardRate.tokenA.address.toLowerCase(),
        );
        const farm1RewardTokenBUSD = rewardsWithUSDPrice?.find(
          (item) =>
            farm1.rewardRate &&
            farm1.rewardRate.tokenB &&
            item.address.toLowerCase() ===
              farm1.rewardRate.tokenB.address.toLowerCase(),
        );
        const farm1RewardUSD =
          farm1RewardA * (farm1RewardTokenAUSD?.price ?? 0) +
          farm1RewardB * (farm1RewardTokenBUSD?.price ?? 0);

        return farm0RewardUSD > farm1RewardUSD
          ? sortMultiplier
          : -1 * sortMultiplier;
      } else if (sortBy === v3FarmSortBy.apr) {
        const farm0Data =
          unipilotFarmData && farm0 && farm0.id
            ? unipilotFarmData[farm0.id.toLowerCase()]
            : undefined;
        const farm0Apr = farm0Data ? Number(farm0Data['total']) : 0;
        const farm1Data =
          unipilotFarmData && farm1 && farm1.id
            ? unipilotFarmData[farm1.id.toLowerCase()]
            : undefined;
        const farm1Apr = farm1Data ? Number(farm1Data['total']) : 0;
        return farm0Apr > farm1Apr ? sortMultiplier : -1 * sortMultiplier;
      }
      return 1;
    });

  return filteredFarms;
}
