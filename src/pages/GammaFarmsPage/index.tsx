import React from 'react';
import { Box } from 'theme/components';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import {
  GammaPair,
  GammaPairs,
  GlobalConst,
  GlobalData,
  GlobalValue,
} from 'constants/index';
import { useQuery } from 'react-query';
import GammaFarmCard from './GammaFarmCard';
import { getTokenFromAddress } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { Token } from '@uniswap/sdk';
import { GAMMA_MASTERCHEF_ADDRESSES } from 'constants/v3/addresses';
import { useUSDCPricesToken } from 'utils/useUSDCPrice';

const GammaFarmsPage: React.FC<{
  farmFilter: string;
  search: string;
  sortBy: string;
  sortDesc: boolean;
}> = ({ farmFilter, search, sortBy, sortDesc }) => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const allGammaFarms = ([] as GammaPair[])
    .concat(...Object.values(GammaPairs))
    .filter((item) => item.ableToFarm);
  const sortMultiplier = sortDesc ? -1 : 1;
  const { v3FarmSortBy, v3FarmFilter } = GlobalConst.utils;

  const fetchGammaData = async () => {
    try {
      const data = await fetch(
        `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/polygon/hypervisors/allData`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch {
      try {
        const data = await fetch(
          `${process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP}/quickswap/polygon/hypervisors/allData`,
        );
        const gammaData = await data.json();
        return gammaData;
      } catch (e) {
        console.log(e);
        return;
      }
    }
  };

  const fetchGammaRewards = async () => {
    try {
      const data = await fetch(
        `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/polygon/allRewards2`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch {
      try {
        const data = await fetch(
          `${process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP}/quickswap/polygon/allRewards2`,
        );
        const gammaData = await data.json();
        return gammaData;
      } catch (e) {
        console.log(e);
        return;
      }
    }
  };

  const fetchGammaPositions = async () => {
    if (!account) return;
    try {
      const data = await fetch(
        `${process.env.REACT_APP_GAMMA_API_ENDPOINT}/quickswap/polygon/user/${account}`,
      );
      const positions = await data.json();
      return positions[account.toLowerCase()];
    } catch (e) {
      try {
        const data = await fetch(
          `${process.env.REACT_APP_GAMMA_API_ENDPOINT_BACKUP}/quickswap/polygon/user/${account}`,
        );
        const positions = await data.json();
        return positions[account.toLowerCase()];
      } catch (e) {
        console.log(e);
        return;
      }
    }
  };

  const { isLoading: positionsLoading, data: gammaPositions } = useQuery(
    'fetchGammaPositions',
    fetchGammaPositions,
    {
      refetchInterval: 30000,
    },
  );

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

  const gammaRewardTokens =
    gammaRewards &&
    chainId &&
    gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]] &&
    gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools']
      ? ([] as string[])
          .concat(
            ...Object.values(
              gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools'],
            ).map((item: any) =>
              item && item['rewarders']
                ? Object.values(item['rewarders'])
                    .filter(
                      (rewarder: any) =>
                        rewarder && Number(rewarder['rewardPerSecond']) > 0,
                    )
                    .map((rewarder: any) => rewarder.rewardToken)
                : [],
            ),
          )
          .filter(
            (value, index, self) =>
              index ===
              self.findIndex((t) => t.toLowerCase() === value.toLowerCase()),
          )
          .map((tokenAddress) => {
            const tokenData = getTokenFromAddress(
              tokenAddress,
              chainId,
              tokenMap,
              [],
            );
            return new Token(
              chainId,
              tokenData.address,
              tokenData.decimals,
              tokenData.symbol,
              tokenData.name,
            );
          })
      : [];

  const rewardUSDPrices = useUSDCPricesToken(gammaRewardTokens);
  const gammaRewardsWithUSDPrice = gammaRewardTokens.map((token, ind) => {
    return { price: rewardUSDPrices[ind], tokenAddress: token.address };
  });

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
      const stableLPCondition =
        item.token0 &&
        item.token1 &&
        ((item.token0.address.toLowerCase() ===
          GlobalValue.tokens.MATIC.address.toLowerCase() &&
          (item.token1.address.toLowerCase() ===
            GlobalValue.tokens.COMMON.MATICX.address.toLowerCase() ||
            item.token1.address.toLowerCase() ===
              GlobalValue.tokens.COMMON.STMATIC.address.toLowerCase())) ||
          (item.token1.address.toLowerCase() ===
            GlobalValue.tokens.MATIC.address.toLowerCase() &&
            (item.token0.address.toLowerCase() ===
              GlobalValue.tokens.COMMON.MATICX.address.toLowerCase() ||
              item.token0.address.toLowerCase() ===
                GlobalValue.tokens.COMMON.STMATIC.address.toLowerCase())) ||
          (item.token0.address.toLowerCase() ===
            GlobalValue.tokens.COMMON.NEW_QUICK.address.toLowerCase() &&
            item.token1.address.toLowerCase() ===
              GlobalValue.tokens.COMMON.NEW_DQUICK.address.toLowerCase()) ||
          (item.token1.address.toLowerCase() ===
            GlobalValue.tokens.COMMON.NEW_QUICK.address.toLowerCase() &&
            item.token0.address.toLowerCase() ===
              GlobalValue.tokens.COMMON.NEW_DQUICK.address.toLowerCase()));

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
      const gammaReward0 =
        gammaRewards &&
        chainId &&
        gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]] &&
        gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools']
          ? gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools'][
              farm0.address.toLowerCase()
            ]
          : undefined;
      const gammaReward1 =
        gammaRewards &&
        chainId &&
        gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]] &&
        gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools']
          ? gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools'][
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
                  const rewardUSD = gammaRewardsWithUSDPrice.find(
                    (item) =>
                      item.tokenAddress.toLowerCase() ===
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
                  const rewardUSD = gammaRewardsWithUSDPrice.find(
                    (item) =>
                      item.tokenAddress.toLowerCase() ===
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
      } else if (sortBy === v3FarmSortBy.poolAPR) {
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
        return poolAPR0 > poolAPR1 ? sortMultiplier : -1 * sortMultiplier;
      } else if (sortBy === v3FarmSortBy.farmAPR) {
        const farmAPR0 =
          gammaReward0 && gammaReward0['apr'] ? Number(gammaReward0['apr']) : 0;
        const farmAPR1 =
          gammaReward1 && gammaReward1['apr'] ? Number(gammaReward1['apr']) : 0;
        return farmAPR0 > farmAPR1 ? sortMultiplier : -1 * sortMultiplier;
      }
      return 1;
    });

  return (
    <Box padding='24px 16px'>
      {positionsLoading || gammaFarmsLoading || gammaRewardsLoading ? (
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
          {filteredFarms.map((farm) => (
            <Box margin='0 0 16px' key={farm.address}>
              <GammaFarmCard
                token0={farm.token0}
                token1={farm.token1}
                pairData={farm}
                positionData={
                  gammaPositions
                    ? gammaPositions[farm.address.toLowerCase()]
                    : undefined
                }
                data={
                  gammaData ? gammaData[farm.address.toLowerCase()] : undefined
                }
                rewardData={
                  gammaRewards &&
                  gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]] &&
                  gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]]['pools']
                    ? gammaRewards[GAMMA_MASTERCHEF_ADDRESSES[chainId]][
                        'pools'
                      ][farm.address.toLowerCase()]
                    : undefined
                }
              />
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default GammaFarmsPage;
