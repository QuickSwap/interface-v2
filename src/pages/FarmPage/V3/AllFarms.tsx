import React, { useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import 'pages/styles/convertQUICK.scss';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { GlobalConst } from 'constants/index';
import { useEternalFarms } from 'hooks/useIncentiveSubgraph';
import {
  useSteerFilteredFarms,
  useSteerStakingPools,
} from 'hooks/v3/useSteerData';
import { Token } from '@uniswap/sdk';
import { getAllGammaPairs } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { SortColumns, ToggleSwitch } from 'components';
import {
  useEternalFarmsFiltered,
  useGammaFarmsFiltered,
} from 'hooks/v3/useV3Farms';
import {
  useUnipilotFarmData,
  useUnipilotFarms,
  useUnipilotFilteredFarms,
} from 'hooks/v3/useUnipilotFarms';
import { V3Farm } from './Farms';
import Loader from 'components/Loader';
import V3FarmCard from './FarmCard';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useCurrency } from 'hooks/v3/Tokens';
import CustomSelector from 'components/v3/CustomSelector';
import V3FarmWithCurrency from './FarmWithCurrency';

interface Props {
  searchValue: string;
  farmStatus: string;
}

const AllV3Farms: React.FC<Props> = ({ searchValue, farmStatus }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const farmFilters = useMemo(
    () => [
      {
        text: t('allFarms'),
        id: GlobalConst.utils.v3FarmFilter.allFarms,
      },
      {
        text: t('stablecoins'),
        id: GlobalConst.utils.v3FarmFilter.stableCoin,
      },
      {
        text: t('blueChips'),
        id: GlobalConst.utils.v3FarmFilter.blueChip,
      },
      {
        text: t('stableLPs'),
        id: GlobalConst.utils.v3FarmFilter.stableLP,
      },
      {
        text: t('otherLPs'),
        id: GlobalConst.utils.v3FarmFilter.otherLP,
      },
    ],
    [t],
  );
  const [farmFilter, setFarmFilter] = useState(farmFilters[0].id);

  const [sortBy, setSortBy] = useState(GlobalConst.utils.v3FarmSortBy.pool);
  const [sortDesc, setSortDesc] = useState(false);
  const sortMultiplier = sortDesc ? 1 : -1;

  const sortColumns = [
    {
      text: t('pool'),
      index: GlobalConst.utils.v3FarmSortBy.pool,
      width: 0.3,
      justify: 'flex-start',
    },
    {
      text: t('tvl'),
      index: GlobalConst.utils.v3FarmSortBy.tvl,
      width: 0.2,
      justify: 'flex-start',
    },
    {
      text: t('apr'),
      index: GlobalConst.utils.v3FarmSortBy.apr,
      width: 0.2,
      justify: 'flex-start',
    },
    {
      text: t('rewards'),
      index: GlobalConst.utils.v3FarmSortBy.rewards,
      width: 0.3,
      justify: 'flex-start',
    },
  ];

  const sortByDesktopItems = sortColumns.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortBy === item.index) {
          setSortDesc(!sortDesc);
        } else {
          setSortBy(item.index);
          setSortDesc(false);
        }
      },
    };
  });

  const {
    data: allEternalFarms,
    isLoading: eternalFarmsLoading,
  } = useEternalFarms();
  const eternalFarmsByStatus = useMemo(() => {
    if (!allEternalFarms) return [];
    return allEternalFarms
      .filter((farm) => {
        if (farmStatus === 'active') {
          return (
            (Number(farm.reward) > 0 || Number(farm.bonusReward) > 0) &&
            ((farm.rewardRate && Number(farm.rewardRate) > 0) ||
              (farm.bonusRewardRate && Number(farm.bonusRewardRate) > 0))
          );
        }
        return Number(farm.reward) === 0 && Number(farm.bonusReward) === 0;
      })
      .map((farm) => {
        return {
          ...farm,
          rewardRate: farmStatus === 'ended' ? '0' : farm.rewardRate,
          bonusRewardRate: farmStatus === 'ended' ? '0' : farm.bonusRewardRate,
        };
      });
  }, [allEternalFarms, farmStatus]);
  const {
    loading: loadingQSFarms,
    data: filteredEternalFarms,
  } = useEternalFarmsFiltered(
    eternalFarmsByStatus,
    chainId,
    searchValue,
    farmFilter,
  );

  const allGammaPairs = getAllGammaPairs(chainId).filter(
    (item) => item.ableToFarm === (farmStatus === 'active'),
  );
  const {
    loading: loadingGamma,
    data: filteredGammaFarms,
  } = useGammaFarmsFiltered(allGammaPairs, chainId, searchValue, farmFilter);

  const {
    data: unipilotFarmsArray,
    loading: unipilotFarmsLoading,
  } = useUnipilotFarms(chainId);
  const unipilotFarms = useMemo(() => {
    if (!unipilotFarmsArray) return [];
    return unipilotFarmsArray;
  }, [unipilotFarmsArray]);
  const farmAddresses = unipilotFarms.map((farm: any) => farm.id);
  const {
    loading: unipilotFarmDataLoading,
    data: unipilotFarmData,
  } = useUnipilotFarmData(farmAddresses, chainId);
  const filteredUnipilotFarms = useUnipilotFilteredFarms(
    unipilotFarms,
    unipilotFarmData,
    farmFilter,
    searchValue,
  );

  const {
    data: steerFarmsArray,
    loading: steerFarmsLoading,
  } = useSteerStakingPools(chainId, farmStatus);
  const steerFarms = useMemo(() => {
    if (!steerFarmsArray) return [];
    return steerFarmsArray;
  }, [steerFarmsArray]);
  const filteredSteerFarms = useSteerFilteredFarms(
    steerFarms ?? [],
    chainId,
    searchValue,
    farmFilter,
  );

  const loading =
    eternalFarmsLoading ||
    loadingQSFarms ||
    loadingGamma ||
    unipilotFarmsLoading ||
    unipilotFarmDataLoading ||
    steerFarmsLoading;

  const v3Farms = filteredEternalFarms
    .concat(filteredGammaFarms)
    .concat(filteredUnipilotFarms)
    .concat(filteredSteerFarms)
    .reduce(
      (memo: { token0: Token; token1: Token; farms: V3Farm[] }[], farm) => {
        if (farm.token0 && farm.token1) {
          const token0Address = farm.token0?.address ?? '';
          const token1Address = farm.token1?.address ?? '';
          const farmIndex = memo.findIndex(
            (item) =>
              ((item.token0?.address ?? '').toLowerCase() ===
                token0Address.toLowerCase() &&
                (item.token1?.address ?? '').toLowerCase() ===
                  token1Address.toLowerCase()) ||
              ((item.token0?.address ?? '').toLowerCase() ===
                token1Address.toLowerCase() &&
                (item.token1?.address ?? '').toLowerCase() ===
                  token0Address.toLowerCase()),
          );
          if (farmIndex > -1) {
            memo[farmIndex].farms.push(farm);
          } else {
            memo.push({
              token0: farm.token0,
              token1: farm.token1,
              farms: [farm],
            });
          }
        }

        return memo;
      },
      [],
    )
    .map((item) => {
      const tvl = item.farms.reduce((total, farm) => total + farm.tvl, 0);
      const rewardsUSD = item.farms.reduce(
        (total, farm) => total + farm.rewardUSD,
        0,
      );
      const apr = item.farms.reduce(
        (value, farm) => Math.max(value, farm.farmAPR + farm.poolAPR),
        0,
      );
      const title = (item.token0.symbol ?? '') + (item.token1.symbol ?? '');
      return { ...item, tvl, rewardsUSD, apr, title };
    })
    .sort((farm1, farm2) => {
      if (sortBy === GlobalConst.utils.v3FarmSortBy.pool) {
        return farm1.title > farm2.title ? sortMultiplier : -1 * sortMultiplier;
      }
      if (sortBy === GlobalConst.utils.v3FarmSortBy.tvl) {
        return farm1.tvl > farm2.tvl ? sortMultiplier : -1 * sortMultiplier;
      }
      if (sortBy === GlobalConst.utils.v3FarmSortBy.apr) {
        return farm1.apr > farm2.apr ? sortMultiplier : -1 * sortMultiplier;
      }
      if (sortBy === GlobalConst.utils.v3FarmSortBy.rewards) {
        return farm1.rewardsUSD > farm2.rewardsUSD
          ? sortMultiplier
          : -1 * sortMultiplier;
      }
      return 1;
    });

  const parsedQuery = useParsedQueryString();
  const currency0Id =
    parsedQuery && parsedQuery.currency0
      ? parsedQuery.currency0.toString()
      : undefined;
  const currency1Id =
    parsedQuery && parsedQuery.currency1
      ? parsedQuery.currency1.toString()
      : undefined;
  const currency0 = useCurrency(currency0Id);
  const currency1 = useCurrency(currency1Id);

  const currencySelected = !!currency0 && !!currency1;

  const selectedFarms = useMemo(() => {
    return (
      v3Farms.find(
        (item) =>
          currency0 &&
          currency1 &&
          ((item.token0.address.toLowerCase() ===
            currency0.wrapped.address.toLowerCase() &&
            item.token1.address.toLowerCase() ===
              currency1.wrapped.address.toLowerCase()) ||
            (item.token1.address.toLowerCase() ===
              currency0.wrapped.address.toLowerCase() &&
              item.token0.address.toLowerCase() ===
                currency1.wrapped.address.toLowerCase())),
      )?.farms ?? []
    );
  }, [currency0, currency1, v3Farms]);

  const farmTypes = useMemo(() => {
    const mTypes = selectedFarms.reduce((memo: string[], item) => {
      if (item.title && !memo.includes(item.title)) {
        memo.push(item.title);
      }
      return memo;
    }, []);

    return [
      {
        text: t('all'),
        id: 0,
        link: 'all',
      },
    ].concat(
      mTypes.map((item, ind) => {
        return { text: item.toUpperCase(), id: ind + 1, link: item };
      }),
    );
  }, [selectedFarms, t]);

  const [farmType, setFarmType] = useState(farmTypes[0]);
  const [staked, setStaked] = useState(false);

  return (
    <Box pt={2}>
      {currencySelected ? (
        <Box className='flex justify-between items-center' px={2} mb={2}>
          <Box className='flex'>
            {selectedFarms.length > 1 && (
              <CustomSelector
                height={36}
                items={farmTypes}
                selectedItem={farmType}
                handleChange={setFarmType}
              />
            )}
          </Box>
          <Box className='flex items-center' gridGap={6}>
            <small className='text-secondary'>{t('staked')}</small>
            <ToggleSwitch
              toggled={staked}
              onToggle={() => setStaked(!staked)}
            />
          </Box>
        </Box>
      ) : (
        <>
          <Box pl='12px' className='bg-secondary1'>
            <CustomTabSwitch
              items={farmFilters}
              value={farmFilter}
              handleTabChange={setFarmFilter}
              height={50}
            />
          </Box>
          {!isMobile && (
            <Box px={5} py={1}>
              <Box width='90%'>
                <SortColumns
                  sortColumns={sortByDesktopItems}
                  selectedSort={sortBy}
                  sortDesc={sortDesc}
                />
              </Box>
            </Box>
          )}
        </>
      )}

      {loading ? (
        <Box minHeight={200} className='flex justify-center items-center'>
          <Loader stroke={'white'} size={'1.5rem'} />
        </Box>
      ) : (
        <Box px={2}>
          {currencySelected
            ? selectedFarms.map((farm, ind) => (
                <Box key={ind} pb={2}>
                  <V3FarmWithCurrency farm={farm} />
                </Box>
              ))
            : v3Farms.map((farm, ind) => (
                <Box key={ind} pb={2}>
                  <V3FarmCard farm={farm} />
                </Box>
              ))}
        </Box>
      )}
    </Box>
  );
};

export default AllV3Farms;
