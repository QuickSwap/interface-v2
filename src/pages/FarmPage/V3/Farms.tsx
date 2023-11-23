import React, { useCallback, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import CustomSelector from 'components/v3/CustomSelector';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import EternalFarmsPage from 'pages/EternalFarmsPage';
import GammaFarmsPage from 'pages/GammaFarmsPage';
import { FarmingMyFarms } from 'components/StakerMyStakes';
import { useActiveWeb3React } from 'hooks';
import { ChainId, Token } from '@uniswap/sdk';
import { SelectorItem } from 'components/v3/CustomSelector/CustomSelector';
import { SearchInput, SortColumns, CustomSwitch } from 'components';
import { GlobalConst } from 'constants/index';
import {
  useUnipilotFarmData,
  useUnipilotFarms,
  useUnipilotFilteredFarms,
} from 'hooks/v3/useUnipilotFarms';
import UnipilotFarmsPage from 'pages/UnipilotFarmsPage';
import { getAllGammaPairs } from 'utils';
import SteerFarmsPage from 'pages/SteerFarmsPage';
import {
  useSteerFilteredFarms,
  useSteerStakingPools,
} from 'hooks/v3/useSteerData';
import { useEternalFarms } from 'hooks/useIncentiveSubgraph';
import {
  useEternalFarmsFiltered,
  useGammaFarmsFiltered,
} from 'hooks/v3/useV3Farms';

export interface V3Farm {
  token0?: Token;
  token1?: Token;
  title?: string;
  tvl: number;
  rewards: {
    amount: number;
    token: { address: string; symbol: string; decimals: number };
  }[];
  rewardUSD: number;
  poolAPR: number;
  farmAPR: number;
  type: string;
}

export default function Farms() {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  const parsedQuery = useParsedQueryString();
  const farmStatus =
    parsedQuery && parsedQuery.farmStatus
      ? (parsedQuery.farmStatus as string)
      : 'active';
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const history = useHistory();

  const [searchValue, setSearchValue] = useState('');

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
    );

  const redirectWithFarmStatus = (status: string) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath;
    if (parsedQuery && parsedQuery.farmStatus) {
      redirectPath = currentPath.replace(
        `farmStatus=${parsedQuery.farmStatus}`,
        `farmStatus=${status}`,
      );
    } else {
      redirectPath = `${currentPath}${
        history.location.search === '' ? '?' : '&'
      }farmStatus=${status}`;
    }
    history.push(redirectPath);
  };

  const currentTabQueried =
    parsedQuery && parsedQuery.tab ? (parsedQuery.tab as string) : 'farms';

  const v3FarmCategories = useMemo(() => {
    return [
      {
        text: t('farms'),
        id: 1,
        link: 'farms',
      },
      {
        text: t('myFarms'),
        id: 0,
        link: 'my-farms',
      },
    ];
  }, [t]);

  const onChangeFarmCategory = useCallback(
    (selected: SelectorItem) => {
      history.push(`?tab=${selected?.link}`);
    },
    [history],
  );

  const selectedFarmCategory = useMemo(() => {
    const tab = v3FarmCategories.find(
      (item) => item?.link === currentTabQueried,
    );
    if (!tab) {
      return v3FarmCategories[0];
    } else {
      return tab;
    }
  }, [currentTabQueried, v3FarmCategories]);

  const [sortBy, setSortBy] = useState(GlobalConst.utils.v3FarmSortBy.pool);
  const [sortDesc, setSortDesc] = useState(false);

  const farmStatusItems = [
    {
      text: t('active'),
      onClick: () => {
        redirectWithFarmStatus('active');
      },
      condition: farmStatus === 'active',
    },
    {
      text: t('ended'),
      onClick: () => {
        redirectWithFarmStatus('ended');
      },
      condition: farmStatus === 'ended',
    },
  ];

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
      text: t('rewards'),
      index: GlobalConst.utils.v3FarmSortBy.rewards,
      width: 0.3,
      justify: 'flex-start',
    },
    {
      text: t('apr'),
      index: GlobalConst.utils.v3FarmSortBy.apr,
      width: 0.2,
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

  return (
    <Box className='bg-palette' borderRadius={10}>
      <Box pt={2} px={2} className='flex flex-wrap justify-between'>
        <CustomSelector
          height={36}
          items={v3FarmCategories}
          selectedItem={selectedFarmCategory}
          handleChange={onChangeFarmCategory}
        />
        <Box
          className='flex items-center flex-wrap'
          width={isMobile ? '100%' : 'auto'}
        >
          {selectedFarmCategory.id !== 0 && (
            <Box mt={isMobile ? 2 : 0} width={isMobile ? '100%' : 160}>
              <CustomSwitch width='100%' height={40} items={farmStatusItems} />
            </Box>
          )}
          <Box
            mt={isMobile ? 2 : 0}
            ml={isMobile ? 0 : 2}
            width={isMobile ? '100%' : 200}
          >
            <SearchInput
              placeholder='Search'
              value={searchValue}
              setValue={setSearchValue}
              isIconAfter
            />
          </Box>
        </Box>
      </Box>

      {selectedFarmCategory.id !== 0 && (
        <>
          <Box mt={2} pl='12px' className='bg-secondary1'>
            <CustomTabSwitch
              items={farmFilters}
              value={farmFilter}
              handleTabChange={setFarmFilter}
              height={50}
            />
          </Box>
          {!isMobile && (
            <Box mt={2} px={3.5}>
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

      {selectedFarmCategory?.id === 0 && (
        <FarmingMyFarms search={searchValue} chainId={chainIdToUse} />
      )}
      {selectedFarmCategory?.id === 1 && (
        <EternalFarmsPage
          farmFilter={farmFilter}
          search={searchValue}
          sortBy={sortBy}
          sortDesc={sortDesc}
          chainId={chainIdToUse}
        />
      )}
      {selectedFarmCategory?.id === 2 && (
        <GammaFarmsPage
          farmFilter={farmFilter}
          search={searchValue}
          sortBy={sortBy}
          sortDesc={sortDesc}
        />
      )}
      {selectedFarmCategory?.id === 3 && (
        <UnipilotFarmsPage
          farmFilter={farmFilter}
          search={searchValue}
          sortBy={sortBy}
          sortDesc={sortDesc}
        />
      )}
      {selectedFarmCategory?.id === 4 && (
        <SteerFarmsPage
          farmFilter={farmFilter}
          search={searchValue}
          sortBy={sortBy}
          sortDesc={sortDesc}
        />
      )}
    </Box>
  );
}
