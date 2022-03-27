import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { ArrowUp, ArrowDown } from 'react-feather';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
import { useSyrupInfo, useOldSyrupInfo, useLairInfo } from 'state/stake/hooks';
import { SyrupInfo } from 'types';
import {
  SyrupCard,
  ToggleSwitch,
  CustomMenu,
  SearchInput,
  CustomSwitch,
} from 'components';
import {
  useLairDQUICKAPY,
  getPageItemsToLoad,
  getTokenAPRSyrup,
  returnFullWidthMobile,
  getExactTokenAmount,
} from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';
import { Skeleton } from '@material-ui/lab';

const LOADSYRUP_COUNT = 10;
const TOKEN_COLUMN = 1;
const DEPOSIT_COLUMN = 2;
const APR_COLUMN = 3;
const EARNED_COLUMN = 4;

const DragonsSyrup: React.FC = () => {
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [pageLoading, setPageLoading] = useState(false); //this is used for not loading syrups immediately when user is on dragons page
  const [isEndedSyrup, setIsEndedSyrup] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [sortBy, setSortBy] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);

  const [stakedOnly, setStakeOnly] = useState(false);
  const [syrupSearch, setSyrupSearch] = useState('');
  const [syrupSearchInput, setSyrupSearchInput] = useDebouncedChangeHandler(
    syrupSearch,
    setSyrupSearch,
  );

  const lairInfo = useLairInfo();
  const dQUICKAPY = useLairDQUICKAPY(lairInfo);

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
        getExactTokenAmount(a.totalStakedAmount);
      const depositB =
        b.valueOfTotalStakedAmountInUSDC ??
        getExactTokenAmount(b.totalStakedAmount);
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
        getExactTokenAmount(a.earnedAmount) * (a.rewardTokenPriceinUSD ?? 0);
      const earnedUSDB =
        getExactTokenAmount(b.earnedAmount) * (b.rewardTokenPriceinUSD ?? 0);
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
    setPageIndex(0);
  }, [syrupRewardAddress]);

  const syrupInfos = useMemo(() => {
    return sortedSyrupInfos
      ? sortedSyrupInfos.slice(
          0,
          getPageItemsToLoad(pageIndex, LOADSYRUP_COUNT),
        )
      : null;
  }, [sortedSyrupInfos, pageIndex]);

  const loadNext = () => {
    setPageIndex(pageIndex + 1);
  };

  const { loadMoreRef } = useInfiniteLoading(loadNext);

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

  const syrupStatusItems = [
    {
      text: 'Active',
      onClick: () => setIsEndedSyrup(false),
      condition: !isEndedSyrup,
    },
    {
      text: 'Ended',
      onClick: () => setIsEndedSyrup(true),
      condition: isEndedSyrup,
    },
  ];

  const sortColumns = [
    {
      text: 'Earn',
      index: TOKEN_COLUMN,
      width: 0.3,
    },
    {
      text: 'Deposits',
      index: DEPOSIT_COLUMN,
      width: 0.3,
    },
    {
      text: 'APR',
      index: APR_COLUMN,
      width: 0.2,
    },
    {
      text: 'Earned',
      index: EARNED_COLUMN,
      width: 0.2,
      justify: 'flex-end',
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

  const sortByMobileItems = sortColumns.map((item) => {
    return { text: item.text, onClick: () => setSortBy(item.index) };
  });

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
          <Box mr={2}>
            <CustomSwitch width={160} height={40} items={syrupStatusItems} />
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
                  : palette.text.secondary
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
      {syrupInfos && !pageLoading ? (
        syrupInfos.map((syrup, ind) => (
          <SyrupCard key={ind} syrup={syrup} dQUICKAPY={dQUICKAPY} />
        ))
      ) : (
        <>
          <Skeleton width='100%' height={120} />
          <Skeleton width='100%' height={120} />
          <Skeleton width='100%' height={120} />
          <Skeleton width='100%' height={120} />
          <Skeleton width='100%' height={120} />
        </>
      )}
      <div ref={loadMoreRef} />
    </>
  );
};

export default DragonsSyrup;
