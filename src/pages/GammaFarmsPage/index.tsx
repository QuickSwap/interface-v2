import React, { useMemo } from 'react';
import { Box } from '@material-ui/core';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import {
  GammaPair,
  GammaPairs,
  GlobalConst,
  GlobalData,
} from 'constants/index';
import { useQuery } from 'react-query';
import GammaFarmCard from './GammaFarmCard';
import { getGammaData, getGammaRewards, getTokenFromAddress } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { Token } from '@uniswap/sdk';
import { GAMMA_MASTERCHEF_ADDRESSES } from 'constants/v3/addresses';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useMasterChefContract } from 'hooks/useContract';
import QIGammaMasterChef from 'constants/abis/gamma-masterchef1.json';
import { useSingleCallResult } from 'state/multicall/v3/hooks';

const GammaFarmsPage: React.FC<{
  farmFilter: string;
  search: string;
  sortBy: string;
  sortDesc: boolean;
}> = ({ farmFilter, search, sortBy, sortDesc }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const parsedQuery = useParsedQueryString();
  const farmStatus =
    parsedQuery && parsedQuery.farmStatus
      ? (parsedQuery.farmStatus as string)
      : 'active';
  const allGammaFarms = chainId
    ? ([] as GammaPair[])
        .concat(...Object.values(GammaPairs[chainId]))
        .filter((item) => !!item.ableToFarm === (farmStatus === 'active'))
    : [];
  const sortMultiplier = sortDesc ? -1 : 1;
  const { v3FarmSortBy, v3FarmFilter } = GlobalConst.utils;

  const fetchGammaRewards = async () => {
    const gammaRewards = await getGammaRewards(chainId);
    return gammaRewards;
  };

  const fetchGammaData = async () => {
    const gammaData = await getGammaData(chainId);
    return gammaData;
  };

  const { isLoading: gammaFarmsLoading, data: gammaData } = useQuery(
    'fetchGammaData',
    fetchGammaData,
    {
      refetchInterval: 30000,
    },
  );

  const { isLoading: gammaRewardsLoading, data: gammaRewards } = useQuery(
    'fetchGammaRewards',
    fetchGammaRewards,
    {
      refetchInterval: 30000,
    },
  );

  const qiTokenAddress = '0x580a84c73811e1839f75d86d75d88cca0c241ff4';
  const qiGammaFarm = '0x25B186eEd64ca5FDD1bc33fc4CFfd6d34069BAec';
  const qimasterChefContract = useMasterChefContract(
    2,
    undefined,
    QIGammaMasterChef,
  );

  const qiPoolData = useSingleCallResult(qimasterChefContract, 'poolInfo', [2]);

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
                rewarder['rewardPerSecond'] &&
                Number(rewarder['rewardPerSecond']) > 0 &&
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

  const gammaRewardsWithUSDPrice = useUSDCPricesFromAddresses(
    gammaRewardTokenAddressesWithQI,
  );

  const qiPrice = gammaRewardsWithUSDPrice?.find(
    (item) => item.address.toLowerCase() === qiTokenAddress.toLowerCase(),
  )?.price;

  const qiAPR =
    qiRewardPerSecond &&
    qiPrice &&
    gammaData &&
    gammaData[qiGammaFarm.toLowerCase()] &&
    gammaData[qiGammaFarm.toLowerCase()]['tvlUSD']
      ? (qiRewardPerSecond * qiPrice * 3600 * 24 * 365) /
        gammaData[qiGammaFarm.toLowerCase()]['tvlUSD']
      : undefined;

  if (gammaRewards && GAMMA_MASTERCHEF_ADDRESSES[2][chainId] && qiAPR) {
    const qiRewardsData = {
      apr: qiAPR,
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

  const filteredFarms = allGammaFarms
    .map((item) => {
      if (chainId) {
        const token0Data = getTokenFromAddress(
          item.token0Address,
          chainId,
          tokenMap,
          [],
        );
        const token1Data = getTokenFromAddress(
          item.token1Address,
          chainId,
          tokenMap,
          [],
        );
        const token0 = new Token(
          chainId,
          token0Data.address,
          token0Data.decimals,
          token0Data.symbol,
          token0Data.name,
        );
        const token1 = new Token(
          chainId,
          token1Data.address,
          token1Data.decimals,
          token1Data.symbol,
          token1Data.name,
        );
        return { ...item, token0, token1 };
      }
      return { ...item, token0: null, token1: null };
    })
    .filter((item) => {
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
        !!GlobalData.blueChips.find(
          (token) =>
            item.token0 &&
            token.address.toLowerCase() === item.token0.address.toLowerCase(),
        ) &&
        !!GlobalData.blueChips.find(
          (token) =>
            item.token1 &&
            token.address.toLowerCase() === item.token1.address.toLowerCase(),
        );
      const stableCoinCondition =
        !!GlobalData.stableCoins.find(
          (token) =>
            item.token0 &&
            token.address.toLowerCase() === item.token0.address.toLowerCase(),
        ) &&
        !!GlobalData.stableCoins.find(
          (token) =>
            item.token1 &&
            token.address.toLowerCase() === item.token1.address.toLowerCase(),
        );

      const stablePair0 = GlobalData.stablePairs.find(
        (tokens) =>
          !!tokens.find(
            (token) =>
              item.token0 &&
              token.address.toLowerCase() === item.token0.address.toLowerCase(),
          ),
      );
      const stablePair1 = GlobalData.stablePairs.find(
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
    .sort((farm0, farm1) => {
      const gammaData0 = gammaData
        ? gammaData[farm0.address.toLowerCase()]
        : undefined;
      const gammaData1 = gammaData
        ? gammaData[farm1.address.toLowerCase()]
        : undefined;
      const farm0MasterChefAddress =
        chainId &&
        GAMMA_MASTERCHEF_ADDRESSES[farm0.masterChefIndex ?? 0][chainId]
          ? GAMMA_MASTERCHEF_ADDRESSES[farm0.masterChefIndex ?? 0][
              chainId
            ].toLowerCase()
          : undefined;
      const farm1MasterChefAddress =
        chainId &&
        GAMMA_MASTERCHEF_ADDRESSES[farm1.masterChefIndex ?? 0][chainId]
          ? GAMMA_MASTERCHEF_ADDRESSES[farm1.masterChefIndex ?? 0][
              chainId
            ].toLowerCase()
          : undefined;
      const gammaReward0 =
        gammaRewards &&
        farm0MasterChefAddress &&
        gammaRewards[farm0MasterChefAddress] &&
        gammaRewards[farm0MasterChefAddress]['pools']
          ? gammaRewards[farm0MasterChefAddress]['pools'][
              farm0.address.toLowerCase()
            ]
          : undefined;
      const gammaReward1 =
        gammaRewards &&
        farm1MasterChefAddress &&
        gammaRewards[farm1MasterChefAddress] &&
        gammaRewards[farm1MasterChefAddress]['pools']
          ? gammaRewards[farm1MasterChefAddress]['pools'][
              farm1.address.toLowerCase()
            ]
          : undefined;

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
        const tvl0 =
          gammaData0 && gammaData0['tvlUSD'] ? Number(gammaData0['tvlUSD']) : 0;
        const tvl1 =
          gammaData1 && gammaData1['tvlUSD'] ? Number(gammaData1['tvlUSD']) : 0;
        return tvl0 > tvl1 ? sortMultiplier : -1 * sortMultiplier;
      } else if (sortBy === v3FarmSortBy.rewards) {
        const farm0RewardUSD =
          gammaReward0 && gammaReward0['rewarders']
            ? Object.values(gammaReward0['rewarders']).reduce(
                (total: number, rewarder: any) => {
                  const rewardUSD = gammaRewardsWithUSDPrice?.find(
                    (item) =>
                      item.address.toLowerCase() ===
                      rewarder.rewardToken.toLowerCase(),
                  );
                  return (
                    total + (rewardUSD?.price ?? 0) * rewarder.rewardPerSecond
                  );
                },
                0,
              )
            : 0;
        const farm1RewardUSD =
          gammaReward1 && gammaReward1['rewarders']
            ? Object.values(gammaReward1['rewarders']).reduce(
                (total: number, rewarder: any) => {
                  const rewardUSD = gammaRewardsWithUSDPrice?.find(
                    (item) =>
                      item.address.toLowerCase() ===
                      rewarder.rewardToken.toLowerCase(),
                  );
                  return (
                    total + (rewardUSD?.price ?? 0) * rewarder.rewardPerSecond
                  );
                },
                0,
              )
            : 0;
        return farm0RewardUSD > farm1RewardUSD
          ? sortMultiplier
          : -1 * sortMultiplier;
      } else if (sortBy === v3FarmSortBy.apr) {
        const poolAPR0 =
          gammaData0 &&
          gammaData0['returns'] &&
          gammaData0['returns']['allTime'] &&
          gammaData0['returns']['allTime']['feeApr']
            ? Number(gammaData0['returns']['allTime']['feeApr'])
            : 0;
        const poolAPR1 =
          gammaData1 &&
          gammaData1['returns'] &&
          gammaData1['returns']['allTime'] &&
          gammaData1['returns']['allTime']['feeApr']
            ? Number(gammaData1['returns']['allTime']['feeApr'])
            : 0;
        const farmAPR0 =
          gammaReward0 && gammaReward0['apr'] ? Number(gammaReward0['apr']) : 0;
        const farmAPR1 =
          gammaReward1 && gammaReward1['apr'] ? Number(gammaReward1['apr']) : 0;
        return poolAPR0 + farmAPR0 > poolAPR1 + farmAPR1
          ? sortMultiplier
          : -1 * sortMultiplier;
      }
      return 1;
    });

  return (
    <Box px={2} py={3}>
      {gammaFarmsLoading || gammaRewardsLoading ? (
        <div className='flex justify-center' style={{ padding: '16px 0' }}>
          <Loader stroke='white' size='1.5rem' />
        </div>
      ) : filteredFarms.length === 0 ? (
        <div
          className='flex flex-col items-center'
          style={{ padding: '16px 0' }}
        >
          <Frown size={'2rem'} stroke={'white'} />
          <p style={{ marginTop: 12 }}>{t('noGammaFarms')}</p>
        </div>
      ) : !gammaFarmsLoading && filteredFarms.length > 0 && chainId ? (
        <Box>
          {filteredFarms.map((farm) => {
            const gfMasterChefAddress = GAMMA_MASTERCHEF_ADDRESSES[
              farm.masterChefIndex ?? 0
            ][chainId]
              ? GAMMA_MASTERCHEF_ADDRESSES[farm.masterChefIndex ?? 0][
                  chainId
                ].toLowerCase()
              : undefined;
            return (
              <Box mb={2} key={farm.address}>
                <GammaFarmCard
                  token0={farm.token0}
                  token1={farm.token1}
                  pairData={farm}
                  data={
                    gammaData
                      ? gammaData[farm.address.toLowerCase()]
                      : undefined
                  }
                  rewardData={
                    gammaRewards &&
                    gfMasterChefAddress &&
                    gammaRewards[gfMasterChefAddress] &&
                    gammaRewards[gfMasterChefAddress]['pools']
                      ? gammaRewards[gfMasterChefAddress]['pools'][
                          farm.address.toLowerCase()
                        ]
                      : undefined
                  }
                />
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
};

export default GammaFarmsPage;
