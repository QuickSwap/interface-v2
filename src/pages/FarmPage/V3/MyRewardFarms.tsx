import React, { useMemo, useState, useEffect } from 'react';
import { Box, useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { GlobalConst, GlobalData } from 'constants/index';
import { useMerklFarms } from 'hooks/v3/useV3Farms';
import Loader from 'components/Loader';
import CustomSelector from 'components/v3/CustomSelector';
import MerklPairFarmCard from './MerklPairFarmCard';
import { getAllDefiedgeStrategies, getAllGammaPairs } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useDefiEdgeRangeTitles } from 'hooks/v3/useDefiedgeStrategyData';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import {
  useDefiedgePositions,
  useICHIPositions,
  useUnipilotPositions,
  useV3Positions,
  useV3SteerPositions,
} from 'hooks/v3/useV3Positions';
import { useGammaPositions } from 'hooks/v3/useGammaData';

interface Props {
  searchValue: string;
  farmStatus: string;
  sortValue: string;
}

const MyRewardFarms: React.FC<Props> = ({
  searchValue,
  farmStatus,
  sortValue,
}) => {
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const { account, chainId } = useActiveWeb3React();

  const myPositionIds: any = [];
  const { positions } = useV3Positions(account, true);
  const { positions: defiedgePositions } = useDefiedgePositions(
    account,
    chainId,
  );
  const { unipilotPositions } = useUnipilotPositions(account, chainId);
  const { positions: ichiPositions } = useICHIPositions();
  const steerPositions = useV3SteerPositions();
  const gammaPositions = useGammaPositions();
  defiedgePositions.map((item) => myPositionIds.push(item?.id));
  unipilotPositions.map((item) => myPositionIds.push(item?.id));
  ichiPositions.map((item) => myPositionIds.push(item?.address));
  steerPositions.map((item) => myPositionIds.push(item?.address));
  if (gammaPositions.data) {
    const gammaIds = Object.keys(gammaPositions?.data).filter((item) =>
      item.includes('0x'),
    );
    gammaIds.map((item) => myPositionIds.push(item));
  }

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
      const apr = item.alm.reduce(
        (value: number, farm: any) =>
          Math.max(value, farm.almAPR + farm.poolAPR),
        0,
      );
      const title = (item.symbolToken0 ?? '') + (item.symbolToken1 ?? '');
      const rewardItems: any[] = (item?.distributionData ?? []).filter(
        (reward: any) => reward.isLive && !reward.isMock,
      );
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

  const selectedPool: any = v3Farms.filter((item) => {
    const selectedAml = item?.alm.filter((almItem: any) => {
      const myPositionId = (myPositionIds as string[]).find(
        (myPositionId) =>
          almItem.almAddress.toLowerCase() === myPositionId.toLowerCase(),
      );

      if (myPositionId) return true;
      else return false;
    });

    if (positions) {
      const qsPosition = positions.find(
        (position) =>
          position.token0.toLowerCase() === item.token0.toLowerCase() &&
          position.token1.toLowerCase() === item.token1.toLowerCase(),
      );

      return selectedAml.length > 0 || qsPosition;
    }
  });

  const selectedDefiEdgeIds = getAllDefiedgeStrategies(chainId)
    .filter((item) => {
      // Check if any pool in selectedPool contains the almAddress
      return (selectedPool ?? []).some((pool: any) =>
        (pool.alm ?? []).some(
          (alm: any) => alm.almAddress.toLowerCase() === item.id.toLowerCase(),
        ),
      );
    })
    .map((item) => item.id);
  const defiEdgeTitles = useDefiEdgeRangeTitles(selectedDefiEdgeIds);
  const selectedFarmsPre: any[] = useMemo(() => {
    return selectedPool.map((pool: any) => {
      const almFarms: any[] = pool?.alm ?? [];
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
          token0: pool?.token0,
          token1: pool?.token1,
          title,
          poolFee:
            (pool?.ammName ?? '').toLowerCase() === 'quickswapuni'
              ? pool?.poolFee
              : undefined,
        };
      });
    });
  }, [chainId, defiEdgeTitles, selectedPool]);
  const combinedArray = [].concat(...selectedFarmsPre);

  const selectedFarms = combinedArray.filter((item: any) => {
    const myPositionId = (myPositionIds as string[]).find(
      (myPositionId) =>
        item.almAddress.toLowerCase() === myPositionId.toLowerCase(),
    );

    const qsPosition = positions?.find(
      (position) =>
        position.token0.toLowerCase() === item.token0.toLowerCase() &&
        position.token1.toLowerCase() === item.token1.toLowerCase() &&
        item.label.includes('Quickswap'),
    );

    return qsPosition || myPositionId;
  });

  const farmTypes = useMemo(() => {
    const mTypes = selectedFarms.reduce((memo: string[], item: any) => {
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
      (item: any) => item.title && item.title === farmType.link,
    );
  }, [farmType.link, selectedFarms]);

  return (
    <>
      <Box pt={2}>
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
        </Box>

        {loading ? (
          <Box minHeight={200} className='flex justify-center items-center'>
            <Loader stroke={'white'} size={'1.5rem'} />
          </Box>
        ) : (
          <Box px={2}>
            {filteredSelectedFarms.length > 0 ? (
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
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default MyRewardFarms;
