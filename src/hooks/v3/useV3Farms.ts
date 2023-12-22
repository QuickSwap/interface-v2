import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';
import {
  DefiedgeStrategies,
  GammaPair,
  GlobalConst,
  GlobalData,
  IchiVaults,
} from 'constants/index';
import { GAMMA_MASTERCHEF_ADDRESSES } from 'constants/v3/addresses';
import {
  useGammaHypervisorContract,
  useMasterChefContract,
} from 'hooks/useContract';
import { useMemo } from 'react';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAllGammaPairs, getTokenFromAddress } from 'utils';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import QIGammaMasterChef from 'constants/abis/gamma-masterchef1.json';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import { formatUnits } from 'ethers/lib/utils';
import { V3Farm } from 'pages/FarmPage/V3/Farms';
import { useGammaData, useGammaRewards } from './useGammaData';
import { useActiveWeb3React } from 'hooks';
import { useSteerVaults } from './useSteerData';
import { useICHIVaultAPRs, useICHIVaults } from 'hooks/useICHIData';
import { useDefiEdgeStrategiesAPR } from 'state/mint/v3/hooks';

export const useMerklFarms = () => {
  const { chainId } = useActiveWeb3React();
  const fetchMerklFarms = async () => {
    const merklAPIURL = process.env.REACT_APP_MERKL_API_URL;
    if (!merklAPIURL || !chainId) return [];
    const res = await fetch(
      `${merklAPIURL}?chainIds[]=${chainId}&AMMs[]=quickswapalgebra`,
    );
    const data = await res.json();
    const farmData =
      data && data[chainId.toString()]
        ? data[chainId.toString()]?.pools
        : undefined;
    if (!farmData) return [];
    return Object.values(farmData) as any[];
  };
  const { isLoading: loadingMerkl, data: merklFarms } = useQuery({
    queryKey: ['fetchMerklFarms', chainId],
    queryFn: fetchMerklFarms,
    refetchInterval: 300000,
  });
  const { loading: loadingSteer, data: steerVaults } = useSteerVaults(chainId);
  const { isLoading: loadingGamma, data: gammaData } = useGammaData();
  const { loading: loadingICHI, data: ichiVaults } = useICHIVaults();
  const ichiVaultsFiltered = useMemo(() => {
    if (!merklFarms) return [];
    return ichiVaults.filter(
      (vault) =>
        !!merklFarms.find(
          (item) =>
            !!Object.values(item.alm).find(
              (alm: any) =>
                alm.label.includes('Ichi') &&
                vault.address.toLowerCase() === alm.almAddress.toLowerCase(),
            ),
        ),
    );
  }, [ichiVaults, merklFarms]);
  const ichiTokenAddresses = ichiVaultsFiltered.reduce(
    (memo: string[], vault) => {
      if (vault.token0 && !memo.includes(vault.token0.address.toLowerCase())) {
        memo.push(vault.token0.address.toLowerCase());
      }
      if (vault.token1 && !memo.includes(vault.token1.address.toLowerCase())) {
        memo.push(vault.token1.address.toLowerCase());
      }
      return memo;
    },
    [],
  );
  const {
    loading: loadingUSDPrices,
    prices: usdPrices,
  } = useUSDCPricesFromAddresses(ichiTokenAddresses);
  const { isLoading: loadingICHIAPRs, aprs: ichiAPRs } = useICHIVaultAPRs(
    ichiVaultsFiltered,
    usdPrices,
  );

  const defiEdgeIdsFiltered = useMemo(() => {
    if (!merklFarms) return [];
    return (DefiedgeStrategies[chainId] ?? [])
      .filter(
        (vault) =>
          !!merklFarms.find(
            (item) =>
              !!Object.values(item.alm).find(
                (alm: any) =>
                  alm.label.includes('DefiEdge') &&
                  vault.id.toLowerCase() === alm.almAddress.toLowerCase(),
              ),
          ),
      )
      .map((e) => e.id);
  }, [chainId, merklFarms]);
  const {
    isLoading: loadingDefiEdgeAPRs,
    data: defiedgeAprs,
  } = useDefiEdgeStrategiesAPR(defiEdgeIdsFiltered);

  const farms = useMemo(() => {
    if (!merklFarms) return [];
    return merklFarms.map((item: any) => {
      const alms = Object.values(item.alm)
        .filter((alm: any) => {
          if (alm.label.includes('Gamma')) {
            return getAllGammaPairs(chainId).find(
              (item) =>
                item.address.toLowerCase() === alm.almAddress.toLowerCase(),
            );
          } else if (alm.label.includes('Steer')) {
            return steerVaults.find(
              (vault) =>
                vault.address.toLowerCase() === alm.almAddress.toLowerCase(),
            );
          } else if (alm.label.includes('Ichi')) {
            return IchiVaults[chainId]?.find(
              (address) =>
                address.toLowerCase() === alm.almAddress.toLowerCase(),
            );
          } else if (alm.label.includes('DefiEdge')) {
            return DefiedgeStrategies[chainId]?.find(
              (item) => item.id.toLowerCase() === alm.almAddress.toLowerCase(),
            );
          }
          return false;
        })
        .map((alm: any) => {
          let poolAPR = 0;
          if (alm.label.includes('Gamma')) {
            const gammaItemData = gammaData
              ? gammaData[alm.almAddress.toLowerCase()]
              : undefined;
            poolAPR = (gammaItemData?.returns?.allTime?.feeApr ?? 0) * 100;
          } else if (alm.label.includes('Steer')) {
            const steerVault = steerVaults.find(
              (vault) =>
                vault.address.toLowerCase() === alm.almAddress.toLowerCase(),
            );
            poolAPR = steerVault?.apr ?? 0;
          } else if (alm.label.includes('Ichi')) {
            poolAPR =
              ichiAPRs?.find(
                (item) =>
                  item.address.toLowerCase() === alm.almAddress.toLowerCase(),
              )?.apr ?? 0;
          } else if (alm.label.includes('DefiEdge')) {
            poolAPR = defiedgeAprs?.find(
              (e: any) =>
                e.strategy.address.toLowerCase() ===
                alm.almAddress.toLowerCase(),
            )?.strategy?.fees_apr;
          }
          return { ...alm, poolAPR };
        });
      return { ...item, alm: alms };
    });
  }, [chainId, defiedgeAprs, gammaData, ichiAPRs, merklFarms, steerVaults]);
  return {
    loading:
      loadingMerkl ||
      loadingGamma ||
      loadingSteer ||
      loadingICHI ||
      loadingICHIAPRs ||
      loadingUSDPrices ||
      loadingDefiEdgeAPRs,
    farms,
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
  const { isLoading: gammaFarmsLoading, data: gammaData } = useGammaData();

  const {
    isLoading: gammaRewardsLoading,
    data: gammaRewards,
  } = useGammaRewards();

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
        ? Object.values(rewardsObj)
            .map((reward: any, ind: number) => {
              return { ...reward, address: Object.keys(rewardsObj)[ind] };
            })
            .filter((reward: any) => Number(reward?.rewardPerSecond ?? 0) > 0)
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
            address: item.address,
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
