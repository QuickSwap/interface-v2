import React, { useState, useMemo, useEffect } from 'react';
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
  SYRUP_REWARDS_INFO,
  OLD_SYRUP_REWARDS_INFO,
} from 'state/stake/hooks';
import { QUICK } from 'constants/index';
import {
  CurrencyLogo,
  SyrupCard,
  ToggleSwitch,
  StakeQuickModal,
  UnstakeQuickModal,
} from 'components';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import DragonBg1 from 'assets/images/DragonBg1.svg';
import DragonBg2 from 'assets/images/DragonBg2.svg';
import DragonLairMask from 'assets/images/DragonLairMask.svg';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
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

const DragonPage: React.FC = () => {
  const classes = useStyles();
  const { chainId } = useActiveWeb3React();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [isQUICKRate, setIsQUICKRate] = useState(false);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const [openUnstakeModal, setOpenUnstakeModal] = useState(false);
  const [isEndedSyrup, setIsEndedSyrup] = useState(false);
  const lairInfo = useLairInfo();
  const [syrupInfos, setSyrupInfos] = useState<SyrupInfo[]>([]);
  const [sortBy, setSortBy] = useState(0);
  const [sortDesc, setSortDesc] = useState(false);
  const [syrupOldInfos, setSyrupOldInfos] = useState<SyrupInfo[]>([]);
  const APR =
    (((Number(lairInfo?.oneDayVol) * 0.04 * 0.01) /
      Number(lairInfo?.dQuickTotalSupply.toSignificant(6))) *
      365) /
    (Number(lairInfo?.dQUICKtoQUICK.toSignificant()) *
      Number(lairInfo?.quickPrice));
  const APY = APR ? ((Math.pow(1 + APR / 365, 365) - 1) * 100).toFixed(2) : 0;
  const [stakedOnly, setStakeOnly] = useState(false);
  const [syrupSearch, setSyrupSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageOldIndex, setPageOldIndex] = useState(0);

  const addedSyrupInfos = useSyrupInfo(
    null,
    isEndedSyrup ? 0 : pageIndex * 5 - 5,
    isEndedSyrup ? 0 : pageIndex * 5,
  );
  const addedOldSyrupInfos = useOldSyrupInfo(
    null,
    isEndedSyrup ? pageOldIndex * 5 - 5 : 0,
    isEndedSyrup ? pageOldIndex * 5 : 0,
  );

  const syrupRewardAddress = addedSyrupInfos
    .map((syrupInfo) => syrupInfo.stakingRewardAddress.toLowerCase())
    .reduce((totStr, str) => totStr + str, '');

  const syrupRewardOldAddress = addedOldSyrupInfos
    .map((syrupInfo) => syrupInfo.stakingRewardAddress.toLowerCase())
    .reduce((totStr, str) => totStr + str, '');

  const lastSyrupAddress =
    syrupInfos[syrupInfos.length - 1]?.stakingRewardAddress;

  const lastOldSyrupAddress =
    syrupOldInfos[syrupOldInfos.length - 1]?.stakingRewardAddress;

  useEffect(() => {
    setSyrupInfos(
      syrupInfos
        .concat(addedSyrupInfos)
        .filter(
          (val, ind, self) =>
            ind ===
            self.findIndex(
              (item) => item.stakingRewardAddress === val.stakingRewardAddress,
            ),
        ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syrupRewardAddress]);

  useEffect(() => {
    setSyrupOldInfos(
      syrupOldInfos
        .concat(addedOldSyrupInfos)
        .filter(
          (val, ind, self) =>
            ind ===
            self.findIndex(
              (item) => item.stakingRewardAddress === val.stakingRewardAddress,
            ),
        ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syrupRewardOldAddress]);

  const filteredSyrupInfos = useMemo(() => {
    const syrupListInfos = isEndedSyrup ? syrupOldInfos : syrupInfos;
    if (syrupListInfos && syrupListInfos.length > 0) {
      return syrupListInfos
        .filter((syrupInfo) => {
          return (
            (stakedOnly
              ? Boolean(syrupInfo.stakedAmount.greaterThan('0'))
              : true) &&
            ((syrupInfo.token.symbol ?? '')
              .toLowerCase()
              .indexOf(syrupSearch.toLowerCase()) > -1 ||
              (syrupInfo.token.name ?? '')
                .toLowerCase()
                .indexOf(syrupSearch.toLowerCase()) > -1 ||
              (syrupInfo.token.address ?? '')
                .toLowerCase()
                .indexOf(syrupSearch.toLowerCase()) > -1)
          );
        })
        .sort((a, b) => {
          if (sortBy === 1) {
            const syrupStrA = a.token.symbol ?? '';
            const syrupStrB = b.token.symbol ?? '';
            if (sortDesc) {
              return syrupStrA > syrupStrB ? -1 : 1;
            } else {
              return syrupStrA < syrupStrB ? -1 : 1;
            }
          } else if (sortBy === 2) {
            const depositA =
              a.valueOfTotalStakedAmountInUSDC ??
              Number(a.totalStakedAmount.toSignificant());
            const depositB =
              b.valueOfTotalStakedAmountInUSDC ??
              Number(b.totalStakedAmount.toSignificant());
            if (sortDesc) {
              return depositA > depositB ? -1 : 1;
            } else {
              return depositA < depositB ? -1 : 1;
            }
          } else if (sortBy === 3) {
            const tokenAPRA =
              a.valueOfTotalStakedAmountInUSDC > 0
                ? ((a.rewards ?? 0) / a.valueOfTotalStakedAmountInUSDC) *
                  365 *
                  100
                : 0;

            const tokenAPRB =
              b.valueOfTotalStakedAmountInUSDC > 0
                ? ((b.rewards ?? 0) / b.valueOfTotalStakedAmountInUSDC) *
                  365 *
                  100
                : 0;
            if (sortDesc) {
              return tokenAPRA > tokenAPRB ? -1 : 1;
            } else {
              return tokenAPRA < tokenAPRB ? -1 : 1;
            }
          } else if (sortBy === 4) {
            const earnedUSDA =
              Number(a.earnedAmount.toSignificant()) *
              Number(a.rewardTokenPriceinUSD ?? 0);
            const earnedUSDB =
              Number(b.earnedAmount.toSignificant()) *
              Number(b.rewardTokenPriceinUSD ?? 0);
            if (sortDesc) {
              return earnedUSDA > earnedUSDB ? -1 : 1;
            } else {
              return earnedUSDA < earnedUSDB ? -1 : 1;
            }
          }
          return 1;
        });
    } else {
      return [];
    }
  }, [
    syrupInfos,
    stakedOnly,
    syrupSearch,
    isEndedSyrup,
    syrupOldInfos,
    sortDesc,
    sortBy,
  ]);

  const loadNext = () => {
    const REWARDS_INFO = isEndedSyrup
      ? OLD_SYRUP_REWARDS_INFO
      : SYRUP_REWARDS_INFO;
    const syrupPageIndex = isEndedSyrup ? pageOldIndex : pageIndex;
    const syrupListInfos = isEndedSyrup ? syrupOldInfos : syrupInfos;
    const lastAddress = isEndedSyrup ? lastOldSyrupAddress : lastSyrupAddress;
    if (chainId && REWARDS_INFO[chainId]) {
      if (
        syrupListInfos.length < (REWARDS_INFO[chainId]?.length ?? 0) &&
        syrupPageIndex * 5 > syrupListInfos.length
      ) {
        if (isEndedSyrup) {
          setPageOldIndex(syrupListInfos.length / 5 + 1);
        } else {
          setPageIndex(syrupListInfos.length / 5 + 1);
        }
      }
      if (
        !lastAddress ||
        (REWARDS_INFO[chainId]?.[syrupPageIndex * 5 - 1] &&
          lastAddress ===
            REWARDS_INFO[chainId]?.[syrupPageIndex * 5 - 1]
              .stakingRewardAddress)
      ) {
        if (isEndedSyrup) {
          setPageOldIndex(pageOldIndex + 1);
        } else {
          setPageIndex(pageIndex + 1);
        }
      }
    }
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
                <CurrencyLogo currency={QUICK} size='32px' />
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
                  {lairInfo.dQUICKBalance.toSignificant(4)}
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
                <CurrencyLogo currency={QUICK} />
                <Typography variant='body2' style={{ margin: '0 8px' }}>
                  {isQUICKRate ? 1 : lairInfo.dQUICKtoQUICK.toSignificant(4)}{' '}
                  QUICK =
                </Typography>
                <CurrencyLogo currency={QUICK} />
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
                <Typography variant='body2'>- Unstake QUICK</Typography>
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
                  value={syrupSearch}
                  onChange={(evt: any) => setSyrupSearch(evt.target.value)}
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
                      if (sortBy === 1) {
                        setSortDesc(!sortDesc);
                      } else {
                        setSortBy(1);
                        setSortDesc(false);
                      }
                    }}
                    color={
                      sortBy === 1
                        ? palette.text.primary
                        : palette.secondary.main
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <Typography variant='body2'>Earn</Typography>
                    <Box display='flex' ml={0.5}>
                      {sortBy === 1 && sortDesc ? (
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
                      if (sortBy === 2) {
                        setSortDesc(!sortDesc);
                      } else {
                        setSortBy(2);
                        setSortDesc(false);
                      }
                    }}
                    color={
                      sortBy === 2
                        ? palette.text.primary
                        : palette.secondary.main
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <Typography variant='body2'>dQUICK Deposits</Typography>
                    <Box display='flex' ml={0.5}>
                      {sortBy === 2 && sortDesc ? (
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
                      if (sortBy === 3) {
                        setSortDesc(!sortDesc);
                      } else {
                        setSortBy(3);
                        setSortDesc(false);
                      }
                    }}
                    color={
                      sortBy === 3
                        ? palette.text.primary
                        : palette.secondary.main
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <Typography variant='body2'>APR</Typography>
                    <Box display='flex' ml={0.5}>
                      {sortBy === 3 && sortDesc ? (
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
                      if (sortBy === 4) {
                        setSortDesc(!sortDesc);
                      } else {
                        setSortBy(4);
                        setSortDesc(false);
                      }
                    }}
                    color={
                      sortBy === 4
                        ? palette.text.primary
                        : palette.secondary.main
                    }
                    justifyContent='flex-end'
                    style={{ cursor: 'pointer' }}
                  >
                    <Typography variant='body2'>Earned</Typography>
                    <Box display='flex' ml={0.5}>
                      {sortBy === 4 && sortDesc ? (
                        <ArrowDown size={20} />
                      ) : (
                        <ArrowUp size={20} />
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
            {syrupInfos &&
              filteredSyrupInfos.map((syrup, ind) => (
                <SyrupCard key={ind} syrup={syrup} />
              ))}
          </Box>
        </Grid>
      </Grid>
      <div ref={loadMoreRef} />
    </Box>
  );
};

export default DragonPage;
