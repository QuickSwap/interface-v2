import React, { useCallback, useMemo, useState } from 'react';
import { Box, useMediaQuery } from '@material-ui/core';
import { ArrowUp, ArrowDown } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ReactComponent as QUICKV2Icon } from 'assets/images/quickIcon.svg';
import SyrupIcon from 'assets/images/syrupIcon.png';
import 'pages/styles/dragon.scss';
import { useTheme } from '@material-ui/core/styles';
import {
  useFilteredSyrupInfo,
  useNewLairInfo,
  useOldSyrupInfo,
} from 'state/stake/hooks';
import { useActiveWeb3React } from 'hooks';
import { SearchInput, SyrupCard, ToggleSwitch } from 'components';
import { SyrupInfo } from 'types';
import { getExactTokenAmount, getTokenAPRSyrup, useLairDQUICKAPY } from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';

const TOKEN_COLUMN = 1;
const DEPOSIT_COLUMN = 2;
const APR_COLUMN = 3;
const EARNED_COLUMN = 4;

const DragonsSyrup: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [tabValue, setTabValue] = useState('1');
  const { t } = useTranslation();
  const [stakedOnly, setStakeOnly] = useState(false);
  const [syrupSearch, setSyrupSearch] = useState('');
  const [syrupSearchInput, setSyrupSearchInput] = useDebouncedChangeHandler(
    syrupSearch,
    setSyrupSearch,
  );

  const handleTabChange = (newValue: string) => {
    setTabValue(newValue);
  };

  const { chainId } = useActiveWeb3React();
  const isEndedSyrup = tabValue === '0';

  const [sortBy, setSortBy] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);

  const lairInfo = useNewLairInfo();
  const dQUICKAPY = useLairDQUICKAPY(false, lairInfo);

  const renderStakedOnly = () => (
    <Box className='flex items-center' minWidth={135} gridGap={8}>
      <small className='text-disabled'>{t('stakedOnly')}</small>
      <ToggleSwitch
        toggled={stakedOnly}
        onToggle={() => setStakeOnly(!stakedOnly)}
      />
    </Box>
  );

  const addedStakingSyrupInfos = useFilteredSyrupInfo(
    chainId,
    null,
    isEndedSyrup ? 0 : undefined,
    isEndedSyrup ? 0 : undefined,
    { search: syrupSearch, isStaked: stakedOnly },
  );
  const addedOldSyrupInfos = useOldSyrupInfo(
    chainId,
    null,
    isEndedSyrup ? undefined : 0,
    isEndedSyrup ? undefined : 0,
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

  const sortColumns = [
    {
      text: t('earn'),
      index: TOKEN_COLUMN,
      width: 0.3,
    },
    {
      text: t('deposits'),
      index: DEPOSIT_COLUMN,
      width: 0.3,
    },
    {
      text: t('apr'),
      index: APR_COLUMN,
      width: 0.2,
    },
    {
      text: t('earned'),
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

  return (
    <>
      <Box className='dragonSyrupWrapper dragonLairBg'>
        <Box
          className={
            isMobile
              ? 'dragonSyrupHeaderMobile flex flex-col'
              : 'dragonSyrupHeader flex-wrap'
          }
          gridGap={8}
        >
          <Box className='dragonSyrupHeaderWrapper'>
            <QUICKV2Icon
              width='40px'
              height='40px'
              style={{
                display: isMobile ? 'none' : '',
              }}
            />
            <Box>
              <h5 className='text-dragon-white'>{t('dragonSyrup')}</h5>
              <small>{t('dragonSyrupTitle')}</small>
            </Box>
          </Box>
          <Box className='flex items-center flex-wrap' flex={1} gridGap={8}>
            <Box flex={1} minWidth={300}>
              <SearchInput
                placeholder={isMobile ? t('search') : t('searchPlaceHolder')}
                value={syrupSearchInput}
                setValue={setSyrupSearchInput}
              />
            </Box>
            <Box className='tab-container' minWidth={176}>
              <button
                className={tabValue === '1' ? 'active' : ''}
                onClick={() => handleTabChange('1')}
              >
                Active
              </button>
              <button
                className={tabValue === '0' ? 'active' : ''}
                onClick={() => handleTabChange('0')}
              >
                Ended
              </button>
            </Box>
            {renderStakedOnly()}
          </Box>
        </Box>
        {!isMobile && (
          <Box mt={2.5} display='flex' paddingX={2}>
            {sortByDesktopItems.map((item) => (
              <Box
                key={item.index}
                width={item.width}
                justifyContent={item.justify}
                onClick={item.onClick}
                className={`flex items-center cursor-pointer ${
                  sortBy === item.index ? '' : 'text-secondary'
                }`}
              >
                <small>{item.text}</small>
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
        {sortedSyrupInfos && sortedSyrupInfos.length > 0 ? (
          sortedSyrupInfos.map((syrup, ind) => (
            <SyrupCard key={ind} syrup={syrup} dQUICKAPY={dQUICKAPY} />
          ))
        ) : (
          <Box className='dragonSyrupContainer'>
            <Box className='text-center'>
              <img src={SyrupIcon} />
              <h5>{t('noSyrupPools')}</h5>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default DragonsSyrup;
