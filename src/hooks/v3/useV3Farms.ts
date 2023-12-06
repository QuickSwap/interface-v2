import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';
import { GammaPair, GlobalConst, GlobalData } from 'constants/index';
import { GAMMA_MASTERCHEF_ADDRESSES } from 'constants/v3/addresses';
import {
  useGammaHypervisorContract,
  useMasterChefContract,
} from 'hooks/useContract';
import { useEffect, useMemo, useState } from 'react';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getGammaData, getGammaRewards, getTokenFromAddress } from 'utils';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import QIGammaMasterChef from 'constants/abis/gamma-masterchef1.json';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import { formatUnits } from 'ethers/lib/utils';
import {
  useEternalFarmAprs,
  useEternalFarmPoolAPRs,
  useEternalFarmTvls,
} from 'hooks/useIncentiveSubgraph';
import { V3Farm } from 'pages/FarmPage/V3/Farms';

export const useEternalFarmsFiltered = (
  farms: any[],
  chainId: ChainId,
  searchVal?: string,
  farmFilter?: string,
  sortBy?: string,
  sortDesc?: boolean,
) => {
  const {
    data: eternalFarmPoolAprs,
    isLoading: eternalFarmPoolAprsLoading,
  } = useEternalFarmPoolAPRs();
  const {
    data: eternalFarmAprs,
    isLoading: eternalFarmAprsLoading,
  } = useEternalFarmAprs();
  const {
    data: eternalFarmTvls,
    isLoading: eternalFarmTvlsLoading,
  } = useEternalFarmTvls();
  const sortMultiplier = sortDesc ? -1 : 1;
  const { v3FarmSortBy, v3FarmFilter } = GlobalConst.utils;
  const rewardTokenAddresses = useMemo(() => {
    return farms.reduce<string[]>((memo, farm) => {
      const rewardTokenAddress = memo.find(
        (item) =>
          farm &&
          farm.rewardToken &&
          farm.rewardToken.address.toLowerCase() === item,
      );
      const bonusRewardTokenAddress = memo.find(
        (item) =>
          farm &&
          farm.bonusRewardToken &&
          farm.bonusRewardToken.address.toLowerCase() === item,
      );
      if (!rewardTokenAddress && farm && farm.rewardToken) {
        memo.push(farm.rewardToken.address.toLowerCase());
      }
      if (!bonusRewardTokenAddress && farm.bonusRewardToken) {
        memo.push(farm.bonusRewardToken.address.toLowerCase());
      }
      return memo;
    }, []);
  }, [farms]);

  const { prices: rewardTokenPrices } = useUSDCPricesFromAddresses(
    rewardTokenAddresses,
  );

  const filteredFarms: V3Farm[] = farms
    .map((farm) => {
      const tvl =
        eternalFarmTvls && farm && farm.id
          ? Number(eternalFarmTvls[farm.id])
          : 0;
      const farmAPR =
        eternalFarmAprs && farm && farm.id
          ? Number(eternalFarmAprs[farm.id])
          : 0;
      const poolAPR =
        eternalFarmPoolAprs && farm && farm.pool && farm.pool.id
          ? Number(eternalFarmPoolAprs[farm.pool.id])
          : 0;
      const farmRewardTokenPrice = rewardTokenPrices?.find(
        (item) =>
          farm &&
          item.address.toLowerCase() === farm.rewardToken.address.toLowerCase(),
      );
      const farmBonusRewardTokenPrice = rewardTokenPrices?.find(
        (item) =>
          farm &&
          item.address.toLowerCase() ===
            farm.bonusRewardToken.address.toLowerCase(),
      );
      const farmReward =
        farm && farm.rewardRate && farmRewardTokenPrice
          ? Number(formatUnits(farm.rewardRate, farm.rewardToken.decimals)) *
            farmRewardTokenPrice.price *
            3600 *
            24
          : 0;
      const farmBonusReward =
        farm && farm.bonusRewardRate && farmBonusRewardTokenPrice
          ? Number(
              formatUnits(farm.bonusRewardRate, farm.bonusRewardToken.decimals),
            ) *
            farmBonusRewardTokenPrice.price *
            3600 *
            24
          : 0;
      return {
        ...farm,
        token0: farm.pool.token0,
        token1: farm.pool.token1,
        tvl,
        poolAPR,
        farmAPR,
        rewardUSD: farmReward + farmBonusReward,
        rewards: [
          {
            amount:
              Number(formatUnits(farm.rewardRate, farm.rewardToken.decimals)) *
              3600 *
              24,
            token: farm.rewardToken,
          },
          {
            amount:
              Number(
                formatUnits(
                  farm.bonusRewardRate,
                  farm.bonusRewardToken.decimals,
                ),
              ) *
              3600 *
              24,
            token: farm.bonusRewardToken,
          },
        ],
        type: 'quickswap',
      };
    })
    .filter((farm) => {
      const farmToken0Name =
        farm && farm.pool && farm.pool.token0 && farm.pool.token0.name
          ? farm.pool.token0.name
          : '';
      const farmToken1Name =
        farm && farm.pool && farm.pool.token1 && farm.pool.token1.name
          ? farm.pool.token1.name
          : '';
      const farmToken0Symbol =
        farm && farm.pool && farm.pool.token0 && farm.pool.token0.symbol
          ? farm.pool.token0.symbol
          : '';
      const farmToken1Symbol =
        farm && farm.pool && farm.pool.token1 && farm.pool.token1.symbol
          ? farm.pool.token1.symbol
          : '';
      const farmToken0Id =
        farm && farm.pool && farm.pool.token0
          ? farm.pool.token0.id ?? farm.pool.token0.address ?? ''
          : '';
      const farmToken1Id =
        farm && farm.pool && farm.pool.token1
          ? farm.pool.token1.id ?? farm.pool.token1.address ?? ''
          : '';
      const searchCondition =
        farmToken0Name.toLowerCase().includes(searchVal) ||
        farmToken1Name.toLowerCase().includes(searchVal) ||
        farmToken0Symbol.toLowerCase().includes(searchVal) ||
        farmToken1Symbol.toLowerCase().includes(searchVal) ||
        farmToken0Id.toLowerCase().includes(searchVal) ||
        farmToken1Id.toLowerCase().includes(searchVal);

      const blueChipCondition =
        !!GlobalData.blueChips[chainId].find(
          (token) => token.address.toLowerCase() === farmToken0Id.toLowerCase(),
        ) &&
        !!GlobalData.blueChips[chainId].find(
          (token) => token.address.toLowerCase() === farmToken1Id.toLowerCase(),
        );
      const stableCoinCondition =
        !!GlobalData.stableCoins[chainId].find(
          (token) => token.address.toLowerCase() === farmToken0Id.toLowerCase(),
        ) &&
        !!GlobalData.stableCoins[chainId].find(
          (token) => token.address.toLowerCase() === farmToken1Id.toLowerCase(),
        );
      const stablePair0 = GlobalData.stablePairs[chainId].find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              token.address.toLowerCase() === farmToken0Id.toLowerCase(),
          ),
      );
      const stablePair1 = GlobalData.stablePairs[chainId].find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              token.address.toLowerCase() === farmToken1Id.toLowerCase(),
          ),
      );
      const stableLPCondition =
        (stablePair0 &&
          stablePair0.find(
            (token) =>
              token.address.toLowerCase() === farmToken1Id.toLowerCase(),
          )) ||
        (stablePair1 &&
          stablePair1.find(
            (token) =>
              token.address.toLowerCase() === farmToken0Id.toLowerCase(),
          ));

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
    .sort((farm0, farm1) => {
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
        return farm0.poolAPR + farm0.farmAPR > farm1.poolAPR + farm1.poolAPR
          ? sortMultiplier
          : -1 * sortMultiplier;
      }
      return 1;
    });

  return {
    loading:
      eternalFarmPoolAprsLoading ||
      eternalFarmAprsLoading ||
      eternalFarmTvlsLoading,
    data: filteredFarms,
  };
};

export const useGammaFarmsFiltered = (
  gammaPairs: GammaPair[],
  chainId: ChainId,
  searchVal?: string,
  farmFilter?: string,
  sortBy?: string,
  sortDesc?: boolean,
) => {
  const fetchGammaRewards = async () => {
    const gammaRewards = await getGammaRewards(chainId);
    return gammaRewards;
  };

  const fetchGammaData = async () => {
    const gammaData = await getGammaData(chainId);
    return gammaData;
  };

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const {
    isLoading: gammaFarmsLoading,
    data: gammaData,
    refetch: refetchGammaData,
  } = useQuery({
    queryKey: ['fetchGammaDataFarms', chainId],
    queryFn: fetchGammaData,
  });

  const {
    isLoading: gammaRewardsLoading,
    data: gammaRewards,
    refetch: refetchGammaRewards,
  } = useQuery({
    queryKey: ['fetchGammaRewardsFarms', chainId],
    queryFn: fetchGammaRewards,
  });

  useEffect(() => {
    refetchGammaData();
    refetchGammaRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  const tokenMap = useSelectedTokenList();
  const sortMultiplier = sortDesc ? -1 : 1;
  const { v3FarmSortBy, v3FarmFilter } = GlobalConst.utils;

  const qiTokenAddress = '0x580a84c73811e1839f75d86d75d88cca0c241ff4';
  const qiGammaFarm = '0x25B186eEd64ca5FDD1bc33fc4CFfd6d34069BAec';
  const qimasterChefContract = useMasterChefContract(
    2,
    undefined,
    QIGammaMasterChef,
  );
  const qiHypeContract = useGammaHypervisorContract(qiGammaFarm);

  const qiPoolData = useSingleCallResult(qimasterChefContract, 'poolInfo', [2]);
  const qiGammaStakedAmountData = useSingleCallResult(
    qiHypeContract,
    'balanceOf',
    [qimasterChefContract?.address],
  );
  const qiGammaStakedAmount =
    !qiGammaStakedAmountData.loading &&
    qiGammaStakedAmountData.result &&
    qiGammaStakedAmountData.result.length > 0
      ? Number(formatUnits(qiGammaStakedAmountData.result[0], 18))
      : 0;
  const qiGammaData =
    gammaData && gammaData[qiGammaFarm.toLowerCase()]
      ? gammaData[qiGammaFarm.toLowerCase()]
      : undefined;
  const qiLPTokenUSD =
    qiGammaData &&
    qiGammaData.totalSupply &&
    Number(qiGammaData.totalSupply) > 0
      ? (Number(qiGammaData.tvlUSD) / Number(qiGammaData.totalSupply)) *
        10 ** 18
      : 0;
  const qiGammaStakedAmountUSD = qiGammaStakedAmount * qiLPTokenUSD;

  const qiAllocPointBN =
    !qiPoolData.loading && qiPoolData.result && qiPoolData.result.length > 0
      ? qiPoolData.result.allocPoint
      : undefined;

  const qiRewardPerSecondData = useSingleCallResult(
    qimasterChefContract,
    'rewardPerSecond',
    [],
  );

  const qiRewardPerSecondBN =
    !qiRewardPerSecondData.loading &&
    qiRewardPerSecondData.result &&
    qiRewardPerSecondData.result.length > 0
      ? qiRewardPerSecondData.result[0]
      : undefined;

  const qiTotalAllocPointData = useSingleCallResult(
    qimasterChefContract,
    'totalAllocPoint',
    [],
  );

  const qiTotalAllocPointBN =
    !qiTotalAllocPointData.loading &&
    qiTotalAllocPointData.result &&
    qiTotalAllocPointData.result.length > 0
      ? qiTotalAllocPointData.result[0]
      : undefined;

  const qiRewardPerSecond =
    qiAllocPointBN && qiRewardPerSecondBN && qiTotalAllocPointBN
      ? ((Number(qiAllocPointBN) / Number(qiTotalAllocPointBN)) *
          Number(qiRewardPerSecondBN)) /
        10 ** 18
      : undefined;

  const gammaRewardTokenAddresses = GAMMA_MASTERCHEF_ADDRESSES.reduce<string[]>(
    (memo, masterChef) => {
      const gammaReward =
        gammaRewards &&
        chainId &&
        masterChef[chainId] &&
        gammaRewards[masterChef[chainId].toLowerCase()]
          ? gammaRewards[masterChef[chainId].toLowerCase()]['pools']
          : undefined;
      if (gammaReward) {
        const gammaRewardArr: any[] = Object.values(gammaReward);
        for (const item of gammaRewardArr) {
          if (item && item['rewarders']) {
            const rewarders: any[] = Object.values(item['rewarders']);
            for (const rewarder of rewarders) {
              if (
                rewarder &&
                Number(rewarder.rewardPerSecond ?? 0) > 0 &&
                rewarder.rewardToken &&
                !memo.includes(rewarder.rewardToken)
              ) {
                memo.push(rewarder.rewardToken);
              }
            }
          }
        }
      }
      return memo;
    },
    [],
  );

  const gammaRewardTokenAddressesWithQI = useMemo(() => {
    const containsQI = !!gammaRewardTokenAddresses.find(
      (address) => address.toLowerCase() === qiTokenAddress.toLowerCase(),
    );
    if (containsQI) {
      return gammaRewardTokenAddresses;
    }
    return gammaRewardTokenAddresses.concat([qiTokenAddress]);
  }, [gammaRewardTokenAddresses]);

  const { prices: gammaRewardsWithUSDPrice } = useUSDCPricesFromAddresses(
    gammaRewardTokenAddressesWithQI,
  );

  const qiPrice = gammaRewardsWithUSDPrice?.find(
    (item) => item.address.toLowerCase() === qiTokenAddress.toLowerCase(),
  )?.price;

  const qiAPR =
    qiRewardPerSecond && qiPrice && qiGammaStakedAmountUSD
      ? (qiRewardPerSecond * qiPrice * 3600 * 24 * 365) / qiGammaStakedAmountUSD
      : undefined;

  if (gammaRewards && GAMMA_MASTERCHEF_ADDRESSES[2][chainId] && qiAPR) {
    const qiRewardsData = {
      apr: qiAPR,
      stakedAmount: qiGammaStakedAmount,
      stakedAmountUSD: qiGammaStakedAmountUSD,
      rewarders: {
        rewarder: {
          rewardToken: qiTokenAddress,
          rewardTokenDecimals: 18,
          rewardTokenSymbol: 'QI',
          rewardPerSecond: qiRewardPerSecond,
          apr: qiAPR,
          allocPoint: qiAllocPointBN.toString(),
        },
      },
    };
    gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[2][chainId]] = { pools: {} };
    gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[2][chainId]]['pools'][
      qiGammaFarm.toLowerCase()
    ] = qiRewardsData;
  }

  const filteredFarms: V3Farm[] = gammaPairs
    .map((pair) => {
      const token0 = getTokenFromAddress(
        pair.token0Address,
        chainId,
        tokenMap,
        [],
      );
      const token1 = getTokenFromAddress(
        pair.token1Address,
        chainId,
        tokenMap,
        [],
      );
      const farmMasterChefAddress =
        chainId &&
        GAMMA_MASTERCHEF_ADDRESSES[pair.masterChefIndex ?? 0][chainId]
          ? GAMMA_MASTERCHEF_ADDRESSES[pair.masterChefIndex ?? 0][
              chainId
            ].toLowerCase()
          : undefined;
      const gammaReward =
        gammaRewards &&
        farmMasterChefAddress &&
        gammaRewards[farmMasterChefAddress] &&
        gammaRewards[farmMasterChefAddress]['pools']
          ? gammaRewards[farmMasterChefAddress]['pools'][
              pair.address.toLowerCase()
            ]
          : undefined;
      const tvl = Number(gammaReward?.stakedAmountUSD ?? 0);

      const rewardsObj = gammaReward?.rewarders;
      const rewards = rewardsObj
        ? Object.values(rewardsObj).filter(
            (reward: any) => Number(reward?.rewardPerSecond ?? 0) > 0,
          )
        : [];
      const rewardUSD = rewards.reduce((total: number, rewarder: any) => {
        const rewardUSD = gammaRewardsWithUSDPrice?.find(
          (item) =>
            item.address.toLowerCase() === rewarder.rewardToken.toLowerCase(),
        );
        return (
          total + (rewardUSD?.price ?? 0) * rewarder.rewardPerSecond * 3600 * 24
        );
      }, 0);

      const gammaFarmData = gammaData
        ? gammaData[pair.address.toLowerCase()]
        : undefined;
      const poolAPR = Number(gammaFarmData?.returns?.allTime?.feeApr ?? 0);
      const farmAPR = Number(gammaReward?.apr ?? 0);

      return {
        ...pair,
        token0,
        token1,
        tvl,
        rewardUSD,
        rewards: rewards.map((item: any) => {
          return {
            amount: Number(item?.rewardPerSecond ?? 0) * 3600 * 24,
            token: {
              address: item?.rewardToken ?? '',
              symbol: item?.rewardTokenSymbol ?? '',
              decimals: item?.rewardTokenDecimals ?? 18,
            },
          };
        }),
        poolAPR,
        farmAPR,
        type: 'gamma',
      };
    })
    .filter((item) => {
      const search = searchVal ?? '';
      const token0Symbol = item.token0?.symbol ?? '';
      const token0Address = item.token0?.address ?? '';
      const token1Symbol = item.token1?.symbol ?? '';
      const token1Address = item.token1?.address ?? '';
      const searchCondition =
        token0Symbol.toLowerCase().includes(search.toLowerCase()) ||
        token0Address.toLowerCase().includes(search.toLowerCase()) ||
        token1Symbol.toLowerCase().includes(search.toLowerCase()) ||
        token1Address.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase());
      const blueChipCondition =
        !!GlobalData.blueChips[chainId].find(
          (token) =>
            token.address.toLowerCase() ===
            (item.token0?.address ?? '').toLowerCase(),
        ) &&
        !!GlobalData.blueChips[chainId].find(
          (token) =>
            token.address.toLowerCase() ===
            (item.token1?.address ?? '').toLowerCase(),
        );
      const stableCoinCondition =
        !!GlobalData.stableCoins[chainId].find(
          (token) =>
            token.address.toLowerCase() ===
            (item.token0?.address ?? '').toLowerCase(),
        ) &&
        !!GlobalData.stableCoins[chainId].find(
          (token) =>
            token.address.toLowerCase() ===
            (item.token1?.address ?? '').toLowerCase(),
        );

      const stablePair0 = GlobalData.stablePairs[chainId].find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              token.address.toLowerCase() ===
              (item.token0?.address ?? '').toLowerCase(),
          ),
      );
      const stablePair1 = GlobalData.stablePairs[chainId].find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              token.address.toLowerCase() ===
              (item.token1?.address ?? '').toLowerCase(),
          ),
      );
      const stableLPCondition =
        (stablePair0 &&
          stablePair0.find(
            (token) =>
              token.address.toLowerCase() ===
              (item.token1?.address ?? '').toLowerCase(),
          )) ||
        (stablePair1 &&
          stablePair1.find(
            (token) =>
              token.address.toLowerCase() ===
              (item.token0?.address ?? '').toLowerCase(),
          ));

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
    .sort((farm0, farm1) => {
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
        return farm0.poolAPR + farm0.farmAPR > farm1.poolAPR + farm1.poolAPR
          ? sortMultiplier
          : -1 * sortMultiplier;
      }
      return 1;
    });
  return {
    loading: gammaRewardsLoading || gammaFarmsLoading,
    data: filteredFarms,
  };
};
