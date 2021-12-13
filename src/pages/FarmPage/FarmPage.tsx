import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
import {
  useStakingInfo,
  useLairInfo,
  StakingInfo,
  STAKING_REWARDS_INFO,
} from 'state/stake/hooks';
import { FarmCard, ToggleSwitch } from 'components';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import ArrowUpIcon from 'assets/images/arrowup.svg';
import { useInfiniteLoading } from 'utils/useInfiniteLoading';
import { useActiveWeb3React } from 'hooks';

const useStyles = makeStyles(({ breakpoints }) => ({
  helpWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    border: '1px solid #252833',
    borderRadius: 10,
    '& p': {
      color: '#636780',
    },
    '& svg': {
      marginLeft: 8,
    },
  },
  dragonWrapper: {
    width: '100%',
    backgroundColor: '#1b1e29',
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
  stepWrapper: {
    width: 80,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121319',
    '& span': {
      fontWeight: 'bold',
      color: '#b6b9cc',
    },
  },
  dragonTitle: {
    margin: '24px 0 64px',
    '& h5': {
      marginBottom: 16,
      color: '#c7cad9',
    },
    '& p': {
      maxWidth: 280,
      color: '#c7cad9',
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
  },
  searchInput: {
    height: 50,
    background: '#121319',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    '& input': {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      marginLeft: 8,
      fontSize: 14,
      fontWeight: 500,
      color: '#c7cad9',
      flex: 1,
    },
  },
  thirdColor: {
    color: '#448aff',
    cursor: 'pointer',
  },
}));

const FarmPage: React.FC = () => {
  const classes = useStyles();
  const { breakpoints } = useTheme();
  const { chainId } = useActiveWeb3React();
  const lairInfo = useLairInfo();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [pageIndex, setPageIndex] = useState(0);
  const [stakingInfos, setStakingInfos] = useState<StakingInfo[]>([]);

  const addedStakingInfos = useStakingInfo(
    null,
    pageIndex * 6 - 6,
    pageIndex * 6,
  );

  const stakingRewardAddress = addedStakingInfos
    .map((stakingInfo) => stakingInfo.stakingRewardAddress.toLowerCase())
    .reduce((totStr, str) => totStr + str, '');

  const lastStakingAddress =
    stakingInfos[stakingInfos.length - 1]?.stakingRewardAddress;

  useEffect(() => {
    setStakingInfos(stakingInfos.concat(addedStakingInfos));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingRewardAddress]);

  const [stakedOnly, setStakeOnly] = useState(false);
  const [farmSearch, setFarmSearch] = useState('');

  const filteredStakingInfos = useMemo(() => {
    if (stakingInfos && stakingInfos.length > 0) {
      return stakingInfos.filter((stakingInfo) => {
        return (
          (stakedOnly
            ? Boolean(stakingInfo.stakedAmount.greaterThan('0'))
            : true) &&
          ((stakingInfo.tokens[0].symbol ?? '')
            .toLowerCase()
            .indexOf(farmSearch) > -1 ||
            (stakingInfo.tokens[0].name ?? '')
              .toLowerCase()
              .indexOf(farmSearch) > -1 ||
            (stakingInfo.tokens[0].address ?? '')
              .toLowerCase()
              .indexOf(farmSearch) > -1 ||
            (stakingInfo.tokens[1].symbol ?? '')
              .toLowerCase()
              .indexOf(farmSearch) > -1 ||
            (stakingInfo.tokens[1].name ?? '')
              .toLowerCase()
              .indexOf(farmSearch) > -1 ||
            (stakingInfo.tokens[1].address ?? '')
              .toLowerCase()
              .indexOf(farmSearch) > -1)
        );
      });
    }
    return [];
  }, [stakingInfos, stakedOnly, farmSearch]);

  const loadNext = () => {
    if (chainId && STAKING_REWARDS_INFO[chainId]) {
      if (
        stakingInfos.length < (STAKING_REWARDS_INFO[chainId]?.length ?? 0) &&
        pageIndex * 6 > stakingInfos.length
      ) {
        setPageIndex(stakingInfos.length / 6);
      }
      if (
        !lastStakingAddress ||
        (STAKING_REWARDS_INFO[chainId]?.[pageIndex * 6 - 1] &&
          lastStakingAddress ===
            STAKING_REWARDS_INFO[chainId]?.[pageIndex * 6 - 1]
              .stakingRewardAddress)
      ) {
        setPageIndex(pageIndex + 1);
      }
    }
  };

  const { loadMoreRef } = useInfiniteLoading(loadNext);

  return (
    <Box width='100%' mb={3} id='farmPage'>
      <Box
        mb={4}
        display='flex'
        alignItems='flex-start'
        justifyContent='space-between'
        width='100%'
      >
        <Box mr={2}>
          <Typography variant='h4'>Farm</Typography>
          <Typography variant='body1'>
            Stake LP Tokens to Earn dQUICK + Pool Fees
          </Typography>
        </Box>
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>Help</Typography>
          <HelpIcon />
        </Box>
      </Box>
      <Box className={classes.dragonWrapper}>
        <Box display='flex' flexWrap='wrap' alignItems='center' mb={3.5}>
          <Box
            className={classes.searchInput}
            width={isMobile ? 1 : 'unset'}
            flex={1}
          >
            <SearchIcon />
            <input
              placeholder='Search name, symbol or paste address'
              value={farmSearch}
              onChange={(evt: any) => setFarmSearch(evt.target.value)}
            />
          </Box>
          <Box
            display='flex'
            alignItems='center'
            ml={isMobile ? 2 : 4}
            mt={isMobile ? 2 : 0}
          >
            <Typography
              variant='body2'
              style={{ color: '#626680', marginRight: 8 }}
            >
              Staked Only
            </Typography>
            <ToggleSwitch
              toggled={stakedOnly}
              onToggle={() => setStakeOnly(!stakedOnly)}
            />
          </Box>
        </Box>
        <Divider />
        {!isMobile && (
          <Box mt={2.5} display='flex' paddingX={2}>
            <Box width={0.3}>
              <Typography color='secondary' variant='body2'>
                Pool
              </Typography>
            </Box>
            <Box
              width={0.2}
              display='flex'
              flexDirection='row'
              alignItems='center'
              justifyContent='center'
            >
              <Typography color='secondary' variant='body2'>
                TVL
              </Typography>
              <Box ml={1} style={{ height: '23px' }}>
                <img src={ArrowUpIcon} alt={'arrow up'} />
              </Box>
            </Box>
            <Box
              width={0.25}
              display='flex'
              flexDirection='row'
              alignItems='center'
              justifyContent='center'
            >
              <Typography color='secondary' variant='body2'>
                Rewards
              </Typography>
              <Box ml={1} style={{ height: '23px' }}>
                <img src={ArrowUpIcon} alt={'arrow up'} />
              </Box>
            </Box>
            <Box
              width={0.15}
              display='flex'
              flexDirection='row'
              alignItems='center'
              justifyContent='center'
            >
              <Typography color='secondary' variant='body2'>
                APY
              </Typography>
              <Box ml={1} style={{ height: '23px' }}>
                <img src={ArrowUpIcon} alt={'arrow up'} />
              </Box>
            </Box>
            <Box
              width={0.2}
              display='flex'
              flexDirection='row'
              alignItems='center'
              justifyContent='flex-end'
              mr={2}
            >
              <Typography color='secondary' variant='body2'>
                Earned
              </Typography>
              <Box ml={1} style={{ height: '23px' }}>
                <img src={ArrowUpIcon} alt={'arrow up'} />
              </Box>
            </Box>
          </Box>
        )}
        {stakingInfos &&
          filteredStakingInfos.map((info: any, index) => (
            <FarmCard
              key={index}
              dQuicktoQuick={Number(lairInfo.dQUICKtoQUICK.toSignificant())}
              stakingInfo={info}
            />
          ))}
      </Box>
      <div ref={loadMoreRef} />
    </Box>
  );
};

export default FarmPage;
