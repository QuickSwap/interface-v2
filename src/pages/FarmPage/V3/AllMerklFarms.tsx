import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { GlobalConst, GlobalData } from 'constants/index';
import { DoubleCurrencyLogo, SortColumns, ToggleSwitch } from 'components';
import { useGetMerklRewards, useMerklFarms } from 'hooks/v3/useV3Farms';
import Loader from 'components/Loader';
import MerklFarmCard from './MerklFarmCard';
import useParsedQueryString from 'hooks/useParsedQueryString';
import CustomSelector from 'components/v3/CustomSelector';
import MerklPairFarmCard from './MerklPairFarmCard';
import { getAllDefiedgeStrategies, getAllGammaPairs } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useHistory } from 'react-router-dom';
import { useCurrency } from 'hooks/v3/Tokens';
import { KeyboardArrowLeft } from '@material-ui/icons';
import { useDefiEdgeRangeTitles } from 'hooks/v3/useDefiedgeStrategyData';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';

interface Props {
  searchValue: string;
  farmStatus: string;
  sortValue: string;
}

const AllMerklFarms: React.FC<Props> = ({
  searchValue,
  farmStatus,
  sortValue,
}) => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const { chainId, account } = useActiveWeb3React();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const history = useHistory();

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

  const [selectedSort, setSelectedSort] = useState(
    GlobalConst.utils.v3FarmSortBy.pool,
  );
  const [sortBy, setSortBy] = useState(GlobalConst.utils.v3FarmSortBy.pool);
  const [sortDesc, setSortDesc] = useState(false);
  const [isOld, setIsOld] = useState(true);
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

  const sortItems = [
    {
      label: t('pool'),
      value: GlobalConst.utils.v3FarmSortBy.pool,
    },
    {
      label: t('tvl'),
      value: GlobalConst.utils.v3FarmSortBy.tvl,
    },
    {
      label: t('apr'),
      value: GlobalConst.utils.v3FarmSortBy.apr,
    },
    {
      label: t('rewards'),
      value: GlobalConst.utils.v3FarmSortBy.rewards,
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

  useEffect(() => {
    setSortBy(sortValue);
  }, [sortValue]);

  const { loading, farms } = useMerklFarms();

  const rewardAddresses = farms.reduce((memo: string[], item: any) => {
    const distributionData: any[] = (item?.distributionData ?? []).filter(
      (reward: any) => reward.isLive && !reward.isMock,
    );
    for (const rewardItem of distributionData) {
      if (
        rewardItem.rewardToken &&
        !memo.includes(rewardItem.rewardToken.toLowerCase())
      ) {
        memo.push(rewardItem.rewardToken.toLowerCase());
      }
    }
    return memo;
  }, []);
  const { prices: rewardUSDPrices } = useUSDCPricesFromAddresses(
    rewardAddresses,
  );

  const v3Farms = farms
    .map((item: any) => {
      // const apr = item.meanAPR;
      const apr = Math.max(
        ...item.alm.map((item_farm) => item_farm.poolAPR + item_farm.almAPR),
      );
      const title = (item.symbolToken0 ?? '') + (item.symbolToken1 ?? '');
      // const rewardItems: any[] = (item?.distributionData ?? []).filter(
      //   (reward: any) => reward.isLive && !reward.isMock,
      // );
      // const dailyRewardUSD = rewardItems.reduce((total: number, item: any) => {
      //   const usdPrice =
      //     rewardUSDPrices?.find(
      //       (priceItem) =>
      //         item.rewardToken &&
      //         priceItem.address.toLowerCase() ===
      //           item.rewardToken.toLowerCase(),
      //     )?.price ?? 0;
      //   const rewardDuration =
      //     (item?.endTimestamp ?? 0) - (item?.startTimestamp ?? 0);
      //   return (
      //     total +
      //     (rewardDuration > 0
      //       ? ((usdPrice * (item?.amount ?? 0)) / rewardDuration) * 3600 * 24
      //       : 0)
      //   );
      // }, 0);
      return { ...item, apr, title };
    })
    .filter((farm) => {
      const searchCondition = (farm?.title ?? '')
        .toLowerCase()
        .includes(searchValue.toLowerCase());
      const farmToken0Id = farm?.token0 ?? '';
      const farmToken1Id = farm?.token1 ?? '';
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
        (farmFilter === GlobalConst.utils.v3FarmFilter.blueChip
          ? blueChipCondition
          : farmFilter === GlobalConst.utils.v3FarmFilter.stableCoin
          ? stableCoinCondition
          : farmFilter === GlobalConst.utils.v3FarmFilter.stableLP
          ? stableLPCondition
          : farmFilter === GlobalConst.utils.v3FarmFilter.otherLP
          ? !blueChipCondition && !stableCoinCondition && !stableLPCondition
          : true)
      );
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
      // if (sortBy === GlobalConst.utils.v3FarmSortBy.rewards) {
      //   return farm1.dailyRewardUSD > farm2.dailyRewardUSD
      //     ? sortMultiplier
      //     : -1 * sortMultiplier;
      // }
      return 1;
    });

  const parsedQuery = useParsedQueryString();
  const poolId =
    parsedQuery && parsedQuery.pool ? parsedQuery.pool.toString() : undefined;
  const selectedPool = v3Farms.find(
    (item) => poolId && item.pool.toLowerCase() === poolId.toLowerCase(),
  );
  const currency0 = useCurrency(selectedPool?.token0);
  const currency1 = useCurrency(selectedPool?.token1);

  const selectedDefiEdgeIds = getAllDefiedgeStrategies(chainId)
    .filter(
      (item) =>
        !!(selectedPool?.alm ?? []).find(
          (alm: any) => alm.almAddress.toLowerCase() === item.id.toLowerCase(),
        ),
    )
    .map((item) => item.id);
  const defiEdgeTitles = useDefiEdgeRangeTitles(selectedDefiEdgeIds);
  const selectedFarms: any[] = useMemo(() => {
    const almFarms: any[] = selectedPool?.alm ?? [];
    return almFarms.map((alm) => {
      let title = alm.title ?? '';
      if (alm.label.includes('Gamma')) {
        title =
          getAllGammaPairs(chainId).find(
            (item) =>
              item.address.toLowerCase() === alm.almAddress.toLowerCase(),
          )?.title ?? '';
      } else if (alm.label.includes('DefiEdge')) {
        title =
          defiEdgeTitles.find(
            (item) =>
              item.address.toLowerCase() === alm.almAddress.toLowerCase(),
          )?.title ?? '';
      }
      return {
        ...alm,
        token0: selectedPool?.token0,
        token1: selectedPool?.token1,
        title,
        poolFee:
          (selectedPool?.ammName ?? '').toLowerCase() === 'quickswapuni'
            ? selectedPool?.poolFee
            : undefined,
      };
    });
  }, [chainId, defiEdgeTitles, selectedPool]);

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
        return { text: item, id: ind + 1, link: item };
      }),
    );
  }, [selectedFarms, t]);

  const [farmType, setFarmType] = useState(farmTypes[0]);
  const [staked, setStaked] = useState(false);

  const filteredSelectedFarms = useMemo(() => {
    const farmsFilteredWithRewards = selectedFarms.filter((item) =>
      staked ? item.rewards.length > 0 : true,
    );
    if (farmType.link === 'all') {
      return farmsFilteredWithRewards;
    }
    return farmsFilteredWithRewards.filter(
      (item) => item.title && item.title === farmType.link,
    );
  }, [farmType.link, selectedFarms, staked]);

  return (
    <>
      {poolId && (
        <>
          <Box className='flex items-center justify-between' pt={2} mx={2}>
            <Box className='flex items-center'>
              <Box
                className='flex items-center cursor-pointer back-to-farm'
                gridGap={3}
                onClick={() => history.push('/farm')}
                mr={2}
              >
                <KeyboardArrowLeft />
                <small>{t('Back')}</small>
              </Box>
              <Box className='flex items-center' gridGap={8}>
                <DoubleCurrencyLogo
                  currency0={currency0 ?? undefined}
                  currency1={currency1 ?? undefined}
                  size={24}
                />
                <h5 className='weight-500'>
                  {currency0?.symbol}/{currency1?.symbol}
                </h5>
              </Box>
            </Box>
            {!isMobile && (
              <Box className='flex items-center' gridGap={16}>
                <Box
                  className='sortSelectBox'
                  width={isMobile ? '100%' : 'auto'}
                >
                  <label>Sort by: </label>
                  <Select value={selectedSort} className='sortSelect'>
                    {sortItems.map((item) => (
                      <MenuItem
                        key={item.value}
                        value={item.value}
                        onClick={() => {
                          setSelectedSort(item.value);
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
                <Box className='flex items-center' gridGap={6}>
                  <small className='text-secondary'>{t('oldFarms')}</small>
                  <ToggleSwitch
                    toggled={isOld}
                    onToggle={() => setIsOld(!isOld)}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}

      <Box pt={2}>
        {poolId ? (
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
            {isMobile && (
              <Box className='flex items-center' gridGap={16}>
                <Box className='flex items-center' gridGap={6}>
                  <small className='text-secondary'>{t('oldFarms')}</small>
                  <ToggleSwitch
                    toggled={isOld}
                    onToggle={() => setIsOld(!isOld)}
                  />
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <>
            <Box pl='12px' className='bg-secondary1' mb={isMobile ? '16px' : 0}>
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
            {poolId ? (
              filteredSelectedFarms.length > 0 ? (
                filteredSelectedFarms.map((farm, ind) => (
                  <Box key={ind} pb={2}>
                    <MerklPairFarmCard farm={farm} />
                  </Box>
                ))
              ) : (
                <Box
                  width='100%'
                  minHeight={200}
                  className='flex items-center justify-center'
                >
                  <p>{t('nofarms')}</p>
                </Box>
              )
            ) : v3Farms.length > 0 ? (
              v3Farms.map((farm, ind) => (
                <Box key={ind} pb={2}>
                  <MerklFarmCard farm={farm} />
                </Box>
              ))
            ) : (
              <Box
                width='100%'
                minHeight={200}
                className='flex items-center justify-center'
              >
                <p>{t('nofarms')}</p>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default AllMerklFarms;
