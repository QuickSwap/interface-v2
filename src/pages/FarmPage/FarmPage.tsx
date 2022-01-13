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
  STAKING_REWARDS_INFO,
  OLD_STAKING_REWARDS_INFO,
  STAKING_DUAL_REWARDS_INFO,
  getBulkPairData,
  useUSDRewardsandFees,
} from 'state/stake/hooks';
import { FarmLPCard, FarmDualCard, ToggleSwitch } from 'components';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { useActiveWeb3React } from 'hooks';
import { getAPYWithFee, getOneYearFee } from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';

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
  dragonBg: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    background: 'rgb(225, 190, 231, 0.1)',
    maxHeight: 207,
    overflow: 'hidden',
    '& img': {
      width: '100%',
    },
  },
  searchInput: {
    height: 40,
    border: `1px solid ${palette.secondary.dark}`,
    borderRadius: 10,
    minWidth: 300,
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    '& input': {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      marginLeft: 8,
      fontSize: 14,
      fontWeight: 500,
      color: palette.text.primary,
      flex: 1,
    },
    [breakpoints.down('xs')]: {
      width: '100%',
      minWidth: 'unset',
      marginRight: 0,
    },
  },
  thirdColor: {
    color: palette.primary.main,
    cursor: 'pointer',
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
  const [farmIndex, setFarmIndex] = useState(0);
  const [isEndedFarm, setIsEndedFarm] = useState(false);
  const [sortBy, setSortBy] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);
  const [stakedOnly, setStakeOnly] = useState(false);
  const [farmSearch, setFarmSearch] = useState('');
  const [farmSearchInput, setFarmSearchInput] = useDebouncedChangeHandler(
    farmSearch,
    setFarmSearch,
  );
  const farmData = useUSDRewardsandFees(farmIndex === 0, bulkPairs);
  const dQuickRewardSum = useMemo(() => {
    if (chainId) {
      const stakingData = STAKING_REWARDS_INFO[chainId] ?? [];
      const rewardSum = stakingData.reduce(
        (total, item) => total + item.rate,
        0,
      );
      return rewardSum;
    } else {
      return 0;
    }
  }, [chainId]);

  const addedLPStakingInfos = useStakingInfo(
    null,
    farmIndex === 1 || isEndedFarm ? 0 : undefined,
    farmIndex === 1 || isEndedFarm ? 0 : undefined,
    { search: farmSearch, isStaked: stakedOnly },
  );
  const addedLPStakingOldInfos = useOldStakingInfo(
    null,
    farmIndex === 1 || !isEndedFarm ? 0 : undefined,
    farmIndex === 1 || !isEndedFarm ? 0 : undefined,
    { search: farmSearch, isStaked: stakedOnly },
  );
  const addedDualStakingInfos = useDualStakingInfo(
    null,
    farmIndex === 0 ? 0 : undefined,
    farmIndex === 0 ? 0 : undefined,
    { search: farmSearch, isStaked: stakedOnly },
  );

  const addedStakingInfos =
    farmIndex === 1
      ? addedDualStakingInfos
      : isEndedFarm
      ? addedLPStakingOldInfos
      : addedLPStakingInfos;

  const stakingRewardAddress = addedStakingInfos
    ? addedStakingInfos
        .map((stakingInfo) => stakingInfo.stakingRewardAddress.toLowerCase())
        .reduce((totStr, str) => totStr + str, '')
    : null;

  useEffect(() => {
    if (chainId) {
      const stakingPairLists =
        STAKING_REWARDS_INFO[chainId]?.map((item) => item.pair) ?? [];
      const stakingOldPairLists =
        OLD_STAKING_REWARDS_INFO[chainId]?.map((item) => item.pair) ?? [];
      const dualPairLists =
        STAKING_DUAL_REWARDS_INFO[chainId]?.map((item) => item.pair) ?? [];
      const pairLists = stakingPairLists
        .concat(stakingOldPairLists)
        .concat(dualPairLists);
      getBulkPairData(pairLists).then((data) => setBulkPairs(data));
    }
    return () => setBulkPairs(null);
  }, [chainId]);

  useEffect(() => {
    setStakingInfos(undefined);
    setStakingDualInfos(undefined);
    setTimeout(() => {
      setStakingInfos(
        isEndedFarm ? addedLPStakingOldInfos : addedLPStakingInfos,
      );
      setStakingDualInfos(isEndedFarm ? [] : addedDualStakingInfos);
    }, 500);
    return () => {
      setStakingInfos(undefined);
      setStakingDualInfos(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEndedFarm, farmIndex, farmSearch, stakingRewardAddress]);

  const sortIndex = sortDesc ? 1 : -1;

  const sortByToken = useCallback(
    (a: StakingInfo | DualStakingInfo, b: StakingInfo | DualStakingInfo) => {
      const tokenStrA = a.tokens[0].symbol + '/' + a.tokens[1].symbol;
      const tokenStrB = b.tokens[0].symbol + '/' + b.tokens[1].symbol;
      return (tokenStrA > tokenStrB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByTVL = useCallback(
    (a: StakingInfo | DualStakingInfo, b: StakingInfo | DualStakingInfo) => {
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
    (a: StakingInfo | DualStakingInfo, b: StakingInfo | DualStakingInfo) => {
      let aYearFee = 0;
      let bYearFee = 0;
      if (bulkPairs) {
        const aDayVolume = bulkPairs[a.pair].oneDayVolumeUSD;
        const aReserveUSD = bulkPairs[a.pair].reserveUSD;
        const bDayVolume = bulkPairs[b.pair].oneDayVolumeUSD;
        const bReserveUSD = bulkPairs[b.pair].reserveUSD;
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

  const sortedStakingLPInfos = useMemo(() => {
    if (stakingInfos && stakingInfos.length > 0) {
      return stakingInfos.sort((a, b) => {
        if (sortBy === 1) {
          return sortByToken(a, b);
        } else if (sortBy === 2) {
          return sortByTVL(a, b);
        } else if (sortBy === 3) {
          return sortByRewardLP(a, b);
        } else if (sortBy === 4) {
          return sortByAPY(a, b);
        } else if (sortBy === 5) {
          return sortByEarnedLP(a, b);
        }
        return 1;
      });
    }
    return [];
  }, [
    sortBy,
    stakingInfos,
    sortByToken,
    sortByTVL,
    sortByRewardLP,
    sortByAPY,
    sortByEarnedLP,
  ]);

  const sortedStakingDualInfos = useMemo(() => {
    if (stakingDualInfos && stakingDualInfos.length > 0) {
      return stakingDualInfos.sort((a, b) => {
        if (sortBy === 1) {
          return sortByToken(a, b);
        } else if (sortBy === 2) {
          return sortByTVL(a, b);
        } else if (sortBy === 3) {
          return sortByRewardDual(a, b);
        } else if (sortBy === 4) {
          return sortByAPY(a, b);
        } else if (sortBy === 5) {
          return sortByEarnedDual(a, b);
        }
        return 1;
      });
    }
    return [];
  }, [
    stakingDualInfos,
    sortBy,
    sortByToken,
    sortByTVL,
    sortByRewardDual,
    sortByAPY,
    sortByEarnedDual,
  ]);

  const stakingAPYs = useMemo(() => {
    const sortedStakingInfos =
      farmIndex === 0 ? sortedStakingLPInfos : sortedStakingDualInfos;
    if (bulkPairs && sortedStakingInfos.length > 0) {
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
  }, [bulkPairs, sortedStakingLPInfos, sortedStakingDualInfos, farmIndex]);

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
            farmIndex === 0 && classes.activeFarmSwitch,
          )}
          style={{ borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}
          onClick={() => {
            setFarmIndex(0);
          }}
        >
          <Typography variant='body1'>LP Mining</Typography>
        </Box>
        <Box
          className={cx(
            classes.farmSwitch,
            farmIndex === 1 && classes.activeFarmSwitch,
          )}
          style={{ borderTopRightRadius: 8, borderBottomRightRadius: 8 }}
          onClick={() => {
            setFarmIndex(1);
          }}
        >
          <Typography variant='body1'>Dual Mining</Typography>
        </Box>
      </Box>
      <Box
        display='flex'
        flexWrap='wrap'
        my={2}
        borderRadius={10}
        py={1.5}
        bgcolor={palette.secondary.dark}
      >
        {farmIndex === 0 && (
          <Box
            width={isMobile ? 1 : 1 / 3}
            py={1.5}
            borderRight={`1px solid ${palette.divider}`}
            textAlign='center'
          >
            <Box mb={1}>
              <Typography variant='caption' color='textSecondary'>
                Reward Rate
              </Typography>
            </Box>
            <Typography variant='subtitle2' style={{ fontWeight: 600 }}>
              {dQuickRewardSum.toLocaleString()} dQuick / Day
            </Typography>
          </Box>
        )}
        <Box
          width={isMobile ? 1 : farmIndex === 0 ? 1 / 3 : 1 / 2}
          p={1.5}
          borderRight={isMobile ? 'none' : `1px solid ${palette.divider}`}
          textAlign='center'
        >
          <Box mb={1}>
            <Typography variant='caption' color='textSecondary'>
              Total Rewards
            </Typography>
          </Box>
          {farmData.rewardsUSD ? (
            <Typography variant='subtitle2' style={{ fontWeight: 600 }}>
              ${farmData.rewardsUSD.toLocaleString()} / Day
            </Typography>
          ) : (
            <Skeleton width='100%' height='28px' />
          )}
        </Box>
        <Box
          width={isMobile ? 1 : farmIndex === 0 ? 1 / 3 : 1 / 2}
          p={1.5}
          textAlign='center'
        >
          <Box mb={1}>
            <Typography variant='caption' color='textSecondary'>
              Fees [24h]
            </Typography>
          </Box>
          {farmData.stakingFees ? (
            <Typography variant='subtitle2' style={{ fontWeight: 600 }}>
              ${farmData.stakingFees.toLocaleString()}
            </Typography>
          ) : (
            <Skeleton width='100%' height='28px' />
          )}
        </Box>
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
              {farmIndex === 0
                ? 'dQUICK + Pool Fees'
                : 'dQUICK + WMATIC rewards'}
            </Typography>
          </Box>
          <Box display='flex' flexWrap='wrap'>
            <Box className={classes.searchInput} mr={2} my={2}>
              <SearchIcon />
              <input
                placeholder='Search name, symbol or paste address'
                value={farmSearchInput}
                onChange={(evt: any) => setFarmSearchInput(evt.target.value)}
              />
            </Box>
            <Box display='flex' flexWrap='wrap' alignItems='center'>
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
                if (sortBy === 1) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(1);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === 1 ? palette.text.primary : palette.secondary.main
              }
            >
              <Typography variant='body2'>Pool</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === 1 && sortDesc ? (
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
                if (sortBy === 2) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(2);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === 2 ? palette.text.primary : palette.secondary.main
              }
            >
              <Typography variant='body2'>TVL</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === 2 && sortDesc ? (
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
                if (sortBy === 3) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(3);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === 3 ? palette.text.primary : palette.secondary.main
              }
            >
              <Typography variant='body2'>Rewards</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === 3 && sortDesc ? (
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
                if (sortBy === 4) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(4);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === 4 ? palette.text.primary : palette.secondary.main
              }
            >
              <Typography variant='body2'>APY</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === 4 && sortDesc ? (
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
                if (sortBy === 5) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(5);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === 5 ? palette.text.primary : palette.secondary.main
              }
            >
              <Typography variant='body2'>Earned</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === 5 && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
          </Box>
        )}
        {//show loading until loading total fees
        farmData.stakingFees ? (
          farmIndex === 0 && stakingInfos ? (
            sortedStakingLPInfos.map((info: StakingInfo, index) => (
              <FarmLPCard
                key={index}
                dQuicktoQuick={Number(lairInfo.dQUICKtoQUICK.toSignificant())}
                stakingInfo={info}
                stakingAPY={stakingAPYs[index]}
              />
            ))
          ) : farmIndex === 1 && stakingDualInfos ? (
            sortedStakingDualInfos.map((info: DualStakingInfo, index) => (
              <FarmDualCard
                key={index}
                dQuicktoQuick={Number(lairInfo.dQUICKtoQUICK.toSignificant())}
                stakingInfo={info}
                stakingAPY={stakingAPYs[index]}
              />
            ))
          ) : (
            <Skeleton width='100%' height={80} />
          )
        ) : (
          <Skeleton width='100%' height={80} />
        )}
      </Box>
    </Box>
  );
};

export default FarmPage;
