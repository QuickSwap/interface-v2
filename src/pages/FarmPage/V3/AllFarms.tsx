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
import { useMerklFarms } from 'hooks/v3/useV3Farms';
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

  const { isLoading: loading, data: farmData } = useMerklFarms();
  const farms = farmData ?? [];

  console.log('aaa', farms);

  // const v3Farms = farms
  //   .map((item: any) => {
  //     const tvl = item.farms.reduce((total, farm) => total + farm.tvl, 0);
  //     const rewardsUSD = item.farms.reduce(
  //       (total, farm) => total + farm.rewardUSD,
  //       0,
  //     );
  //     const apr = item.farms.reduce(
  //       (value, farm) => Math.max(value, farm.farmAPR + farm.poolAPR),
  //       0,
  //     );
  //     const title = (item.token0.symbol ?? '') + (item.token1.symbol ?? '');
  //     return { ...item, tvl, rewardsUSD, apr, title };
  //   })
  //   .sort((farm1, farm2) => {
  //     if (sortBy === GlobalConst.utils.v3FarmSortBy.pool) {
  //       return farm1.title > farm2.title ? sortMultiplier : -1 * sortMultiplier;
  //     }
  //     if (sortBy === GlobalConst.utils.v3FarmSortBy.tvl) {
  //       return farm1.tvl > farm2.tvl ? sortMultiplier : -1 * sortMultiplier;
  //     }
  //     if (sortBy === GlobalConst.utils.v3FarmSortBy.apr) {
  //       return farm1.apr > farm2.apr ? sortMultiplier : -1 * sortMultiplier;
  //     }
  //     if (sortBy === GlobalConst.utils.v3FarmSortBy.rewards) {
  //       return farm1.rewardsUSD > farm2.rewardsUSD
  //         ? sortMultiplier
  //         : -1 * sortMultiplier;
  //     }
  //     return 1;
  //   });

  // const parsedQuery = useParsedQueryString();
  // const currency0Id =
  //   parsedQuery && parsedQuery.currency0
  //     ? parsedQuery.currency0.toString()
  //     : undefined;
  // const currency1Id =
  //   parsedQuery && parsedQuery.currency1
  //     ? parsedQuery.currency1.toString()
  //     : undefined;
  // const currency0 = useCurrency(currency0Id);
  // const currency1 = useCurrency(currency1Id);

  // const currencySelected = !!currency0 && !!currency1;

  // const selectedFarms = useMemo(() => {
  //   return (
  //     v3Farms.find(
  //       (item) =>
  //         currency0 &&
  //         currency1 &&
  //         ((item.token0.address.toLowerCase() ===
  //           currency0.wrapped.address.toLowerCase() &&
  //           item.token1.address.toLowerCase() ===
  //             currency1.wrapped.address.toLowerCase()) ||
  //           (item.token1.address.toLowerCase() ===
  //             currency0.wrapped.address.toLowerCase() &&
  //             item.token0.address.toLowerCase() ===
  //               currency1.wrapped.address.toLowerCase())),
  //     )?.farms ?? []
  //   );
  // }, [currency0, currency1, v3Farms]);

  // const farmTypes = useMemo(() => {
  //   const mTypes = selectedFarms.reduce((memo: string[], item) => {
  //     if (item.title && !memo.includes(item.title)) {
  //       memo.push(item.title);
  //     }
  //     return memo;
  //   }, []);

  //   return [
  //     {
  //       text: t('all'),
  //       id: 0,
  //       link: 'all',
  //     },
  //   ].concat(
  //     mTypes.map((item, ind) => {
  //       return { text: item.toUpperCase(), id: ind + 1, link: item };
  //     }),
  //   );
  // }, [selectedFarms, t]);

  const [farmType, setFarmType] = useState();
  const [staked, setStaked] = useState(false);

  return (
    <Box pt={2}>
      {/* {currencySelected ? (
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
      )} */}
    </Box>
  );
};

export default AllV3Farms;
