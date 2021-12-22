import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
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
} from 'state/stake/hooks';
import { FarmLPCard, FarmDualCard, ToggleSwitch } from 'components';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';
import { useActiveWeb3React } from 'hooks';

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
  const [pageLPIndex, setPageLPIndex] = useState(0);
  const [pageLPOldIndex, setPageLPOldIndex] = useState(0);
  const [pageDualIndex, setPageDualIndex] = useState(0);
  const [stakingLPInfos, setStakingLPInfos] = useState<StakingInfo[]>([]);
  const [stakingLPOldInfos, setStakingLPOldInfos] = useState<StakingInfo[]>([]);
  const [stakingDualInfos, setStakingDualInfos] = useState<DualStakingInfo[]>(
    [],
  );
  const [bulkPairs, setBulkPairs] = useState<any>(null);
  const [farmIndex, setFarmIndex] = useState(0);
  const [isEndedFarm, setIsEndedFarm] = useState(false);
  const [sortBy, setSortBy] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);

  const addedLPStakingInfos = useStakingInfo(
    null,
    farmIndex === 0 && !isEndedFarm ? pageLPIndex * 6 - 6 : 0,
    farmIndex === 0 && !isEndedFarm ? pageLPIndex * 6 : 0,
  );

  const addedLPStakingOldInfos = useOldStakingInfo(
    null,
    farmIndex === 0 && isEndedFarm ? pageLPOldIndex * 6 - 6 : 0,
    farmIndex === 0 && isEndedFarm ? pageLPOldIndex * 6 : 0,
  );

  const addedDualStakingInfos = useDualStakingInfo(
    null,
    farmIndex === 1 ? pageDualIndex * 6 - 6 : 0,
    farmIndex === 1 ? pageDualIndex * 6 : 0,
  );

  const stakingLPRewardAddress = addedLPStakingInfos
    .map((stakingInfo) => stakingInfo.stakingRewardAddress.toLowerCase())
    .reduce((totStr, str) => totStr + str, '');

  const stakingLPOldRewardAddress = addedLPStakingOldInfos
    .map((stakingInfo) => stakingInfo.stakingRewardAddress.toLowerCase())
    .reduce((totStr, str) => totStr + str, '');

  const stakingDualRewardAddress = addedDualStakingInfos
    .map((info) => info.stakingRewardAddress.toLowerCase())
    .reduce((totStr, str) => totStr + str, '');

  const lastStakingLPAddress =
    stakingLPInfos[stakingLPInfos.length - 1]?.stakingRewardAddress;

  const lastStakingLPOldAddress =
    stakingLPOldInfos[stakingLPOldInfos.length - 1]?.stakingRewardAddress;

  const lastStakingDualAddress =
    stakingDualInfos[stakingDualInfos.length - 1]?.stakingRewardAddress;

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
  }, [chainId]);

  useEffect(() => {
    setStakingLPInfos(
      stakingLPInfos
        .concat(addedLPStakingInfos)
        .filter(
          (val, ind, self) =>
            ind ===
            self.findIndex(
              (item) => item.stakingRewardAddress === val.stakingRewardAddress,
            ),
        ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingLPRewardAddress]);

  useEffect(() => {
    setStakingLPOldInfos(
      stakingLPOldInfos
        .concat(addedLPStakingOldInfos)
        .filter(
          (val, ind, self) =>
            ind ===
            self.findIndex(
              (item) => item.stakingRewardAddress === val.stakingRewardAddress,
            ),
        ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingLPOldRewardAddress]);

  useEffect(() => {
    setStakingDualInfos(
      stakingDualInfos
        .concat(addedDualStakingInfos)
        .filter(
          (val, ind, self) =>
            ind ===
            self.findIndex(
              (item) => item.stakingRewardAddress === val.stakingRewardAddress,
            ),
        ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingDualRewardAddress]);

  const [stakedOnly, setStakeOnly] = useState(false);
  const [farmSearch, setFarmSearch] = useState('');

  const filteredStakingLPInfos = useMemo(() => {
    const stakingInfos = isEndedFarm ? stakingLPOldInfos : stakingLPInfos;
    if (stakingInfos && stakingInfos.length > 0) {
      return stakingInfos
        .filter((stakingInfo) => {
          return (
            (stakedOnly
              ? Boolean(stakingInfo.stakedAmount.greaterThan('0'))
              : true) &&
            ((stakingInfo.tokens[0].symbol ?? '')
              .toLowerCase()
              .indexOf(farmSearch.toLowerCase()) > -1 ||
              (stakingInfo.tokens[0].name ?? '')
                .toLowerCase()
                .indexOf(farmSearch.toLowerCase()) > -1 ||
              (stakingInfo.tokens[0].address ?? '')
                .toLowerCase()
                .indexOf(farmSearch.toLowerCase()) > -1 ||
              (stakingInfo.tokens[1].symbol ?? '')
                .toLowerCase()
                .indexOf(farmSearch.toLowerCase()) > -1 ||
              (stakingInfo.tokens[1].name ?? '')
                .toLowerCase()
                .indexOf(farmSearch.toLowerCase()) > -1 ||
              (stakingInfo.tokens[1].address ?? '')
                .toLowerCase()
                .indexOf(farmSearch.toLowerCase()) > -1)
          );
        })
        .sort((a, b) => {
          if (sortBy === 1) {
            const poolStrA = a.tokens[0].symbol + '/' + a.tokens[1].symbol;
            const poolStrB = b.tokens[0].symbol + '/' + b.tokens[1].symbol;
            if (sortDesc) {
              return poolStrA > poolStrB ? -1 : 1;
            } else {
              return poolStrA < poolStrB ? -1 : 1;
            }
          } else if (sortBy === 2) {
            if (sortDesc) {
              return Number(a.tvl) > Number(b.tvl) ? -1 : 1;
            } else {
              return Number(a.tvl) < Number(b.tvl) ? -1 : 1;
            }
          } else if (sortBy === 3) {
            if (sortDesc) {
              return Number(a.totalRewardRate.toSignificant()) >
                Number(b.totalRewardRate.toSignificant())
                ? -1
                : 1;
            } else {
              return Number(a.totalRewardRate.toSignificant()) <
                Number(b.totalRewardRate.toSignificant())
                ? -1
                : 1;
            }
          } else if (sortBy === 4) {
            const aDayVolume = bulkPairs
              ? bulkPairs[a.pair]?.oneDayVolumeUSD
              : 0;
            const bDayVolume = bulkPairs
              ? bulkPairs[b.pair]?.oneDayVolumeUSD
              : 0;
            let aYearFee = 0;
            let bYearFee = 0;
            if (aDayVolume) {
              aYearFee =
                (aDayVolume * 0.003 * 365) / bulkPairs[a.pair]?.reserveUSD;
            }
            if (bDayVolume) {
              bYearFee =
                (bDayVolume * 0.003 * 365) / bulkPairs[b.pair]?.reserveUSD;
            }
            const aAPYwithFee =
              ((1 +
                ((Number(a.perMonthReturnInRewards) + Number(aYearFee) / 12) *
                  12) /
                  12) **
                12 -
                1) *
              100;
            const bAPYwithFee =
              ((1 +
                ((Number(b.perMonthReturnInRewards) + Number(bYearFee) / 12) *
                  12) /
                  12) **
                12 -
                1) *
              100;
            if (sortDesc) {
              return aAPYwithFee > bAPYwithFee ? -1 : 1;
            } else {
              return aAPYwithFee < bAPYwithFee ? -1 : 1;
            }
          } else if (sortBy === 5) {
            if (sortDesc) {
              return Number(a.earnedAmount.toSignificant()) >
                Number(b.earnedAmount.toSignificant())
                ? -1
                : 1;
            } else {
              return Number(a.earnedAmount.toSignificant()) <
                Number(b.earnedAmount.toSignificant())
                ? -1
                : 1;
            }
          }
          return 1;
        });
    }
    return [];
  }, [
    stakingLPInfos,
    stakedOnly,
    farmSearch,
    sortBy,
    sortDesc,
    bulkPairs,
    isEndedFarm,
    stakingLPOldInfos,
  ]);

  const filteredStakingDualInfos = useMemo(() => {
    if (!isEndedFarm && stakingDualInfos && stakingDualInfos.length > 0) {
      return stakingDualInfos
        .filter((stakingInfo) => {
          return (
            (stakedOnly
              ? Boolean(stakingInfo.stakedAmount.greaterThan('0'))
              : true) &&
            ((stakingInfo.tokens[0].symbol ?? '')
              .toLowerCase()
              .indexOf(farmSearch.toLowerCase()) > -1 ||
              (stakingInfo.tokens[0].name ?? '')
                .toLowerCase()
                .indexOf(farmSearch.toLowerCase()) > -1 ||
              (stakingInfo.tokens[0].address ?? '')
                .toLowerCase()
                .indexOf(farmSearch.toLowerCase()) > -1 ||
              (stakingInfo.tokens[1].symbol ?? '')
                .toLowerCase()
                .indexOf(farmSearch.toLowerCase()) > -1 ||
              (stakingInfo.tokens[1].name ?? '')
                .toLowerCase()
                .indexOf(farmSearch.toLowerCase()) > -1 ||
              (stakingInfo.tokens[1].address ?? '')
                .toLowerCase()
                .indexOf(farmSearch.toLowerCase()) > -1)
          );
        })
        .sort((a, b) => {
          if (sortBy === 1) {
            const poolStrA = a.tokens[0].symbol + '/' + a.tokens[1].symbol;
            const poolStrB = b.tokens[0].symbol + '/' + b.tokens[1].symbol;
            if (sortDesc) {
              return poolStrA > poolStrB ? -1 : 1;
            } else {
              return poolStrA < poolStrB ? -1 : 1;
            }
          } else if (sortBy === 2) {
            if (sortDesc) {
              return Number(a.tvl) > Number(b.tvl) ? -1 : 1;
            } else {
              return Number(a.tvl) < Number(b.tvl) ? -1 : 1;
            }
          } else if (sortBy === 3) {
            const aRewards =
              a.rateA * a.quickPrice + a.rateB * Number(a.rewardTokenBPrice);
            const bRewards =
              b.rateA * b.quickPrice + b.rateB * Number(b.rewardTokenBPrice);
            if (sortDesc) {
              return aRewards > bRewards ? -1 : 1;
            } else {
              return aRewards < bRewards ? -1 : 1;
            }
          } else if (sortBy === 4) {
            const aDayVolume = bulkPairs
              ? bulkPairs[a.pair]?.oneDayVolumeUSD
              : 0;
            const bDayVolume = bulkPairs
              ? bulkPairs[b.pair]?.oneDayVolumeUSD
              : 0;
            let aYearFee = 0;
            let bYearFee = 0;
            if (aDayVolume) {
              aYearFee =
                (aDayVolume * 0.003 * 365) / bulkPairs[a.pair]?.reserveUSD;
            }
            if (bDayVolume) {
              bYearFee =
                (bDayVolume * 0.003 * 365) / bulkPairs[b.pair]?.reserveUSD;
            }
            const aAPYwithFee =
              ((1 +
                ((Number(a.perMonthReturnInRewards) + Number(aYearFee) / 12) *
                  12) /
                  12) **
                12 -
                1) *
              100;
            const bAPYwithFee =
              ((1 +
                ((Number(b.perMonthReturnInRewards) + Number(bYearFee) / 12) *
                  12) /
                  12) **
                12 -
                1) *
              100;
            if (sortDesc) {
              return aAPYwithFee > bAPYwithFee ? -1 : 1;
            } else {
              return aAPYwithFee < bAPYwithFee ? -1 : 1;
            }
          } else if (sortBy === 5) {
            const earnedA =
              Number(a.earnedAmountA.toSignificant()) * a.quickPrice +
              Number(a.earnedAmountB.toSignificant()) * a.maticPrice;
            const earnedB =
              Number(b.earnedAmountA.toSignificant()) * b.quickPrice +
              Number(b.earnedAmountB.toSignificant()) * b.maticPrice;
            if (sortDesc) {
              return earnedA > earnedB ? -1 : 1;
            } else {
              return earnedA < earnedB ? -1 : 1;
            }
          }
          return 1;
        });
    }
    return [];
  }, [
    stakingDualInfos,
    stakedOnly,
    farmSearch,
    sortBy,
    sortDesc,
    bulkPairs,
    isEndedFarm,
  ]);

  const stakingAPYs = useMemo(() => {
    const filteredStakingInfos =
      farmIndex === 0 ? filteredStakingLPInfos : filteredStakingDualInfos;
    if (bulkPairs && filteredStakingInfos.length > 0) {
      return filteredStakingInfos.map((info: any) => {
        const oneDayVolume = bulkPairs[info.pair]?.oneDayVolumeUSD;
        if (oneDayVolume) {
          const oneYearFeeAPY =
            (oneDayVolume * 0.003 * 365) / bulkPairs[info.pair]?.reserveUSD;
          return oneYearFeeAPY;
        } else {
          return 0;
        }
      });
    } else {
      return [];
    }
  }, [bulkPairs, filteredStakingLPInfos, filteredStakingDualInfos, farmIndex]);

  const loadNext = () => {
    const REWARDS_INFO =
      farmIndex === 0
        ? isEndedFarm
          ? OLD_STAKING_REWARDS_INFO
          : STAKING_REWARDS_INFO
        : isEndedFarm
        ? null
        : STAKING_DUAL_REWARDS_INFO;
    const stakingInfos =
      farmIndex === 0
        ? isEndedFarm
          ? stakingLPOldInfos
          : stakingLPInfos
        : stakingDualInfos;
    const pageIndex =
      farmIndex === 0
        ? isEndedFarm
          ? pageLPOldIndex
          : pageLPIndex
        : pageDualIndex;
    const lastStakingAddress =
      farmIndex === 0
        ? isEndedFarm
          ? lastStakingLPOldAddress
          : lastStakingLPAddress
        : lastStakingDualAddress;
    if (chainId && REWARDS_INFO && REWARDS_INFO[chainId]) {
      if (
        stakingInfos.length < (REWARDS_INFO[chainId]?.length ?? 0) &&
        pageIndex * 6 > stakingInfos.length
      ) {
        if (farmIndex === 0) {
          if (isEndedFarm) {
            setPageLPOldIndex(stakingLPOldInfos.length / 6 + 1);
          } else {
            setPageLPIndex(stakingLPInfos.length / 6 + 1);
          }
        } else if (farmIndex === 1) {
          setPageDualIndex(stakingDualInfos.length / 6 + 1);
        }
      }
      if (
        !lastStakingAddress ||
        (REWARDS_INFO[chainId]?.[pageIndex * 6 - 1] &&
          lastStakingAddress ===
            REWARDS_INFO[chainId]?.[pageIndex * 6 - 1].stakingRewardAddress)
      ) {
        if (farmIndex === 0) {
          if (isEndedFarm) {
            setPageLPOldIndex(pageLPOldIndex + 1);
          } else {
            setPageLPIndex(pageLPIndex + 1);
          }
        } else if (farmIndex === 1) {
          setPageDualIndex(pageDualIndex + 1);
        }
      }
    }
  };

  const { loadMoreRef } = useInfiniteLoading(loadNext);

  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box
        mb={2}
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
      <Box display='flex' mb={4} width={300} height={48}>
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
                value={farmSearch}
                onChange={(evt: any) => setFarmSearch(evt.target.value)}
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
        {farmIndex === 0 &&
          filteredStakingLPInfos.map((info: StakingInfo, index) => (
            <FarmLPCard
              key={index}
              dQuicktoQuick={Number(lairInfo.dQUICKtoQUICK.toSignificant())}
              stakingInfo={info}
              stakingAPY={stakingAPYs[index]}
            />
          ))}

        {farmIndex === 1 &&
          filteredStakingDualInfos.map((info: DualStakingInfo, index) => (
            <FarmDualCard
              key={index}
              dQuicktoQuick={Number(lairInfo.dQUICKtoQUICK.toSignificant())}
              stakingInfo={info}
              stakingAPY={stakingAPYs[index]}
            />
          ))}
      </Box>
      <div ref={loadMoreRef} style={{ marginTop: 20 }} />
    </Box>
  );
};

export default FarmPage;
