import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { ArrowUp, ArrowDown } from 'react-feather';
import {
  useStakingInfo,
  useOldStakingInfo,
  useDualStakingInfo,
  useLairInfo,
  StakingInfo,
  DualStakingInfo,
  CommonStakingInfo,
} from 'state/stake/hooks';
import {
  FarmLPCard,
  FarmDualCard,
  ToggleSwitch,
  CustomMenu,
  SearchInput,
  CustomSwitch,
} from 'components';
import { GlobalConst } from 'constants/index';
import { getAPYWithFee, getOneYearFee, returnFullWidthMobile } from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';

const LOADFARM_COUNT = 10;
const POOL_COLUMN = 1;
const TVL_COLUMN = 2;
const REWARDS_COLUMN = 3;
const APY_COLUMN = 4;
const EARNED_COLUMN = 5;

interface FarmsListProps {
  bulkPairs: any;
  farmIndex: number;
}

const FarmsList: React.FC<FarmsListProps> = ({ bulkPairs, farmIndex }) => {
  const { palette, breakpoints } = useTheme();
  const lairInfo = useLairInfo();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const [pageIndex, setPageIndex] = useState(0);
  const [pageloading, setPageLoading] = useState(false); //this is used for not loading farms immediately when user is on farms page
  const [isEndedFarm, setIsEndedFarm] = useState(false);
  const [sortBy, setSortBy] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);
  const [stakedOnly, setStakeOnly] = useState(false);
  const [farmSearch, setFarmSearch] = useState('');
  const [farmSearchInput, setFarmSearchInput] = useDebouncedChangeHandler(
    farmSearch,
    setFarmSearch,
  );

  const addedLPStakingInfos = useStakingInfo(
    null,
    pageloading ||
      farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX ||
      isEndedFarm
      ? 0
      : undefined,
    pageloading ||
      farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX ||
      isEndedFarm
      ? 0
      : undefined,
    { search: farmSearch, isStaked: stakedOnly },
  );
  const addedLPStakingOldInfos = useOldStakingInfo(
    null,
    pageloading ||
      farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX ||
      !isEndedFarm
      ? 0
      : undefined,
    pageloading ||
      farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX ||
      !isEndedFarm
      ? 0
      : undefined,
    { search: farmSearch, isStaked: stakedOnly },
  );
  const addedDualStakingInfos = useDualStakingInfo(
    null,
    pageloading || farmIndex === GlobalConst.farmIndex.LPFARM_INDEX
      ? 0
      : undefined,
    pageloading || farmIndex === GlobalConst.farmIndex.LPFARM_INDEX
      ? 0
      : undefined,
    { search: farmSearch, isStaked: stakedOnly },
  );

  const sortIndex = sortDesc ? 1 : -1;

  const sortByToken = useCallback(
    (a: CommonStakingInfo, b: CommonStakingInfo) => {
      const tokenStrA = a.tokens[0].symbol + '/' + a.tokens[1].symbol;
      const tokenStrB = b.tokens[0].symbol + '/' + b.tokens[1].symbol;
      return (tokenStrA > tokenStrB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByTVL = useCallback(
    (a: CommonStakingInfo, b: CommonStakingInfo) => {
      return (Number(a.tvl ?? 0) > Number(b.tvl ?? 0) ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByRewardLP = useCallback(
    (a: StakingInfo, b: StakingInfo) => {
      return (
        (Number(a.totalRewardRate.toSignificant()) >
        Number(b.totalRewardRate.toSignificant())
          ? -1
          : 1) * sortIndex
      );
    },
    [sortIndex],
  );

  const sortByRewardDual = useCallback(
    (a: DualStakingInfo, b: DualStakingInfo) => {
      const aRewards =
        a.rateA * a.quickPrice + a.rateB * Number(a.rewardTokenBPrice);
      const bRewards =
        b.rateA * b.quickPrice + b.rateB * Number(b.rewardTokenBPrice);
      return (aRewards > bRewards ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByAPY = useCallback(
    (a: CommonStakingInfo, b: CommonStakingInfo) => {
      let aYearFee = 0;
      let bYearFee = 0;
      if (bulkPairs) {
        const aDayVolume = bulkPairs[a.pair]?.oneDayVolumeUSD;
        const aReserveUSD = bulkPairs[a.pair]?.reserveUSD;
        const bDayVolume = bulkPairs[b.pair]?.oneDayVolumeUSD;
        const bReserveUSD = bulkPairs[b.pair]?.reserveUSD;
        if (aDayVolume && aReserveUSD) {
          aYearFee = getOneYearFee(aDayVolume, aReserveUSD);
        }
        if (bDayVolume && bReserveUSD) {
          bYearFee = getOneYearFee(bDayVolume, bReserveUSD);
        }
      }
      const aAPYwithFee = getAPYWithFee(
        a.perMonthReturnInRewards ?? 0,
        aYearFee,
      );
      const bAPYwithFee = getAPYWithFee(
        b.perMonthReturnInRewards ?? 0,
        bYearFee,
      );
      return (aAPYwithFee > bAPYwithFee ? -1 : 1) * sortIndex;
    },
    [sortIndex, bulkPairs],
  );

  const sortByEarnedLP = useCallback(
    (a: StakingInfo, b: StakingInfo) => {
      return (
        (Number(a.earnedAmount.toSignificant()) >
        Number(b.earnedAmount.toSignificant())
          ? -1
          : 1) * sortIndex
      );
    },
    [sortIndex],
  );

  const sortByEarnedDual = useCallback(
    (a: DualStakingInfo, b: DualStakingInfo) => {
      const earnedA =
        Number(a.earnedAmountA.toSignificant()) * a.quickPrice +
        Number(a.earnedAmountB.toSignificant()) * Number(a.rewardTokenBPrice);
      const earnedB =
        Number(b.earnedAmountA.toSignificant()) * b.quickPrice +
        Number(b.earnedAmountB.toSignificant()) * Number(b.rewardTokenBPrice);
      return (earnedA > earnedB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortedLPStakingInfos = useMemo(() => {
    const lpStakingInfos = isEndedFarm
      ? addedLPStakingOldInfos
      : addedLPStakingInfos;
    return lpStakingInfos.sort((a, b) => {
      if (sortBy === POOL_COLUMN) {
        return sortByToken(a, b);
      } else if (sortBy === TVL_COLUMN) {
        return sortByTVL(a, b);
      } else if (sortBy === REWARDS_COLUMN) {
        return sortByRewardLP(a, b);
      } else if (sortBy === APY_COLUMN) {
        return sortByAPY(a, b);
      } else if (sortBy === EARNED_COLUMN) {
        return sortByEarnedLP(a, b);
      }
      return 1;
    });
  }, [
    sortBy,
    addedLPStakingOldInfos,
    addedLPStakingInfos,
    isEndedFarm,
    sortByToken,
    sortByTVL,
    sortByRewardLP,
    sortByAPY,
    sortByEarnedLP,
  ]);

  const sortedStakingDualInfos = useMemo(() => {
    const dualStakingInfos = addedDualStakingInfos.filter(
      (info) => info.ended === isEndedFarm,
    );
    return dualStakingInfos.sort((a, b) => {
      if (sortBy === POOL_COLUMN) {
        return sortByToken(a, b);
      } else if (sortBy === TVL_COLUMN) {
        return sortByTVL(a, b);
      } else if (sortBy === REWARDS_COLUMN) {
        return sortByRewardDual(a, b);
      } else if (sortBy === APY_COLUMN) {
        return sortByAPY(a, b);
      } else if (sortBy === EARNED_COLUMN) {
        return sortByEarnedDual(a, b);
      }
      return 1;
    });
  }, [
    addedDualStakingInfos,
    isEndedFarm,
    sortBy,
    sortByToken,
    sortByTVL,
    sortByRewardDual,
    sortByAPY,
    sortByEarnedDual,
  ]);

  const addedStakingInfos = useMemo(
    () =>
      farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX
        ? sortedStakingDualInfos
        : sortedLPStakingInfos,
    [farmIndex, sortedStakingDualInfos, sortedLPStakingInfos],
  );

  const stakingRewardAddress = addedStakingInfos
    ? addedStakingInfos
        .map((stakingInfo) => stakingInfo.stakingRewardAddress.toLowerCase())
        .reduce((totStr, str) => totStr + str, '')
    : null;

  useEffect(() => {
    setPageIndex(0);
  }, [stakingRewardAddress]);

  const stakingInfos = useMemo(() => {
    return sortedLPStakingInfos
      ? sortedLPStakingInfos.slice(
          0,
          pageIndex === 0 ? LOADFARM_COUNT : LOADFARM_COUNT * pageIndex,
        )
      : null;
  }, [sortedLPStakingInfos, pageIndex]);

  const stakingDualInfos = useMemo(() => {
    return sortedStakingDualInfos
      ? sortedStakingDualInfos.slice(
          0,
          pageIndex === 0 ? LOADFARM_COUNT : LOADFARM_COUNT * pageIndex,
        )
      : null;
  }, [sortedStakingDualInfos, pageIndex]);

  const getPoolApy = (pairId: string) => {
    if (!pairId || !bulkPairs) {
      return 0;
    }

    const oneDayVolume = bulkPairs?.[pairId]?.oneDayVolumeUSD;
    const reserveUSD = bulkPairs?.[pairId]?.reserveUSD;
    if (oneDayVolume && reserveUSD) {
      const oneYearFeeAPY = getOneYearFee(oneDayVolume, reserveUSD);
      return oneYearFeeAPY;
    } else {
      return 0;
    }
  };

  const loadNext = () => {
    setPageIndex(pageIndex + 1);
  };

  const { loadMoreRef } = useInfiniteLoading(loadNext);

  const sortColumns = [
    { text: 'Pool', index: POOL_COLUMN, width: 0.3, justify: 'flex-start' },
    { text: 'TVL', index: TVL_COLUMN, width: 0.2, justify: 'center' },
    { text: 'Rewards', index: REWARDS_COLUMN, width: 0.25, justify: 'center' },
    { text: 'APY', index: APY_COLUMN, width: 0.15, justify: 'center' },
    { text: 'Earned', index: EARNED_COLUMN, width: 0.2, justify: 'flex-end' },
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

  const sortByMobileItems = sortColumns.map((item) => {
    return { text: item.text, onClick: () => setSortBy(item.index) };
  });

  const renderStakedOnly = () => (
    <Box display='flex' alignItems='center'>
      <Typography
        variant='body2'
        style={{ color: palette.text.disabled, marginRight: 8 }}
      >
        Staked Only
      </Typography>
      <ToggleSwitch
        toggled={stakedOnly}
        onToggle={() => setStakeOnly(!stakedOnly)}
      />
    </Box>
  );

  const farmStatusItems = [
    {
      text: 'Active',
      onClick: () => setIsEndedFarm(false),
      condition: !isEndedFarm,
    },
    {
      text: 'Ended',
      onClick: () => setIsEndedFarm(true),
      condition: isEndedFarm,
    },
  ];

  return (
    <>
      <Box
        display='flex'
        flexWrap='wrap'
        justifyContent='space-between'
        alignItems='center'
        mb={3.5}
      >
        <Box>
          <Typography variant='h5'>Earn dQuick</Typography>
          <Typography variant='body2'>
            Stake LP Tokens to earn{' '}
            {farmIndex === GlobalConst.farmIndex.LPFARM_INDEX
              ? 'dQUICK + Pool Fees'
              : 'dQUICK + WMATIC rewards'}
          </Typography>
        </Box>
        <Box display='flex' flexWrap='wrap'>
          <Box
            display='flex'
            justifyContent='space-between'
            width={returnFullWidthMobile(isMobile)}
          >
            <Box width={isMobile ? 'calc(100% - 150px)' : 1} mr={2} my={2}>
              <SearchInput
                placeholder={
                  isMobile ? 'Search' : 'Search name, symbol or paste address'
                }
                value={farmSearchInput}
                setValue={setFarmSearchInput}
              />
            </Box>
            {isMobile && renderStakedOnly()}
          </Box>
          <Box
            width={returnFullWidthMobile(isMobile)}
            display='flex'
            flexWrap='wrap'
            alignItems='center'
          >
            <Box mr={2}>
              <CustomSwitch width={160} height={40} items={farmStatusItems} />
            </Box>
            {isMobile ? (
              <>
                <Box height={40} flex={1}>
                  <CustomMenu title='Sort By' menuItems={sortByMobileItems} />
                </Box>
                <Box mt={2} width={1} display='flex' alignItems='center'>
                  <Typography
                    variant='body2'
                    style={{ color: palette.text.disabled, marginRight: 8 }}
                  >
                    Sort {sortDesc ? 'Desc' : 'Asc'}
                  </Typography>
                  <ToggleSwitch
                    toggled={sortDesc}
                    onToggle={() => setSortDesc(!sortDesc)}
                  />
                </Box>
              </>
            ) : (
              renderStakedOnly()
            )}
          </Box>
        </Box>
      </Box>
      <Divider />
      {!isMobile && (
        <Box mt={2.5} display='flex' paddingX={2}>
          {sortByDesktopItems.map((item) => (
            <Box
              key={item.index}
              display='flex'
              alignItems='center'
              width={item.width}
              style={{ cursor: 'pointer' }}
              justifyContent={item.justify}
              onClick={item.onClick}
              color={
                sortBy === item.index
                  ? palette.text.primary
                  : palette.secondary.main
              }
            >
              <Typography variant='body2'>{item.text}</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === item.index && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {farmIndex === GlobalConst.farmIndex.LPFARM_INDEX && stakingInfos
        ? stakingInfos.map((info: StakingInfo, index) => (
            <FarmLPCard
              key={index}
              dQuicktoQuick={Number(lairInfo.dQUICKtoQUICK.toSignificant())}
              stakingInfo={info}
              stakingAPY={getPoolApy(info?.pair)}
            />
          ))
        : farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX && stakingDualInfos
        ? stakingDualInfos.map((info: DualStakingInfo, index) => (
            <FarmDualCard
              key={index}
              dQuicktoQuick={Number(lairInfo.dQUICKtoQUICK.toSignificant())}
              stakingInfo={info}
              stakingAPY={getPoolApy(info?.pair)}
            />
          ))
        : (!stakingInfos || !stakingDualInfos) && (
            <>
              <Skeleton width='100%' height={100} />
              <Skeleton width='100%' height={100} />
              <Skeleton width='100%' height={100} />
              <Skeleton width='100%' height={100} />
              <Skeleton width='100%' height={100} />
            </>
          )}
      <div ref={loadMoreRef} />
    </>
  );
};

export default FarmsList;
