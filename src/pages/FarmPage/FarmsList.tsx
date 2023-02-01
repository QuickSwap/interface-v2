import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Divider, Skeleton } from 'theme/components';
import { ArrowUp, ArrowDown } from 'react-feather';
import {
  useStakingInfo,
  useOldStakingInfo,
  useDualStakingInfo,
  useCNTStakingInfo,
} from 'state/stake/hooks';
import {
  StakingInfo,
  DualStakingInfo,
  CommonStakingInfo,
  OtherStackingInfo,
} from 'types';
import {
  FarmCard,
  ToggleSwitch,
  CustomMenu,
  SearchInput,
  CustomSwitch,
  SortColumns,
} from 'components';
import { GlobalConst } from 'constants/index';
import {
  getAPYWithFee,
  getExactTokenAmount,
  getOneYearFee,
  getPageItemsToLoad,
  returnFullWidthMobile,
} from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useHistory } from 'react-router-dom';
import { useIsXS } from 'hooks/useMediaQuery';

const LOADFARM_COUNT = 10;
const POOL_COLUMN = '1';
const TVL_COLUMN = '2';
const REWARDS_COLUMN = '3';
const APY_COLUMN = '4';
const EARNED_COLUMN = '5';

interface FarmsListProps {
  bulkPairs: any;
}

const FarmsList: React.FC<FarmsListProps> = ({ bulkPairs }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const parsedQuery = useParsedQueryString();
  const isMobile = useIsXS();
  const currentTab =
    parsedQuery && parsedQuery.tab
      ? (parsedQuery.tab as string)
      : GlobalConst.v2FarmTab.LPFARM;
  const isEndedFarm =
    parsedQuery && parsedQuery.ended ? parsedQuery.ended === 'true' : false;
  const stakedOnly =
    parsedQuery && parsedQuery.stakedOnly
      ? parsedQuery.stakedOnly === 'true'
      : false;
  const sortDesc =
    parsedQuery && parsedQuery.sortDesc
      ? parsedQuery.sortDesc === 'true'
      : false;
  const sortBy =
    parsedQuery && parsedQuery.sortBy
      ? (parsedQuery.sortBy as string)
      : POOL_COLUMN;

  const { chainId } = useActiveWeb3React();
  const [pageIndex, setPageIndex] = useState(0);
  const [farmSearch, setFarmSearch] = useState('');
  const [farmSearchInput, setFarmSearchInput] = useDebouncedChangeHandler(
    farmSearch,
    setFarmSearch,
  );

  const chainIdOrDefault = chainId ?? ChainId.MATIC;

  const addedLPStakingInfos = useStakingInfo(
    chainIdOrDefault,
    null,
    currentTab === GlobalConst.v2FarmTab.DUALFARM || isEndedFarm
      ? 0
      : undefined,
    currentTab === GlobalConst.v2FarmTab.DUALFARM || isEndedFarm
      ? 0
      : undefined,
    { search: farmSearch, isStaked: stakedOnly },
  );
  const addedLPStakingOldInfos = useOldStakingInfo(
    chainIdOrDefault,
    null,
    currentTab === GlobalConst.v2FarmTab.DUALFARM || !isEndedFarm
      ? 0
      : undefined,
    currentTab === GlobalConst.v2FarmTab.DUALFARM || !isEndedFarm
      ? 0
      : undefined,
    { search: farmSearch, isStaked: stakedOnly },
  );
  const addedCNTStakingInfos = useCNTStakingInfo(
    chainIdOrDefault,
    null,
    currentTab === GlobalConst.v2FarmTab.LPFARM ? 0 : undefined,
    currentTab === GlobalConst.v2FarmTab.LPFARM ? 0 : undefined,
    { search: farmSearch, isStaked: stakedOnly, isEndedFarm },
  );
  const addedDualStakingInfos = useDualStakingInfo(
    chainIdOrDefault,
    null,
    currentTab === GlobalConst.v2FarmTab.LPFARM ? 0 : undefined,
    currentTab === GlobalConst.v2FarmTab.LPFARM ? 0 : undefined,
    { search: farmSearch, isStaked: stakedOnly, isEndedFarm },
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
        (getExactTokenAmount(a.totalRewardRate) >
        getExactTokenAmount(b.totalRewardRate)
          ? -1
          : 1) * sortIndex
      );
    },
    [sortIndex],
  );

  const sortByRewardDual = useCallback(
    (a: DualStakingInfo, b: DualStakingInfo) => {
      const aRewards =
        a.rateA * a.rewardTokenAPrice + a.rateB * a.rewardTokenBPrice;
      const bRewards =
        b.rateA * b.rewardTokenAPrice + b.rateB * b.rewardTokenBPrice;
      return (aRewards > bRewards ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const getReward = (obj: OtherStackingInfo) => {
    if ('totalRewardRate' in obj) {
      return getExactTokenAmount(obj.totalRewardRate);
    } else if ('rateA' in obj) {
      return (
        obj.rateA * obj.rewardTokenAPrice + obj.rateB * obj.rewardTokenBPrice
      );
    } else {
      return 0;
    }
  };

  const sortByRewardOther = useCallback(
    (a: OtherStackingInfo, b: OtherStackingInfo) => {
      const aRewards = getReward(a);
      const bRewards = getReward(b);
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
        (getExactTokenAmount(a.earnedAmount) >
        getExactTokenAmount(b.earnedAmount)
          ? -1
          : 1) * sortIndex
      );
    },
    [sortIndex],
  );

  const sortByEarnedDual = useCallback(
    (a: DualStakingInfo, b: DualStakingInfo) => {
      const earnedA =
        getExactTokenAmount(a.earnedAmountA) * a.rewardTokenAPrice +
        getExactTokenAmount(a.earnedAmountB) * a.rewardTokenBPrice;
      const earnedB =
        getExactTokenAmount(b.earnedAmountA) * b.rewardTokenAPrice +
        getExactTokenAmount(b.earnedAmountB) * b.rewardTokenBPrice;
      return (earnedA > earnedB ? -1 : 1) * sortIndex;
    },
    [sortIndex],
  );

  const getEarnedAmount = (obj: OtherStackingInfo): number => {
    if ('earnedAmount' in obj) {
      return getExactTokenAmount(obj.earnedAmount);
    } else if ('earnedAmountA' in obj) {
      return (
        getExactTokenAmount(obj.earnedAmountA) * obj.rewardTokenAPrice +
        getExactTokenAmount(obj.earnedAmountB) * obj.rewardTokenBPrice
      );
    } else {
      return 0;
    }
  };

  const sortByEarnedOther = useCallback(
    (a: OtherStackingInfo, b: OtherStackingInfo) => {
      const earnedA: number = getEarnedAmount(a);
      const earnedB: number = getEarnedAmount(b);
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

  const sortedOtherLpStakingInfo = useMemo(() => {
    const otherLpStackingInfo = addedCNTStakingInfos.filter(
      (info) => info.ended === isEndedFarm,
    );
    return otherLpStackingInfo.sort((a, b) => {
      if (sortBy === POOL_COLUMN) {
        return sortByToken(a, b);
      } else if (sortBy === TVL_COLUMN) {
        return sortByTVL(a, b);
      } else if (sortBy === REWARDS_COLUMN) {
        return sortByRewardOther(a, b);
      } else if (sortBy === APY_COLUMN) {
        return sortByAPY(a, b);
      } else if (sortBy === EARNED_COLUMN) {
        return sortByEarnedOther(a, b);
      }
      return 1;
    });
  }, [
    addedCNTStakingInfos,
    isEndedFarm,
    sortBy,
    sortByToken,
    sortByTVL,
    sortByRewardOther,
    sortByAPY,
    sortByEarnedOther,
  ]);

  const addedStakingInfos = useMemo(
    () =>
      currentTab === GlobalConst.v2FarmTab.DUALFARM
        ? sortedStakingDualInfos
        : sortedLPStakingInfos,
    [currentTab, sortedStakingDualInfos, sortedLPStakingInfos],
  );

  const stakingRewardAddress = addedStakingInfos
    ? addedStakingInfos
        .map((stakingInfo) => stakingInfo.stakingRewardAddress.toLowerCase())
        .reduce((totStr, str) => totStr + str, '')
    : null;

  useEffect(() => {
    setPageIndex(0);
  }, [stakingRewardAddress, currentTab]);

  const stakingInfos = useMemo(() => {
    return sortedLPStakingInfos
      ? sortedLPStakingInfos.slice(
          0,
          getPageItemsToLoad(pageIndex, LOADFARM_COUNT),
        )
      : null;
  }, [sortedLPStakingInfos, pageIndex]);

  const otherLpStackingInfos = useMemo(() => {
    return sortedOtherLpStakingInfo
      ? sortedOtherLpStakingInfo.slice(
          0,
          getPageItemsToLoad(pageIndex, LOADFARM_COUNT),
        )
      : null;
  }, [sortedOtherLpStakingInfo, pageIndex]);

  const stakingDualInfos = useMemo(() => {
    return sortedStakingDualInfos
      ? sortedStakingDualInfos.slice(
          0,
          getPageItemsToLoad(pageIndex, LOADFARM_COUNT),
        )
      : null;
  }, [sortedStakingDualInfos, pageIndex]);

  const getPoolApy = (pairId: string) => {
    if (!pairId || !bulkPairs) {
      return 0;
    }

    const oneDayVolume = bulkPairs?.[pairId.toLowerCase()]?.oneDayVolumeUSD;
    const reserveUSD = bulkPairs?.[pairId.toLowerCase()]?.reserveUSD;
    const oneYearFeeAPY = getOneYearFee(
      Number(oneDayVolume),
      Number(reserveUSD),
    );
    return oneYearFeeAPY;
  };

  const loadNext = () => {
    setPageIndex(pageIndex + 1);
  };

  const { loadMoreRef } = useInfiniteLoading(loadNext);

  const sortColumns = [
    {
      text: t('pool'),
      index: POOL_COLUMN,
      width: '30%',
      justify: 'flex-start',
    },
    { text: t('tvl'), index: TVL_COLUMN, width: '20%', justify: 'center' },
    {
      text: t('rewards'),
      index: REWARDS_COLUMN,
      width: '25%',
      justify: 'center',
    },
    { text: t('apy'), index: APY_COLUMN, width: '15%', justify: 'center' },
    {
      text: t('earned'),
      index: EARNED_COLUMN,
      width: '20%',
      justify: 'flex-end',
    },
  ];

  const redirectWithFarms = (key: string, value: string) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath;
    if (parsedQuery && parsedQuery[key]) {
      redirectPath = currentPath.replace(
        `${key}=${parsedQuery[key]}`,
        `${key}=${value}`,
      );
    } else {
      redirectPath = `${currentPath}${
        history.location.search === '' ? '?' : '&'
      }${key}=${value}`;
    }
    history.push(redirectPath);
  };

  const sortByDesktopItems = sortColumns.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortBy === item.index) {
          redirectWithFarms('sortDesc', sortDesc ? 'false' : 'true');
        } else {
          redirectWithFarms('sortBy', item.index);
          redirectWithFarms('sortDesc', 'false');
        }
      },
    };
  });

  const sortByMobileItems = sortColumns.map((item) => {
    return {
      text: item.text,
      onClick: () => redirectWithFarms('sortBy', item.index),
    };
  });

  const renderStakedOnly = () => (
    <Box className='flex items-center'>
      <small className='text-disabled' style={{ marginRight: 8 }}>
        {t('stakedOnly')}
      </small>
      <ToggleSwitch
        toggled={stakedOnly}
        onToggle={() =>
          redirectWithFarms('stakedOnly', stakedOnly ? 'false' : 'true')
        }
      />
    </Box>
  );

  const farmStatusItems = [
    {
      text: t('active'),
      onClick: () => redirectWithFarms('ended', 'false'),
      condition: !isEndedFarm,
    },
    {
      text: t('ended'),
      onClick: () => redirectWithFarms('ended', 'true'),
      condition: isEndedFarm,
    },
  ];

  return (
    <>
      <Box className='farmListHeader'>
        <Box>
          <h5>
            {t(
              currentTab === GlobalConst.v2FarmTab.OTHER_LP
                ? 'earnRewards'
                : 'earndQUICK',
            )}
          </h5>
          <small>
            {t(
              currentTab === GlobalConst.v2FarmTab.LPFARM
                ? 'stakeMessageLP'
                : currentTab === GlobalConst.v2FarmTab.OTHER_LP
                ? 'stakeMessageOtherLP'
                : 'stakeMessageDual',
            )}
          </small>
        </Box>
        <Box className='flex flex-wrap'>
          <Box
            className='flex justify-between'
            width={returnFullWidthMobile(isMobile)}
          >
            <Box
              width={isMobile ? 'calc(100% - 150px)' : '100%'}
              margin='16px 16px 16px 0'
            >
              <SearchInput
                placeholder={isMobile ? t('search') : t('searchPlaceHolder')}
                value={farmSearchInput}
                setValue={setFarmSearchInput}
              />
            </Box>
            {isMobile && renderStakedOnly()}
          </Box>
          <Box
            width={returnFullWidthMobile(isMobile)}
            className='flex flex-wrap items-center'
          >
            <Box margin='0 16px 0 0'>
              <CustomSwitch width={160} height={40} items={farmStatusItems} />
            </Box>
            {isMobile ? (
              <>
                <Box height='40px' flex={1}>
                  <CustomMenu
                    title={t('sortBy')}
                    menuItems={sortByMobileItems}
                  />
                </Box>
                <Box
                  margin='16px 0 0'
                  width='100%'
                  className='flex items-center'
                >
                  <small className='text-disabled' style={{ marginRight: 8 }}>
                    {sortDesc ? t('sortdesc') : t('sortasc')}
                  </small>
                  <ToggleSwitch
                    toggled={sortDesc}
                    onToggle={() =>
                      redirectWithFarms('sortDesc', sortDesc ? 'false' : 'true')
                    }
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
        <Box margin='20px 0 0'>
          <SortColumns
            sortColumns={sortByDesktopItems}
            selectedSort={sortBy}
            sortDesc={sortDesc}
          />
        </Box>
      )}
      {(currentTab === GlobalConst.v2FarmTab.LPFARM && !stakingInfos) ||
        (currentTab === GlobalConst.v2FarmTab.DUALFARM && !stakingDualInfos && (
          <>
            <Skeleton width='100%' height='100px' />
            <Skeleton width='100%' height='100px' />
            <Skeleton width='100%' height='100px' />
            <Skeleton width='100%' height='100px' />
            <Skeleton width='100%' height='100px' />
          </>
        ))}
      {currentTab === GlobalConst.v2FarmTab.LPFARM &&
        stakingInfos &&
        stakingInfos.map((info: StakingInfo, index) => (
          <FarmCard
            key={index}
            stakingInfo={info}
            stakingAPY={getPoolApy(info?.pair)}
            isLPFarm={true}
          />
        ))}
      {currentTab === GlobalConst.v2FarmTab.DUALFARM &&
        stakingDualInfos &&
        stakingDualInfos.map((info: DualStakingInfo, index) => (
          <FarmCard
            key={index}
            stakingInfo={info}
            stakingAPY={getPoolApy(info?.pair)}
          />
        ))}
      {currentTab === GlobalConst.v2FarmTab.OTHER_LP &&
        otherLpStackingInfos &&
        otherLpStackingInfos.map((info: OtherStackingInfo, index) => (
          <FarmCard
            key={index}
            stakingInfo={info}
            stakingAPY={getPoolApy(info?.pair)}
            isLPFarm={true}
          />
        ))}
      <div ref={loadMoreRef} />
    </>
  );
};

export default FarmsList;
