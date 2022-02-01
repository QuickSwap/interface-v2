import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { ArrowUp, ArrowDown } from 'react-feather';
import cx from 'classnames';
import {
  useStakingInfo,
  useOldStakingInfo,
  useDualStakingInfo,
  useLairInfo,
  StakingInfo,
  DualStakingInfo,
  getBulkPairData,
  CommonStakingInfo,
} from 'state/stake/hooks';
import {
  FarmLPCard,
  FarmDualCard,
  ToggleSwitch,
  CustomMenu,
  SearchInput,
} from 'components';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import {
  getAPYWithFee,
  getOneYearFee,
  returnDualStakingInfo,
  returnStakingInfo,
  returnFullWidthMobile,
} from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';
import FarmRewards from './FarmRewards';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  helpWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    border: `1px solid ${palette.secondary.light}`,
    borderRadius: 10,
    '& p': {
      color: palette.text.hint,
    },
    '& svg': {
      marginLeft: 8,
    },
  },
  dragonWrapper: {
    width: '100%',
    backgroundColor: palette.background.paper,
    borderRadius: 20,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
    [breakpoints.down('xs')]: {
      padding: '16px 12px',
    },
  },
  farmSwitch: {
    width: '50%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: `1px solid ${palette.secondary.dark}`,
    '& p': {
      color: palette.text.secondary,
    },
  },
  activeFarmSwitch: {
    background: palette.secondary.dark,
    '& p': {
      color: palette.text.primary,
    },
  },
}));

const LOADFARM_COUNT = 6;
const POOL_COLUMN = 1;
const TVL_COLUMN = 2;
const REWARDS_COLUMN = 3;
const APY_COLUMN = 4;
const EARNED_COLUMN = 5;

const FarmPage: React.FC = () => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const { chainId } = useActiveWeb3React();
  const lairInfo = useLairInfo();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const [stakingInfos, setStakingInfos] = useState<StakingInfo[] | undefined>(
    undefined,
  );
  const [stakingDualInfos, setStakingDualInfos] = useState<
    DualStakingInfo[] | undefined
  >(undefined);
  const [bulkPairs, setBulkPairs] = useState<any>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [farmIndex, setFarmIndex] = useState(
    GlobalConst.farmIndex.LPFARM_INDEX,
  );
  const [pageloading, setPageLoading] = useState(true); //this is used for not loading farms immediately when user is on farms page
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
    const dualStakingInfos = isEndedFarm ? [] : addedDualStakingInfos;
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
    setStakingInfos(undefined);
    setStakingDualInfos(undefined);
    setTimeout(() => setPageLoading(false), 500); //load farms 0.5s after loading page
  }, []);

  useEffect(() => {
    if (chainId) {
      const stakingPairLists =
        returnStakingInfo()[chainId]?.map((item) => item.pair) ?? [];
      const stakingOldPairLists =
        returnStakingInfo('old')[chainId]?.map((item) => item.pair) ?? [];
      const dualPairLists =
        returnDualStakingInfo()[chainId]?.map((item) => item.pair) ?? [];
      const pairLists = stakingPairLists
        .concat(stakingOldPairLists)
        .concat(dualPairLists);
      getBulkPairData(pairLists).then((data) => setBulkPairs(data));
    }
    return () => setBulkPairs(null);
  }, [chainId]);

  useEffect(() => {
    setPageIndex(0);
    if (farmIndex === GlobalConst.farmIndex.LPFARM_INDEX) {
      setStakingInfos(sortedLPStakingInfos.slice(0, LOADFARM_COUNT));
    } else {
      setStakingDualInfos(sortedStakingDualInfos.slice(0, LOADFARM_COUNT));
    }
    return () => {
      setStakingInfos(undefined);
      setStakingDualInfos(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingRewardAddress]);

  useEffect(() => {
    if (farmIndex === GlobalConst.farmIndex.LPFARM_INDEX) {
      const currentStakingInfos = stakingInfos || [];
      const stakingInfosToAdd = sortedLPStakingInfos.slice(
        currentStakingInfos.length,
        currentStakingInfos.length + LOADFARM_COUNT,
      );
      setStakingInfos(currentStakingInfos.concat(stakingInfosToAdd));
    } else if (farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX) {
      const currentDualStakingInfos = stakingDualInfos || [];
      const stakingDualInfosToAdd = sortedStakingDualInfos.slice(
        currentDualStakingInfos.length,
        currentDualStakingInfos.length + LOADFARM_COUNT,
      );
      setStakingDualInfos(
        currentDualStakingInfos.concat(stakingDualInfosToAdd),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  const stakingAPYs = useMemo(() => {
    const sortedStakingInfos =
      farmIndex === GlobalConst.farmIndex.LPFARM_INDEX
        ? stakingInfos
        : stakingDualInfos;
    if (bulkPairs && sortedStakingInfos && sortedStakingInfos.length > 0) {
      return sortedStakingInfos.map((info: any) => {
        const oneDayVolume = bulkPairs[info.pair]?.oneDayVolumeUSD;
        const reserveUSD = bulkPairs[info.pair]?.reserveUSD;
        if (oneDayVolume && reserveUSD) {
          const oneYearFeeAPY = getOneYearFee(oneDayVolume, reserveUSD);
          return oneYearFeeAPY;
        } else {
          return 0;
        }
      });
    } else {
      return [];
    }
  }, [bulkPairs, stakingInfos, stakingDualInfos, farmIndex]);

  const loadNext = () => {
    setPageIndex(pageIndex + 1);
  };

  const { loadMoreRef } = useInfiniteLoading(loadNext);

  const sortByMobileItems = [
    {
      text: 'Pool',
      onClick: () => setSortBy(POOL_COLUMN),
    },
    {
      text: 'TVL',
      onClick: () => setSortBy(TVL_COLUMN),
    },
    {
      text: 'Rewards',
      onClick: () => setSortBy(REWARDS_COLUMN),
    },
    {
      text: 'APY',
      onClick: () => setSortBy(APY_COLUMN),
    },
    {
      text: 'Earned',
      onClick: () => setSortBy(EARNED_COLUMN),
    },
  ];

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

  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box
        display='flex'
        alignItems='flex-start'
        justifyContent='space-between'
        width='100%'
      >
        <Box mr={2}>
          <Typography variant='h4'>Farm</Typography>
        </Box>
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>Help</Typography>
          <HelpIcon />
        </Box>
      </Box>
      <Box display='flex' width={300} height={48}>
        <Box
          className={cx(
            classes.farmSwitch,
            farmIndex === GlobalConst.farmIndex.LPFARM_INDEX &&
              classes.activeFarmSwitch,
          )}
          style={{ borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}
          onClick={() => {
            setFarmIndex(GlobalConst.farmIndex.LPFARM_INDEX);
          }}
        >
          <Typography variant='body1'>LP Mining</Typography>
        </Box>
        <Box
          className={cx(
            classes.farmSwitch,
            farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX &&
              classes.activeFarmSwitch,
          )}
          style={{ borderTopRightRadius: 8, borderBottomRightRadius: 8 }}
          onClick={() => {
            setFarmIndex(GlobalConst.farmIndex.DUALFARM_INDEX);
          }}
        >
          <Typography variant='body1'>Dual Mining</Typography>
        </Box>
      </Box>
      <Box my={2}>
        <FarmRewards bulkPairs={bulkPairs} farmIndex={farmIndex} />
      </Box>
      <Box className={classes.dragonWrapper}>
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
              <Box width={160} height={40} display='flex' mr={2}>
                <Box
                  className={cx(
                    classes.farmSwitch,
                    !isEndedFarm && classes.activeFarmSwitch,
                  )}
                  style={{ borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}
                  onClick={() => {
                    setIsEndedFarm(false);
                  }}
                >
                  <Typography variant='body2'>Active</Typography>
                </Box>
                <Box
                  className={cx(
                    classes.farmSwitch,
                    isEndedFarm && classes.activeFarmSwitch,
                  )}
                  style={{
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                  onClick={() => {
                    setIsEndedFarm(true);
                  }}
                >
                  <Typography variant='body2'>Ended</Typography>
                </Box>
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
            <Box
              display='flex'
              alignItems='center'
              width={0.3}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortBy === POOL_COLUMN) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(POOL_COLUMN);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === POOL_COLUMN
                  ? palette.text.primary
                  : palette.secondary.main
              }
            >
              <Typography variant='body2'>Pool</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === POOL_COLUMN && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
            <Box
              width={0.2}
              display='flex'
              flexDirection='row'
              alignItems='center'
              justifyContent='center'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortBy === TVL_COLUMN) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(TVL_COLUMN);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === TVL_COLUMN
                  ? palette.text.primary
                  : palette.secondary.main
              }
            >
              <Typography variant='body2'>TVL</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === TVL_COLUMN && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
            <Box
              width={0.25}
              display='flex'
              flexDirection='row'
              alignItems='center'
              justifyContent='center'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortBy === REWARDS_COLUMN) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(REWARDS_COLUMN);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === REWARDS_COLUMN
                  ? palette.text.primary
                  : palette.secondary.main
              }
            >
              <Typography variant='body2'>Rewards</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === REWARDS_COLUMN && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
            <Box
              width={0.15}
              display='flex'
              flexDirection='row'
              alignItems='center'
              justifyContent='center'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortBy === APY_COLUMN) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(APY_COLUMN);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === APY_COLUMN
                  ? palette.text.primary
                  : palette.secondary.main
              }
            >
              <Typography variant='body2'>APY</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === APY_COLUMN && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
            <Box
              width={0.2}
              display='flex'
              flexDirection='row'
              alignItems='center'
              justifyContent='flex-end'
              mr={2}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortBy === EARNED_COLUMN) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(EARNED_COLUMN);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === EARNED_COLUMN
                  ? palette.text.primary
                  : palette.secondary.main
              }
            >
              <Typography variant='body2'>Earned</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === EARNED_COLUMN && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
          </Box>
        )}
        {farmIndex === GlobalConst.farmIndex.LPFARM_INDEX && stakingInfos ? (
          stakingInfos.map((info: StakingInfo, index) => (
            <FarmLPCard
              key={index}
              dQuicktoQuick={Number(lairInfo.dQUICKtoQUICK.toSignificant())}
              stakingInfo={info}
              stakingAPY={stakingAPYs[index]}
            />
          ))
        ) : farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX &&
          stakingDualInfos ? (
          stakingDualInfos.map((info: DualStakingInfo, index) => (
            <FarmDualCard
              key={index}
              dQuicktoQuick={Number(lairInfo.dQUICKtoQUICK.toSignificant())}
              stakingInfo={info}
              stakingAPY={stakingAPYs[index]}
            />
          ))
        ) : (
          <Skeleton width='100%' height={80} />
        )}
      </Box>
      <div ref={loadMoreRef} />
    </Box>
  );
};

export default FarmPage;
