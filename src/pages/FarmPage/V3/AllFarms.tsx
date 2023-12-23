import React, { useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import 'pages/styles/convertQUICK.scss';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { DefiedgeStrategies, GlobalConst } from 'constants/index';
import { DoubleCurrencyLogo, SortColumns, ToggleSwitch } from 'components';
import { useMerklFarms } from 'hooks/v3/useV3Farms';
import Loader from 'components/Loader';
import V3FarmCard from './FarmCard';
import useParsedQueryString from 'hooks/useParsedQueryString';
import CustomSelector from 'components/v3/CustomSelector';
import V3PairFarmCard from './PairFarmCard';
import { getAllDefiedgeStrategies, getAllGammaPairs } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useHistory } from 'react-router-dom';
import { useCurrency } from 'hooks/v3/Tokens';
import { Home, KeyboardArrowRight } from '@material-ui/icons';
import { useDefiEdgeRangeTitles } from 'hooks/v3/useDefiedgeStrategyData';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';

interface Props {
  searchValue: string;
  farmStatus: string;
}

const AllV3Farms: React.FC<Props> = ({ searchValue, farmStatus }) => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const { chainId } = useActiveWeb3React();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
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

  const { loading, farms } = useMerklFarms();
  const rewardAddresses = farms.reduce((memo: string[], item: any) => {
    const distributionData: any[] = (item?.distributionData ?? []).filter(
      (reward: any) => reward.isLive,
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
      const apr = item.alm.reduce(
        (value: number, farm: any) =>
          Math.max(value, farm.almAPR + farm.poolAPR),
        0,
      );
      const title = (item.symbolToken0 ?? '') + (item.symbolToken0 ?? '');
      const rewardItems: any[] = (item?.distributionData ?? []).filter(
        (reward: any) => reward.isLive,
      );
      const totalTVL = item.alm.reduce(
        (total: number, alm: any) => total + alm.almTVL,
        0,
      );
      const dailyRewardUSD = rewardItems.reduce((total: number, item: any) => {
        const usdPrice =
          rewardUSDPrices?.find(
            (priceItem) =>
              item.rewardToken &&
              priceItem.address.toLowerCase() ===
                item.rewardToken.toLowerCase(),
          )?.price ?? 0;
        const rewardDuration =
          (item?.endTimestamp ?? 0) - (item?.startTimestamp ?? 0);
        return (
          total +
          (rewardDuration > 0
            ? ((usdPrice * (item?.amount ?? 0)) / rewardDuration) * 3600 * 24
            : 0)
        );
      }, 0);
      return { ...item, apr, title, totalTVL, dailyRewardUSD };
    })
    .sort((farm1, farm2) => {
      if (sortBy === GlobalConst.utils.v3FarmSortBy.pool) {
        return farm1.title > farm2.title ? sortMultiplier : -1 * sortMultiplier;
      }
      if (sortBy === GlobalConst.utils.v3FarmSortBy.tvl) {
        return farm1.totalTVL > farm2.totalTVL
          ? sortMultiplier
          : -1 * sortMultiplier;
      }
      if (sortBy === GlobalConst.utils.v3FarmSortBy.apr) {
        return farm1.apr > farm2.apr ? sortMultiplier : -1 * sortMultiplier;
      }
      if (sortBy === GlobalConst.utils.v3FarmSortBy.rewards) {
        return farm1.dailyRewardUSD > farm2.dailyRewardUSD
          ? sortMultiplier
          : -1 * sortMultiplier;
      }
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
      let title = '';
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
      const farmType = alm.label.split(' ')[0];
      const poolRewards = selectedPool?.rewardsPerToken;
      const rewardTokenAddresses = poolRewards ? Object.keys(poolRewards) : [];
      const rewardData: any[] = poolRewards ? Object.values(poolRewards) : [];
      const rewards = rewardData
        .map((item, ind) => {
          return { ...item, address: rewardTokenAddresses[ind] };
        })
        .filter((item) => {
          const accumulatedRewards = item.breakdownOfAccumulated;
          return (
            accumulatedRewards &&
            Object.keys(accumulatedRewards).includes(farmType)
          );
        });
      return {
        ...alm,
        token0: selectedPool?.token0,
        token1: selectedPool?.token1,
        title,
        rewards,
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
    if (farmType.link === 'all') {
      return selectedFarms;
    }
    return selectedFarms.filter(
      (item) => item.title && item.title === farmType.link,
    );
  }, [farmType.link, selectedFarms]);

  return (
    <>
      {poolId && (
        <>
          <Box className='flex items-center'>
            <Box
              className='flex items-center cursor-pointer text-secondary'
              gridGap={5}
              onClick={() => history.push('/farm')}
            >
              <Home />
              <small>{t('allFarms')}</small>
            </Box>
            <KeyboardArrowRight className='text-secondary' />
            <small className='text-bold'>
              {currency0?.symbol}/{currency1?.symbol}
            </small>
          </Box>
          <Box className='flex items-center' gridGap={8} my={3}>
            <DoubleCurrencyLogo
              currency0={currency0 ?? undefined}
              currency1={currency1 ?? undefined}
              size={24}
            />
            <h4 className='weight-500'>
              {currency0?.symbol}/{currency1?.symbol}
            </h4>
          </Box>
        </>
      )}

      <Box className={poolId ? 'bg-palette' : ''} borderRadius={10} pt={2}>
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
            {poolId
              ? filteredSelectedFarms.map((farm, ind) => (
                  <Box key={ind} pb={2}>
                    <V3PairFarmCard farm={farm} />
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
    </>
  );
};

export default AllV3Farms;
