import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  ButtonGroup,
  Typography,
  Button,
  Box,
  Grid,
  useMediaQuery
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Slider from "react-slick";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import HeroBkg from 'assets/images/heroBkg.svg';
import Motif from 'assets/images/Motif.svg';
import { ReactComponent as PolygonSwapIcon } from 'assets/images/Currency/PolygonSwap.svg';
import { ReactComponent as USDCIcon } from 'assets/images/Currency/USDC.svg';
import { ReactComponent as QuickIcon } from 'assets/images/quickIcon.svg';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon.svg';
import BuyWithFiat from 'assets/images/featured/BuywithFiat.svg';
import Analytics from 'assets/images/featured/Analytics.svg';
import DragonsLair from 'assets/images/featured/DragonsLair.svg';
import ProvideLiquidity from 'assets/images/featured/ProvideLiquidity.svg';
import Rewards from 'assets/images/featured/Rewards.svg';
import FeaturedSwap from 'assets/images/featured/Swap.svg';
import FiatMask from 'assets/images/FiatMask.svg';
import { ReactComponent as CoingeckoIcon } from 'assets/images/social/Coingecko.svg';
import { ReactComponent as DiscordIcon } from 'assets/images/social/Discord.svg';
import { ReactComponent as MediumIcon } from 'assets/images/social/Medium.svg';
import { ReactComponent as RedditIcon } from 'assets/images/social/Reddit.svg';
import { ReactComponent as TelegramIcon } from 'assets/images/social/Telegram.svg';
import { ReactComponent as TwitterIcon } from 'assets/images/social/Twitter.svg';
import { ReactComponent as YouTubeIcon } from 'assets/images/social/YouTube.svg';
import { Swap } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  landingPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& h3': {
      color: palette.success.dark,
      fontSize: 26,
      fontWeight: 'bold'
    },
    '& p': {
      fontSize: 18,
      lineHeight: '32px',
      color: palette.text.primary
    }
  },
  heroBkg: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    width: '100%',
    overflow: 'hidden',
    '& img': {
      width: '100%',
      minWidth: 1200
    }
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '135px 0 120px',
    position: 'relative',
    zIndex: 2,
    '& h3': {
      color: 'white',
      fontSize: 16,
      textTransform: 'uppercase',
      fontWeight: 'bold',
      lineHeight: '18px',
    },
    '& h1': {
      fontSize: 64,
      fontWeight: 'bold',
      color: palette.primary.main,
      lineHeight: '72px',
      margin: '20px 0',
    },
    '& > p': {
      fontSize: 18,
      lineHeight: '20px',
      marginBottom: 50
    },
    '& > button': {
      height: 56,
      width: 194,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    [breakpoints.down('xs')]: {
      margin: '64px 0',
      '& h1': {
        fontSize: 48
      }
    },
  },
  tradingInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: '0 96px',
    position: 'relative',
    zIndex: 2,
    '& div': {
      background: palette.background.default,
      width: 288,
      height: 133,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      '& p': {
        fontSize: 13,
        lineHeight: '14px',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      },
      '& h1': {
        fontSize: 40,
        fontWeight: 'bold',
        lineHeight: '45px',
        marginTop: 24
      }
    }
  },
  quickInfo: {
    textAlign: 'center',
    margin: '128px 0 60px',
    '& h2': {
      fontSize: 26,
      lineHeight: '42px',
      marginBottom: 60
    }
  },
  swapContainer: {
    textAlign: 'center',
    padding: '20px 32px',
    maxWidth: 1048,
    margin: 'auto',
    width: '100%',
    '& .MuiButtonGroup-root': {
      marginBottom: 50,
      '& button': {
        width: 180,
        height: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        border: `1px solid ${palette.primary.dark}`,
        color: 'white',
        '&.active': {
          background: '#FFFFFFDE',
          border: `1px solid transparent`,
          color: palette.background.default
        },
        '&:first-child': {
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
        },
        '&:last-child': {
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        }
      }
    },
    [breakpoints.down('xs')]: {
      padding: 20,
      '& .MuiGrid-item': {
        width: '100%',
        marginBottom: 32,
        textAlign: 'center'
      }
    }
  },
  currencyButton: {
    height: 40,
    minWidth: 121,
    display: 'flex',
    alignItems: 'center',
    padding: '0 6px',
    borderRadius: 20,
    background: palette.primary.dark,
    '& svg:first-child': {
      width: 28,
      height: 28,
      marginRight: 8
    },
    '& p': {
      fontFamily: "'Mulish', sans-serif",
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  swapInfo: {
    textAlign: 'left',
    marginBottom: 60,
    '& h3': {
      marginBottom: 16,
    },
  },
  rewardsContainer: {
    textAlign: 'center',
    margin: '172px 32px',
    '& h3': {
      marginBottom: 24
    },
    '& > button': {
      width: 194,
      height: 48,
      fontSize: 16,
      borderRadius: 50
    },
    [breakpoints.down('xs')]: {
      margin: '32px 20px 64px'
    }
  },
  rewardsSlider: {
    width: 1072,
    display: 'flex',
    justifyContent: 'space-between',
    margin: '64px auto 56px',
    '& .slick-slide': {
      padding: '0 20px'
    },
    '& .slick-arrow': {
      color: palette.success.dark,
      width: 32,
      height: 32,
    },
    [breakpoints.down('md')]: {
      width: 776
    },
    [breakpoints.down('sm')]: {
      width: 360,
    }
  },
  rewardsSliderItem: {
    borderRadius: 32,
    background: palette.primary.dark,
    padding: '32px 22px',
    position: 'relative',
    '& .rewardIcon': {
      position: 'absolute',
      display: 'flex',
      top: 32,
      left: 22,
      '& > div': {
        padding: 2,
        background: palette.primary.dark,
        borderRadius: 18,
        display: 'flex',
        '&:first-child': {
          marginRight: -8,
          position: 'relative',
          zIndex: 1
        }
      }
    },
    '& h3': {
      fontSize: 20,
      color: 'white',
      lineHeight: '36px',
      marginLeft: 10,
    },
    '& .row': {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      '& p': {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.47)',
        display: 'flex',
        alignItems: 'center',
        '& svg': {
          marginLeft: 4
        }
      },
      '& h4': {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold'
      },
      '& h5': {
        background: 'rgba(15, 198, 121, 0.12)',
        color: '#0FC679',
        fontWeight: 'bold',
        fontSize: 16,
        padding: '0 4px',
        borderRadius: 5,
      },
    },
    '& button': {
      height: 40,
      fontSize: 16,
      marginTop: 12
    }
  },
  buyFiatContainer: {
    background: palette.primary.dark,
    height: 338,
    maxWidth: 1248,
    borderRadius: 48,
    margin: '0 32px 160px',
    overflow: 'hidden',
    position: 'relative',
    [breakpoints.down('sm')]: {
      height: 'auto'
    },
    [breakpoints.down('xs')]: {
      margin: '0 32px 80px'
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
      padding: '0 80px 0 0px',
      height: '100%',
      position: 'relative',
      zIndex: 2,
      [breakpoints.down('sm')]: {
        flexDirection: 'column',
        padding: 0
      }
    },
    '& .buyFiatInfo': {
      display: 'flex',
      width: '50%',
      alignItems: 'center',
      position: 'relative',
      '& img': {
        width: 200,
      },
      '& > div': {
        width: 'calc(100% - 200px)',
        '& > h3': {
          marginBottom: 12,
        }
      },
      [breakpoints.down('sm')]: {
        width: '100%'
      },
      [breakpoints.down('xs')]: {
        flexDirection: 'column',
        '& img, & > div': {
          width: '100%',
        },
        '& img': {
          margin: '-32px 0'
        },
        '& div': {
          padding: '0 20px 20px'
        }
      }
    },
    '& .buyFiatWrapper': {
      width: 408,
      [breakpoints.down('sm')]: {
        width: 'calc(100% - 64px)',
        marginBottom: 32
      },
      [breakpoints.down('xs')]: {
        width: 'calc(100% - 40px)'
      },
      '& .buyContent': {
        background: palette.background.default,
        borderRadius: 20,
        padding: 24,
        '& > p': {
          fontFamily: "'Mulish', sans-serif",
          fontSize: 14,
          marginBottom: 8
        },
        '& h4': {
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      '& > button': {
        height: 56,
        marginTop: 20
      }
    }
  },
  featureHeading: {
    margin: 'auto',
    textAlign: 'center',
    '& h2': {
      color: 'rgba(255, 255, 255, 0.87)',
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 32,
    }
  },
  featureDivider: {
    width: 32,
    height: 2,
    background: palette.success.dark,
    margin: 'auto'
  },
  featureContainer: {
    maxWidth: 1248,
    margin: '0 32px',
    '& > div.MuiGrid-root': {
      marginTop: 32,
      '& > div': {
        '& img': {
          width: 200
        },
        '& > div': {
          width: 'calc(100% - 210px)'
        },
        [breakpoints.down('xs')]: {
          flexDirection: 'column',
          '& img, & > div': {
            width: '100%',
            textAlign: 'center'
          }
        }
      }
    },
    '& .featureText': {
      '& h3': {
        fontSize: 20,
        lineHeight: '30px',
        color: 'white',
        marginBottom: 8
      },
      '& p': {
        fontSize: 16,
        lineHeight: '28px',
        fontFamily: "'Mulish', sans-serif"
      }
    }
  },
  communityContainer: {
    margin: '100px 32px',
    '& .socialContent': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 48,
      '& > div': {
        margin: '16px 32px 16px 0',
        textAlign: 'center',
        width: 120,
        '& p': {
          fontSize: 16
        },
        '& a': {
          textDecoration: 'none'
        },
        '& svg': {
          width: 64,
          height: 64,
        },
        '&:last-child': {
          marginRight: 0
        }
      }
    }
  }
}));

const LandingPage: React.FC = () => {
  const classes = useStyles();
  const [swapIndex, setSwapIndex] = useState(0);
  const theme = useTheme();
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('md'));
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('sm'));

  const rewardSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: mobileWindowSize ? 1 : tabletWindowSize ? 2 : 3,
    slidesToScroll: 1,
    nextArrow: <ChevronRightIcon />,
    prevArrow: <ChevronLeftIcon />
  };
  const rewardItems = [
    {
      token1: {
        symbol: 'USDC',
        logo: <USDCIcon />
      },
      token2: {
        symbol: 'WMATIC',
        logo: <PolygonSwapIcon />
      },
      fee: 13225,
      locked: '97.42M',
      tvl: '120.42M',
      apr: 21.51
    },
    {
      token1: {
        symbol: 'USDC',
        logo: <USDCIcon />
      },
      token2: {
        symbol: 'WMATIC',
        logo: <PolygonSwapIcon />
      },      fee: 13225,
      locked: '97.42M',
      tvl: '120.42M',
      apr: 21.51
    },
    {
      token1: {
        symbol: 'USDC',
        logo: <USDCIcon />
      },
      token2: {
        symbol: 'WMATIC',
        logo: <PolygonSwapIcon />
      },
      fee: 13225,
      locked: '97.42M',
      tvl: '120.42M',
      apr: 21.51
    },
    {
      token1: {
        symbol: 'USDC',
        logo: <USDCIcon />
      },
      token2: {
        symbol: 'WMATIC',
        logo: <PolygonSwapIcon />
      },
      fee: 13225,
      locked: '97.42M',
      tvl: '120.42M',
      apr: 21.51
    },
    {
      token1: {
        symbol: 'USDC',
        logo: <USDCIcon />
      },
      token2: {
        symbol: 'WMATIC',
        logo: <PolygonSwapIcon />
      },
      fee: 13225,
      locked: '97.42M',
      tvl: '120.42M',
      apr: 21.51
    },
    {
      token1: {
        symbol: 'USDC',
        logo: <USDCIcon />
      },
      token2: {
        symbol: 'WMATIC',
        logo: <PolygonSwapIcon />
      },
      fee: 13225,
      locked: '97.42M',
      tvl: '120.42M',
      apr: 21.51
    }
  ]

  const features = [
    {
      img: FeaturedSwap,
      title: 'Swap Tokens',
      desc: 'Trade any combination of ERC-20 tokens permissionless, with ease.'
    },
    {
      img: ProvideLiquidity,
      title: 'Supply Liquidity',
      desc: 'Earn 0.25% fee on trades proportional to your share of the pool.'
    },
    {
      img: Rewards,
      title: 'Earn $QUICK',
      desc: 'Deposit your LP Tokens to earn additional rewards in $QUICK Token.'
    },
    {
      img: DragonsLair,
      title: 'Dragons Lair',
      desc: 'Dragons’s lair is a single staking pool for QUICK token. Stake your QUICK to recieve dQuick, and earn your share of .04%'
    },
    {
      img: BuyWithFiat,
      title: 'Buy Crypto with Fiat',
      desc: 'Simple way to buy with Apple Pay, credit card, bank transfer & more.'
    },
    {
      img: Analytics,
      title: 'Analytics',
      desc: 'Scan through Quickwap analytics & Historical Data.'
    },
  ]

  const socialicons = [
    {
      link: '',
      icon: <RedditIcon />,
      title: 'Reddit'
    },
    {
      link: '',
      icon: <DiscordIcon />,
      title: 'Discord'
    },
    {
      link: '',
      icon: <TwitterIcon />,
      title: 'Twitter'
    },
    {
      link: '',
      icon: <MediumIcon />,
      title: 'Medium'
    },
    {
      link: '',
      icon: <YouTubeIcon />,
      title: 'Youtube'
    },
    {
      link: '',
      icon: <TelegramIcon />,
      title: 'Telegram'
    },
    {
      link: '',
      icon: <CoingeckoIcon />,
      title: 'CoinGecko'
    }
  ]

  return (
    <Box className={classes.landingPage}>
      <Box className={classes.heroBkg}>
        <img src={HeroBkg} alt='Hero Background' />
      </Box>
      <Box className={classes.heroSection}>
        <Typography component='h3'>
          Total Value Locked
        </Typography>
        <Typography component='h1'>
          $14,966,289,380
        </Typography>
        <Typography>
          The Top Asset Exchange on the Polygon Network
        </Typography>
        <Button color='primary'>
          <Typography>Connect Wallet</Typography>
        </Button>
      </Box>
      <Box className={classes.tradingInfo}>
        <Box>
          <Typography>Total Trading Pairs</Typography>
          <Typography component='h1'>11,029</Typography>
        </Box>
        <Box>
          <Typography>24 Hours Volume</Typography>
          <Typography component='h1'>$99.6M+</Typography>
        </Box>
        <Box>
          <Typography>24 Hours Transactions</Typography>
          <Typography component='h1'>333,372</Typography>
        </Box>
        <Box>
          <Typography>24 Hours Fees</Typography>
          <Typography component='h1'>$223,512</Typography>
        </Box>
      </Box>
      <Box className={classes.quickInfo}>
        <Typography component='h2'>
          QuickSwap is a next-generation layer-2 decentralized exchange and Automated Market Maker.
        </Typography>
        <img src={Motif} alt='Motif' />
      </Box>
      <Box className={classes.swapContainer}>
        <ButtonGroup>
          <Button className={swapIndex === 0 ? 'active' : ''} onClick={() => setSwapIndex(0)}>For Traders</Button>
          <Button className={swapIndex === 1 ? 'active' : ''} onClick={() => setSwapIndex(1)}>For Investors</Button>
        </ButtonGroup>
        <Grid container spacing={mobileWindowSize ? 0 : 8} alignItems='center'>
          <Grid item sm={12} md={6}>
            <Swap />
          </Grid>
          <Grid item sm={12} md={6} className={classes.swapInfo}>
            <Typography component='h3'>
              Swap tokens at near-zero gas fees
            </Typography>
            <Typography>
              Exchange any combination of ERC-20 tokens permissionless, with ease
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.rewardsContainer}>
        <Typography component='h3'>
          Earn additional rewards in $QUICK by depositing your LP Tokens
        </Typography>
        <Typography>
          Deposit your Liquidity Provider tokens to receive Rewards in $QUICK on top of LP Fees.
        </Typography>
        <Slider {...rewardSliderSettings} className={classes.rewardsSlider}>
          {
            rewardItems.map((val, index) => (
              <Box key={index} className={classes.rewardsSliderItem}>
                <Box className='rewardIcon'>
                  <Box>
                    { val.token1.logo }
                  </Box>
                  <Box>
                    { val.token2.logo }
                  </Box>
                </Box>
                <Typography component='h3'>
                  { val.token1.symbol }-{ val.token2.symbol }
                </Typography>
                <Box className='row'>
                  <Typography>24h Fees</Typography>
                  <Typography component='h4'>{ val.fee }</Typography>
                </Box>
                <Box className='row'>
                  <Typography>Locked Value</Typography>
                  <Typography component='h4'>{ val.locked }</Typography>
                </Box>
                <Box className='row'>
                  <Typography>TVL</Typography>
                  <Typography component='h4'>{ val.tvl }</Typography>
                </Box>
                <Box className='row'>
                  <Typography>APR<HelpIcon /></Typography>
                  <Typography component='h5'>{ val.apr }%</Typography>
                </Box>
                <Button fullWidth color='primary'>Invest</Button>
              </Box>
            ))
          }
        </Slider>
        <Button variant='contained' color='secondary'>
          See all pools
        </Button>
      </Box>
      <Box className={classes.buyFiatContainer}>
        <img src={FiatMask} alt='Fiat Mask' />
        <Box>
          <Box className='buyFiatInfo'>
            <img src={BuyWithFiat} alt='buy with fiat' />
            <Box>
              <Typography component='h3'>
                Buy crypto with Fiat
              </Typography>
              <Typography>
                Simple way to buy or sell crypto with a credit card, bank transfer and more
              </Typography>
            </Box>
          </Box>
          <Box className='buyFiatWrapper'>
            <Box className='buyContent'>
              <Typography>I want to Buy:</Typography>
              <Grid container justifyContent='space-between' alignItems='center'>
                <Button className={classes.currencyButton}>
                  <QuickIcon />
                  <Typography>QUICK</Typography>
                  <KeyboardArrowDownIcon />
                </Button>
                <Typography component='h4'>0.00</Typography>
              </Grid>
            </Box>
            <Button fullWidth color='primary'>Buy QUICK Now</Button>
          </Box>
        </Box>
      </Box>
      <Box className={classes.featureContainer}>
        <Box className={classes.featureHeading}>
          <Typography component='h2'>
            Features
          </Typography>
          <Box className={classes.featureDivider} />
        </Box>
        <Grid container spacing={4}>
          {
            features.map((val, index) => (
              <Grid item container alignItems='center' justifyContent='space-between' sm={12} md={6} key={index}>
                <img src={val.img} alt={val.title} />
                <Box className='featureText'>
                  <Typography component='h3'>
                    { val.title }
                  </Typography>
                  <Typography>
                    { val.desc }
                  </Typography>
                </Box>
              </Grid>
            ))
          }
        </Grid>
      </Box>
      <Box className={classes.communityContainer}>
        <Box className={classes.featureHeading}>
          <Typography component='h2'>
            Join our ever-growing Community
          </Typography>
          <Box className={classes.featureDivider} />
        </Box>
        <Box className='socialContent'>
          {
            socialicons.map((val, ind) => (
              <Box key={ind}>
                { val.icon }
                <a href={val.link} target='_blank' rel='noreferrer' ><Typography>{val.title}</Typography></a>
              </Box>
            ))
          }
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;
