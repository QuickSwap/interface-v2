import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Grid,
  useMediaQuery,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import Motif from 'assets/images/Motif.svg';
import BuyWithFiat from 'assets/images/featured/BuywithFiat.svg';
import Analytics from 'assets/images/featured/Analytics.svg';
import DragonsLair from 'assets/images/featured/DragonsLair.svg';
import ProvideLiquidity from 'assets/images/featured/ProvideLiquidity.svg';
import Rewards from 'assets/images/featured/Rewards.svg';
import FeaturedSwap from 'assets/images/featured/Swap.svg';
import { ReactComponent as CoingeckoIcon } from 'assets/images/social/Coingecko.svg';
import { ReactComponent as DiscordIcon } from 'assets/images/social/Discord.svg';
import { ReactComponent as MediumIcon } from 'assets/images/social/Medium.svg';
import { ReactComponent as RedditIcon } from 'assets/images/social/Reddit.svg';
import { ReactComponent as TelegramIcon } from 'assets/images/social/Telegram.svg';
import { ReactComponent as TwitterIcon } from 'assets/images/social/Twitter.svg';
import { ReactComponent as YouTubeIcon } from 'assets/images/social/YouTube.svg';
import { RewardSlider, TopMovers } from 'components';
import { getEthPrice, getGlobalData } from 'utils';
import { useGlobalData } from 'state/application/hooks';
import { HeroSection } from './HeroSection';
import { TradingInfo } from './TradingInfo';
import { SwapSection } from './SwapSection';
import { BuyFiatSection } from './BuyFiatSection';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  tradingInfo: {
    width: '100%',
    position: 'relative',
    zIndex: 2,
    justifyContent: 'center',
    [breakpoints.down('md')]: {
      flexWrap: 'wrap',
    },
  },
  quickInfo: {
    textAlign: 'center',
    margin: '128px auto 30px',
    width: '100%',
    maxWidth: 800,
    '& h2': {
      marginBottom: 60,
    },
  },
  rewardsContainer: {
    textAlign: 'center',
    margin: '172px 0 100px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [breakpoints.down('xs')]: {
      margin: '32px 0 64px',
    },
  },
  buyFiatContainer: {
    background: palette.background.paper,
    height: 338,
    borderRadius: 48,
    marginBottom: 160,
    overflow: 'hidden',
    position: 'relative',
    [breakpoints.down('sm')]: {
      height: 'auto',
    },
    [breakpoints.down('xs')]: {
      marginBottom: 80,
    },
    '& > img': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1248,
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 80,
      height: '100%',
      position: 'relative',
      zIndex: 2,
      [breakpoints.down('sm')]: {
        flexDirection: 'column',
        padding: 0,
      },
    },
    '& .buyFiatInfo': {
      display: 'flex',
      width: '50%',
      alignItems: 'center',
      position: 'relative',
      '& img': {
        width: 200,
        maxWidth: 320,
      },
      '& > div': {
        width: 'calc(100% - 200px)',
        '& > h3': {
          marginBottom: 12,
        },
      },
      [breakpoints.down('sm')]: {
        width: '100%',
      },
      [breakpoints.down('xs')]: {
        flexDirection: 'column',
        '& img, & > div': {
          width: '100%',
        },
        '& img': {
          margin: '-32px 0',
        },
        '& div': {
          padding: '0 20px 20px',
        },
      },
    },
    '& .buyFiatWrapper': {
      width: 408,
      [breakpoints.down('sm')]: {
        width: 'calc(100% - 64px)',
        marginBottom: 32,
      },
      [breakpoints.down('xs')]: {
        width: 'calc(100% - 40px)',
      },
      '& .buyContent': {
        background: palette.background.default,
        borderRadius: 20,
        padding: 24,
        '& > div': {
          padding: 0,
          border: 'none',
          background: 'transparent',
          '& > p': {
            marginBottom: 8,
          },
        },
      },
      '& > button': {
        height: 56,
        marginTop: 20,
      },
    },
  },
  featureHeading: {
    margin: 'auto',
    textAlign: 'center',
    '& h3': {
      color: 'rgba(255, 255, 255, 0.87)',
      marginBottom: 32,
    },
  },
  featureDivider: {
    width: 32,
    height: 2,
    background: palette.success.dark,
    margin: 'auto',
  },
  featureContainer: {
    '& > div.MuiGrid-root': {
      marginTop: 32,
      '& > div': {
        '& img': {
          width: 150,
          maxWidth: 240,
        },
        '& > div': {
          width: 'calc(100% - 270px)',
        },
        [breakpoints.down('xs')]: {
          flexDirection: 'column',
          '& img, & > div': {
            width: '100%',
            textAlign: 'center',
          },
        },
      },
    },
    '& .featureText': {
      marginLeft: 8,
      '& h3': {
        color: 'white',
        marginBottom: 8,
      },
    },
  },
  communityContainer: {
    margin: '100px 0',
    '& .socialContent': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 48,
      '& > div': {
        margin: 16,
        textAlign: 'center',
        width: 120,
        '& a': {
          textDecoration: 'none',
          color: palette.text.primary,
          '&:hover': {
            color: 'white',
            '& svg path': {
              fill: 'white',
            },
          },
        },
        '& svg': {
          width: 64,
          height: 64,
          '& path': {
            fill: palette.text.primary,
          },
        },
      },
    },
  },
  smallCommunityContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    height: 56,
    position: 'fixed',
    bottom: 0,
    right: 0,
    borderTopLeftRadius: 24,
    background: 'rgb(27, 32, 43, 0.9)',
    backdropFilter: 'blur(30px)',
    zIndex: 10,
    '& svg': {
      width: 32,
      height: 32,
      cursor: 'pointer',
      '&:hover path': {
        fill: palette.text.primary,
      },
      '& path': {
        fill: palette.text.secondary,
      },
    },
    [breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

const LandingPage: React.FC = () => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));

  const features = [
    {
      img: FeaturedSwap,
      title: 'Swap Tokens',
      desc: 'Trade any combination of ERC-20 tokens permissionless, with ease.',
    },
    {
      img: ProvideLiquidity,
      title: 'Supply Liquidity',
      desc: 'Earn 0.25% fee on trades proportional to your share of the pool.',
    },
    {
      img: Rewards,
      title: 'Earn $QUICK',
      desc:
        'Deposit your LP Tokens to earn additional rewards in $QUICK Token.',
    },
    {
      img: DragonsLair,
      title: 'Dragon’s Lair',
      desc:
        'Dragon’s Lair is a single staking pool for QUICK token. Stake your QUICK to receive dQuick, and earn your share of .04% of all trading fees',
    },
    {
      img: BuyWithFiat,
      title: 'Buy Crypto with Fiat',
      desc:
        'Simple way to buy with Apple Pay, credit card, bank transfer & more.',
    },
    {
      img: Analytics,
      title: 'Analytics',
      desc: 'Scan through QuickSwap analytics & Historical Data.',
    },
  ];

  const socialicons = [
    {
      link: 'https://www.reddit.com/r/QuickSwap/',
      icon: <RedditIcon />,
      title: 'Reddit',
    },
    {
      link: 'https://discord.com/invite/XJTM7FV88Y',
      icon: <DiscordIcon />,
      title: 'Discord',
    },
    {
      link: 'https://twitter.com/QuickswapDEX',
      icon: <TwitterIcon />,
      title: 'Twitter',
    },
    {
      link: 'https://quickswap-layer2.medium.com/',
      icon: <MediumIcon />,
      title: 'Medium',
    },
    {
      link: 'https://www.youtube.com/channel/UCrPlF-DBwD-UzLFDzJ4Z5Fw',
      icon: <YouTubeIcon />,
      title: 'Youtube',
    },
    {
      link: 'https://t.me/QuickSwapDEX',
      icon: <TelegramIcon />,
      title: 'Telegram',
    },
    {
      link: 'https://www.coingecko.com/en/exchanges/quickswap',
      icon: <CoingeckoIcon />,
      title: 'CoinGecko',
    },
  ];

  const history = useHistory();
  const { globalData, updateGlobalData } = useGlobalData();

  useEffect(() => {
    async function fetchGlobalData() {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const newGlobalData = await getGlobalData(newPrice, oneDayPrice);
      if (newGlobalData) {
        updateGlobalData({ data: newGlobalData });
      }
    }
    fetchGlobalData();
  }, [updateGlobalData]);

  return (
    <div id='landing-page' style={{ width: '100%' }}>
      <Box margin={mobileWindowSize ? '64px 0' : '100px 0 80px'}>
        <HeroSection globalData={globalData} />
      </Box>
      <Box className={classes.tradingInfo} display='flex'>
        <TradingInfo globalData={globalData} />
      </Box>
      <Box className={classes.smallCommunityContainer}>
        {socialicons.map((val, ind) => (
          <a href={val.link} target='_blank' key={ind} rel='noreferrer'>
            <Box display='flex' mx={1.5}>
              {val.icon}
            </Box>
          </a>
        ))}
      </Box>
      <Box mt={2} width={1}>
        <TopMovers background={palette.background.paper} />
      </Box>
      <Box className={classes.quickInfo}>
        <Typography style={{ fontSize: '24px' }}>
          QuickSwap is a next-generation layer-2 decentralized exchange and
          Automated Market Maker.
        </Typography>
        <img src={Motif} alt='Motif' />
      </Box>
      <SwapSection />
      <Box className={classes.rewardsContainer}>
        <Box maxWidth='480px' width='100%'>
          <Typography variant='h4'>
            Earn additional rewards by depositing your LP tokens
          </Typography>
          <Typography style={{ marginTop: '20px' }}>
            Deposit your Liquidity Provider tokens to receive rewards in
            addition to LP fees.
          </Typography>
        </Box>
        <RewardSlider />
        <Box
          bgcolor={palette.secondary.dark}
          color={palette.text.primary}
          width={194}
          height={48}
          display='flex'
          alignItems='center'
          justifyContent='center'
          borderRadius={24}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            history.push('/farm');
          }}
        >
          <Typography variant='body1'>See all pairs</Typography>
        </Box>
      </Box>
      <BuyFiatSection />
      <Box className={classes.featureContainer}>
        <Box className={classes.featureHeading}>
          <Typography variant='h3'>Features</Typography>
          <Box className={classes.featureDivider} />
        </Box>
        <Grid container spacing={4}>
          {features.map((val, index) => (
            <Grid item container alignItems='center' sm={12} md={6} key={index}>
              <img src={val.img} alt={val.title} />
              <Box className='featureText'>
                <Typography variant='h5'>{val.title}</Typography>
                <Typography variant='body1'>{val.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box className={classes.communityContainer}>
        <Box className={classes.featureHeading}>
          <Typography variant='h3'>Join our ever-growing Community</Typography>
          <Box className={classes.featureDivider} />
        </Box>
        <Box className='socialContent'>
          {socialicons.map((val, ind) => (
            <Box key={ind}>
              <a href={val.link} target='_blank' rel='noreferrer'>
                {val.icon}
                <Typography>{val.title}</Typography>
              </a>
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default LandingPage;
