import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { ArrowUp, ArrowDown } from 'react-feather';
import cx from 'classnames';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
import { SyrupInfo, useSyrupInfo, useOldSyrupInfo } from 'state/stake/hooks';
import { SyrupCard, ToggleSwitch, CustomMenu, SearchInput } from 'components';
import { getTokenAPRSyrup, returnFullWidthMobile } from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  syrupSwitch: {
    width: '50%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    background: palette.background.paper,
    border: `1px solid ${palette.secondary.dark}`,
    '& p': {
      color: palette.text.secondary,
    },
  },
  activeSyrupSwitch: {
    background: palette.secondary.dark,
    '& p': {
      color: palette.text.primary,
    },
  },
}));

const LOADSYRUP_COUNT = 10;
const TOKEN_COLUMN = 1;
const DEPOSIT_COLUMN = 2;
const APR_COLUMN = 3;
const EARNED_COLUMN = 4;

const DragonsSyrup: React.FC = () => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [pageLoading, setPageLoading] = useState(true); //this is used for not loading syrups immediately when user is on dragons page
  const [isEndedSyrup, setIsEndedSyrup] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [syrupInfos, setSyrupInfos] = useState<SyrupInfo[] | undefined>(
    undefined,
  );
  const [sortBy, setSortBy] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);

  const [stakedOnly, setStakeOnly] = useState(false);
  const [syrupSearch, setSyrupSearch] = useState('');
  const [syrupSearchInput, setSyrupSearchInput] = useDebouncedChangeHandler(
    syrupSearch,
    setSyrupSearch,
  );

  const addedStakingSyrupInfos = useSyrupInfo(
    null,
    pageLoading || isEndedSyrup ? 0 : undefined,
    pageLoading || isEndedSyrup ? 0 : undefined,
    { search: syrupSearch, isStaked: stakedOnly },
  );
  const addedOldSyrupInfos = useOldSyrupInfo(
    null,
    pageLoading || isEndedSyrup ? undefined : 0,
    pageLoading || isEndedSyrup ? undefined : 0,
    { search: syrupSearch, isStaked: stakedOnly },
  );

  const addedSyrupInfos = isEndedSyrup
    ? addedOldSyrupInfos
    : addedStakingSyrupInfos;

  const sortIndex = sortDesc ? 1 : -1;

  const sortByToken = useCallback(
    (a: SyrupInfo, b: SyrupInfo) => {
      const syrupStrA = a.token.symbol ?? '';
      const syrupStrB = b.token.symbol ?? '';
      return (syrupStrA > syrupStrB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByDeposit = useCallback(
    (a: SyrupInfo, b: SyrupInfo) => {
      const depositA =
        a.valueOfTotalStakedAmountInUSDC ??
        Number(a.totalStakedAmount.toSignificant());
      const depositB =
        b.valueOfTotalStakedAmountInUSDC ??
        Number(b.totalStakedAmount.toSignificant());
      return (depositA > depositB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortByAPR = useCallback(
    (a: SyrupInfo, b: SyrupInfo) => {
      return (getTokenAPRSyrup(a) > getTokenAPRSyrup(b) ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );
  const sortByEarned = useCallback(
    (a: SyrupInfo, b: SyrupInfo) => {
      const earnedUSDA =
        Number(a.earnedAmount.toSignificant()) *
        Number(a.rewardTokenPriceinUSD ?? 0);
      const earnedUSDB =
        Number(b.earnedAmount.toSignificant()) *
        Number(b.rewardTokenPriceinUSD ?? 0);
      return (earnedUSDA > earnedUSDB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const sortedSyrupInfos = useMemo(() => {
    return addedSyrupInfos.sort((a, b) => {
      if (sortBy === TOKEN_COLUMN) {
        return sortByToken(a, b);
      } else if (sortBy === DEPOSIT_COLUMN) {
        return sortByDeposit(a, b);
      } else if (sortBy === APR_COLUMN) {
        return sortByAPR(a, b);
      } else if (sortBy === EARNED_COLUMN) {
        return sortByEarned(a, b);
      }
      return 1;
    });
  }, [
    addedSyrupInfos,
    sortBy,
    sortByToken,
    sortByDeposit,
    sortByAPR,
    sortByEarned,
  ]);

  const syrupRewardAddress = useMemo(
    () =>
      sortedSyrupInfos
        .map((syrupInfo) => syrupInfo.stakingRewardAddress.toLowerCase())
        .reduce((totStr, str) => totStr + str, ''),
    [sortedSyrupInfos],
  );

  useEffect(() => {
    setSyrupInfos(undefined);
    setTimeout(() => setPageLoading(false), 500); //load syrups 0.5s after loading page
  }, []);

  useEffect(() => {
    setPageIndex(0);
    setSyrupInfos(sortedSyrupInfos.slice(0, LOADSYRUP_COUNT));
    return () => setSyrupInfos(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syrupRewardAddress]);

  useEffect(() => {
    const currentSyrupInfos = syrupInfos || [];
    const syrupInfosToAdd = sortedSyrupInfos.slice(
      currentSyrupInfos.length,
      currentSyrupInfos.length + LOADSYRUP_COUNT,
    );
    setSyrupInfos(currentSyrupInfos.concat(syrupInfosToAdd));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  const loadNext = () => {
    setPageIndex(pageIndex + 1);
  };

  const { loadMoreRef } = useInfiniteLoading(loadNext);

  const sortByMobileItems = [
    {
      text: 'Token',
      onClick: () => setSortBy(TOKEN_COLUMN),
    },
    {
      text: 'Deposits',
      onClick: () => setSortBy(DEPOSIT_COLUMN),
    },
    {
      text: 'APR',
      onClick: () => setSortBy(APR_COLUMN),
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
    <>
      <Box display='flex' flexWrap='wrap' alignItems='center' mb={3.5}>
        <Box
          display='flex'
          justifyContent='space-between'
          width={returnFullWidthMobile(isMobile)}
          flex={isMobile ? 'unset' : 1}
        >
          <Box width={isMobile ? 'calc(100% - 150px)' : 1} mr={2} my={2}>
            <SearchInput
              placeholder={
                isMobile ? 'Search' : 'Search name, symbol or paste address'
              }
              value={syrupSearchInput}
              setValue={setSyrupSearchInput}
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
                classes.syrupSwitch,
                !isEndedSyrup && classes.activeSyrupSwitch,
              )}
              style={{
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              }}
              onClick={() => {
                setIsEndedSyrup(false);
              }}
            >
              <Typography variant='body2'>Active</Typography>
            </Box>
            <Box
              className={cx(
                classes.syrupSwitch,
                isEndedSyrup && classes.activeSyrupSwitch,
              )}
              style={{
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
              }}
              onClick={() => {
                setIsEndedSyrup(true);
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
      <Divider />
      <Box mt={2.5} display='flex' paddingX={2}>
        {!isMobile && (
          <>
            <Box
              width={0.3}
              display='flex'
              alignItems='center'
              onClick={() => {
                if (sortBy === TOKEN_COLUMN) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(TOKEN_COLUMN);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === TOKEN_COLUMN
                  ? palette.text.primary
                  : palette.secondary.main
              }
              style={{ cursor: 'pointer' }}
            >
              <Typography variant='body2'>Earn</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === TOKEN_COLUMN && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
            <Box
              width={0.3}
              display='flex'
              alignItems='center'
              onClick={() => {
                if (sortBy === DEPOSIT_COLUMN) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(DEPOSIT_COLUMN);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === DEPOSIT_COLUMN
                  ? palette.text.primary
                  : palette.secondary.main
              }
              style={{ cursor: 'pointer' }}
            >
              <Typography variant='body2'>Deposits</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === DEPOSIT_COLUMN && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
            <Box
              width={0.2}
              display='flex'
              alignItems='center'
              onClick={() => {
                if (sortBy === APR_COLUMN) {
                  setSortDesc(!sortDesc);
                } else {
                  setSortBy(APR_COLUMN);
                  setSortDesc(false);
                }
              }}
              color={
                sortBy === APR_COLUMN
                  ? palette.text.primary
                  : palette.secondary.main
              }
              style={{ cursor: 'pointer' }}
            >
              <Typography variant='body2'>APR</Typography>
              <Box display='flex' ml={0.5}>
                {sortBy === APR_COLUMN && sortDesc ? (
                  <ArrowDown size={20} />
                ) : (
                  <ArrowUp size={20} />
                )}
              </Box>
            </Box>
            <Box
              width={0.2}
              display='flex'
              alignItems='center'
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
              justifyContent='flex-end'
              style={{ cursor: 'pointer' }}
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
          </>
        )}
      </Box>
      {syrupInfos ? (
        syrupInfos.map((syrup, ind) => <SyrupCard key={ind} syrup={syrup} />)
      ) : (
        <Skeleton width='100%' height={80} />
      )}
      <div ref={loadMoreRef} />
    </>
  );
};

export default DragonsSyrup;
