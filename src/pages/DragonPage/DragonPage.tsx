import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { ArrowUp, ArrowDown } from 'react-feather';
import cx from 'classnames';
import {
  Box,
  Typography,
  Grid,
  Divider,
  useMediaQuery,
} from '@material-ui/core';
import {
  SyrupInfo,
  useLairInfo,
  useSyrupInfo,
  useOldSyrupInfo,
} from 'state/stake/hooks';
import {
  CurrencyLogo,
  SyrupCard,
  ToggleSwitch,
  StakeQuickModal,
  UnstakeQuickModal,
} from 'components';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import DragonBg1 from 'assets/images/DragonBg1.svg';
import DragonBg2 from 'assets/images/DragonBg2.svg';
import DragonLairMask from 'assets/images/DragonLairMask.svg';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { getDaysCurrentYear, formatNumber, returnTokenFromKey } from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';
import { Skeleton } from '@material-ui/lab';

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
    backgroundColor: palette.background.paper,
    borderRadius: 20,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
    [breakpoints.down('xs')]: {
      padding: '24px 16px',
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
  stepWrapper: {
    width: 80,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.secondary.contrastText,
    '& span': {
      fontWeight: 'bold',
      color: '#b6b9cc',
    },
  },
  dragonTitle: {
    margin: '24px 0 64px',
    '& h5': {
      marginBottom: 16,
      color: palette.text.primary,
    },
    '& p': {
      maxWidth: 280,
      color: palette.text.primary,
    },
  },
  stakeButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    cursor: 'pointer',
  },
  searchInput: {
    height: 40,
    border: `1px solid ${palette.secondary.dark}`,
    borderRadius: 10,
    minWidth: 250,
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    flex: 1,
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
      flex: 'none',
    },
  },
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

const LOADSYRUP_COUNT = 5;
const TOKEN_COLUMN = 1;
const DEPOSIT_COLUMN = 2;
const APR_COLUMN = 3;
const EARNED_COLUMN = 4;

const DragonPage: React.FC = () => {
  const classes = useStyles();
  const daysCurrentYear = getDaysCurrentYear();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [isQUICKRate, setIsQUICKRate] = useState(false);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const [openUnstakeModal, setOpenUnstakeModal] = useState(false);
  const [isEndedSyrup, setIsEndedSyrup] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const lairInfo = useLairInfo();
  const [syrupInfos, setSyrupInfos] = useState<SyrupInfo[] | undefined>(
    undefined,
  );
  const [sortBy, setSortBy] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);
  const APR =
    (((Number(lairInfo?.oneDayVol) * 0.04 * 0.01) /
      Number(lairInfo?.dQuickTotalSupply.toSignificant(6))) *
      daysCurrentYear) /
    (Number(lairInfo?.dQUICKtoQUICK.toSignificant()) *
      Number(lairInfo?.quickPrice));
  const APY = APR
    ? (
        (Math.pow(1 + APR / daysCurrentYear, daysCurrentYear) - 1) *
        100
      ).toFixed(2)
    : 0;
  const [stakedOnly, setStakeOnly] = useState(false);
  const [syrupSearch, setSyrupSearch] = useState('');
  const [syrupSearchInput, setSyrupSearchInput] = useDebouncedChangeHandler(
    syrupSearch,
    setSyrupSearch,
  );

  const addedStakingSyrupInfos = useSyrupInfo(
    null,
    isEndedSyrup ? 0 : undefined,
    isEndedSyrup ? 0 : undefined,
    { search: syrupSearch, isStaked: stakedOnly },
  );
  const addedOldSyrupInfos = useOldSyrupInfo(
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
      const tokenAPRA =
        a.valueOfTotalStakedAmountInUSDC && a.valueOfTotalStakedAmountInUSDC > 0
          ? ((a.rewards ?? 0) / a.valueOfTotalStakedAmountInUSDC) *
            daysCurrentYear *
            100
          : 0;

      const tokenAPRB =
        b.valueOfTotalStakedAmountInUSDC && b.valueOfTotalStakedAmountInUSDC > 0
          ? ((b.rewards ?? 0) / b.valueOfTotalStakedAmountInUSDC) *
            daysCurrentYear *
            100
          : 0;

      return (tokenAPRA > tokenAPRB ? -1 : 1) * sortIndex;
    },
    [sortIndex, daysCurrentYear],
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
    setPageIndex(0);
    setSyrupInfos(sortedSyrupInfos.slice(0, LOADSYRUP_COUNT));
    return () => setSyrupInfos(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEndedSyrup, syrupSearch, syrupRewardAddress]);

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

  return (
    <Box width='100%' mb={3}>
      {openStakeModal && (
        <StakeQuickModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
        />
      )}
      {openUnstakeModal && (
        <UnstakeQuickModal
          open={openUnstakeModal}
          onClose={() => setOpenUnstakeModal(false)}
        />
      )}
      <Box
        mb={4}
        display='flex'
        alignItems='flex-start'
        justifyContent='space-between'
        width='100%'
      >
        <Box>
          <Typography variant='h4'>Dragons Lair</Typography>
          <Typography variant='body1'>
            Stake your QUICK here to earn more!
          </Typography>
        </Box>
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>Help</Typography>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={4}>
          <Box className={classes.dragonWrapper}>
            <Box className={classes.dragonBg}>
              <img src={DragonBg2} alt='Dragon Lair' />
            </Box>
            <img
              src={DragonLairMask}
              alt='Dragon Mask'
              style={{ width: '100%', position: 'absolute', top: 207 }}
            />
            <Box className={classes.stepWrapper}>
              <Typography variant='caption'>STEP 1:</Typography>
            </Box>
            <Box className={classes.dragonTitle}>
              <Typography variant='h5'>Dragons Lair</Typography>
              <Typography variant='body2'>
                Stake QUICK, Receive dQUICK as receipt representing your share
                of the pool.
              </Typography>
            </Box>
            <Box position='relative' zIndex={3}>
              <Box display='flex'>
                <CurrencyLogo
                  currency={returnTokenFromKey('QUICK')}
                  size='32px'
                />
                <Box ml={1.5}>
                  <Typography
                    variant='body2'
                    style={{ color: palette.text.primary, lineHeight: 1 }}
                  >
                    QUICK
                  </Typography>
                  <Typography
                    variant='caption'
                    style={{ color: palette.text.hint }}
                  >
                    Single Stake — Auto compounding
                  </Typography>
                </Box>
              </Box>
              <Box display='flex' justifyContent='space-between' mt={1.5}>
                <Typography variant='body2'>Total QUICK</Typography>
                <Typography variant='body2'>
                  {lairInfo
                    ? lairInfo.totalQuickBalance.toFixed(2, {
                        groupSeparator: ',',
                      })
                    : 0}
                </Typography>
              </Box>
              <Box display='flex' justifyContent='space-between' mt={1.5}>
                <Typography variant='body2'>TVL:</Typography>
                <Typography variant='body2'>
                  $
                  {(
                    Number(lairInfo.totalQuickBalance.toSignificant()) *
                    Number(lairInfo.quickPrice)
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box display='flex' justifyContent='space-between' mt={1.5}>
                <Typography variant='body2'>APY</Typography>
                <Typography
                  variant='body2'
                  style={{ color: palette.success.main }}
                >
                  {APY}%
                </Typography>
              </Box>
              <Box display='flex' justifyContent='space-between' mt={1.5}>
                <Typography variant='body2'>Your Deposits</Typography>
                <Typography variant='body2'>
                  {formatNumber(Number(lairInfo.QUICKBalance.toSignificant()))}
                </Typography>
              </Box>
              <Box
                mt={2.5}
                width={1}
                height='40px'
                display='flex'
                alignItems='center'
                justifyContent='center'
                borderRadius={10}
                border={`1px solid ${palette.secondary.light}`}
              >
                <CurrencyLogo currency={returnTokenFromKey('QUICK')} />
                <Typography variant='body2' style={{ margin: '0 8px' }}>
                  {isQUICKRate ? 1 : lairInfo.dQUICKtoQUICK.toSignificant(4)}{' '}
                  QUICK =
                </Typography>
                <CurrencyLogo currency={returnTokenFromKey('QUICK')} />
                <Typography variant='body2' style={{ margin: '0 8px' }}>
                  {isQUICKRate ? lairInfo.QUICKtodQUICK.toSignificant(4) : 1}{' '}
                  dQUICK
                </Typography>
                <PriceExchangeIcon
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsQUICKRate(!isQUICKRate)}
                />
              </Box>
              <Box
                className={classes.stakeButton}
                bgcolor={palette.secondary.light}
                onClick={() => setOpenUnstakeModal(true)}
              >
                <Typography variant='body2'>- Unstake dQUICK</Typography>
              </Box>
              <Box
                className={classes.stakeButton}
                style={{
                  backgroundImage: 'linear-gradient(279deg, #004ce6, #3d71ff)',
                }}
                onClick={() => setOpenStakeModal(true)}
              >
                <Typography variant='body2'>Stake QUICK</Typography>
              </Box>
              <Box mt={3} textAlign='center'>
                <Typography
                  variant='caption'
                  style={{ color: palette.text.secondary, fontWeight: 500 }}
                >
                  ⭐️ When you unstake, the contract will automatically claim
                  QUICK on your behalf.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={8}>
          <Box className={classes.dragonWrapper}>
            <Box className={classes.dragonBg}>
              <img src={isMobile ? DragonBg2 : DragonBg1} alt='Dragon Syrup' />
            </Box>
            <Box className={classes.stepWrapper}>
              <Typography variant='caption'>STEP 2:</Typography>
            </Box>
            <Box className={classes.dragonTitle}>
              <Typography variant='h5'>Dragons Syrup</Typography>
              <Typography variant='body2'>
                Stake dQUICK, Earn tokens of your choice over time.
              </Typography>
            </Box>
            <Box display='flex' flexWrap='wrap' alignItems='center' mb={3.5}>
              <Box className={classes.searchInput} mr={2} my={isMobile ? 2 : 0}>
                <SearchIcon />
                <input
                  placeholder='Search name, symbol or paste address'
                  value={syrupSearchInput}
                  onChange={(evt: any) => setSyrupSearchInput(evt.target.value)}
                />
              </Box>
              <Box display='flex' flexWrap='wrap' alignItems='center'>
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
              syrupInfos.map((syrup, ind) => (
                <SyrupCard key={ind} syrup={syrup} />
              ))
            ) : (
              <Skeleton width='100%' height={80} />
            )}
          </Box>
        </Grid>
      </Grid>
      <div ref={loadMoreRef} />
    </Box>
  );
};

export default DragonPage;
