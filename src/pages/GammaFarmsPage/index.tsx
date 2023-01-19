import React from 'react';
import { Box } from '@material-ui/core';
import { Frown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/Loader';
import { GammaPair, GammaPairs, GlobalConst } from 'constants/index';
import { useQuery } from 'react-query';
import GammaFarmCard from './GammaFarmCard';
import { getTokenFromAddress } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { Token } from '@uniswap/sdk';
import { GAMMA_MASTERCHEF_ADDRESSES } from 'constants/v3/addresses';

const GammaFarmsPage: React.FC<{
  farmFilter: number;
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
  const { v3FarmSortBy } = GlobalConst.utils;

  const fetchGammaData = async () => {
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/hypervisors/allData`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const fetchGammaRewards = async () => {
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/allRewards2`,
      );
      const gammaData = await data.json();
      return gammaData;
    } catch (e) {
      console.log(e);
      return;
    }
  };

  const fetchGammaPositions = async () => {
    if (!account) return;
    try {
      const data = await fetch(
        `https://gammawire.net/quickswap/polygon/user/${account}`,
      );
      const positions = await data.json();
      return positions[account.toLowerCase()];
    } catch (e) {
      console.log(e);
      return;
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
      if (search) {
        return (
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
          item.title.toLowerCase().includes(search.toLowerCase())
        );
      }
      return true;
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
        return 1;
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
    <Box px={2} py={3}>
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
            <Box mb={2} key={farm.address}>
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
