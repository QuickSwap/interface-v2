import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  ButtonGroup,
  Typography,
  Button,
  Box,
  Grid,
  useMediaQuery
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { Currency } from '@uniswap/sdk';
import { useTheme } from '@material-ui/core/styles';
import Motif from 'assets/images/Motif.svg';
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
import { Swap, CurrencyInput, RewardSlider, AddLiquidity } from 'components';
import { useActiveWeb3React, useInitTransak } from 'hooks';
import { addMaticToMetamask, getEthPrice, getGlobalData, formatCompact } from 'utils';
import { useEthPrice, useGlobalData, useWalletModalToggle } from 'state/application/hooks';
import { useAllTokens } from 'hooks/Tokens';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '100px 0 80px',
    position: 'relative',
    textAlign: 'center',
    zIndex: 2,
    '& h3': {
      color: 'white',
      textTransform: 'uppercase',
      marginBottom: 20,
    },
    '& h1': {
      color: palette.primary.main,
    },
    '& > p': {
      margin: '20px 0 50px'
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
    },
  },
  tradingInfo: {
    width: '100%',
    position: 'relative',
    zIndex: 2,
    '& > div': {
      background: palette.background.default,
      width: 'calc(25% - 24px)',
      maxWidth: 288,
      minWidth: 220,
      height: 133,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      margin: 12,
      '& p': {
        marginBottom: 24,
        textTransform: 'uppercase',
      },
    }
  },
  quickInfo: {
    textAlign: 'center',
    margin: '128px 0 60px',
    '& h2': {
      marginBottom: 60
    }
  },
  swapContainer: {
    textAlign: 'center',
    padding: '20px 0',
    maxWidth: 1048,
    margin: 'auto',
    width: '100%',
    '& > div': {
      width: '100%',
    },
    '& .MuiButtonGroup-root': {
      marginBottom: 50,
      '& button': {
        maxWidth: 180,
        width: '50%',
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
    margin: '172px 0',
    '& h3': {
      marginBottom: 24
    },
    '& > button': {
      width: 194,
      height: 48,
      borderRadius: 50
    },
    [breakpoints.down('xs')]: {
      margin: '32px 0 64px'
    }
  },
  buyFiatContainer: {
    background: palette.primary.dark,
    height: 338,
    borderRadius: 48,
    marginBottom: 160,
    overflow: 'hidden',
    position: 'relative',
    [breakpoints.down('sm')]: {
      height: 'auto'
    },
    [breakpoints.down('xs')]: {
      marginBottom: 80
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
        maxWidth: 320,
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
        '& > div': {
          padding: 0,
          border: 'none',
          '& > p': {
            marginBottom: 8
          },  
        },
      },
      '& > button': {
        height: 56,
        marginTop: 20,
      }
    }
  },
  featureHeading: {
    margin: 'auto',
    textAlign: 'center',
    '& h3': {
      color: 'rgba(255, 255, 255, 0.87)',
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
    '& > div.MuiGrid-root': {
      marginTop: 32,
      '& > div': {
        '& img': {
          width: 200,
          maxWidth: 240,
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
        color: 'white',
        marginBottom: 8
      },
    }
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
        margin: '16px 32px 16px 0',
        textAlign: 'center',
        width: 120,
        '& a': {
          textDecoration: 'none',
          color: 'white'
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
  const { account } = useActiveWeb3React();
  const { ethereum } = (window as any);
  const isnotMatic = ethereum && ethereum.isMetaMask && Number(ethereum.chainId) !== 137;
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('sm'));
  const smallWindowSize = useMediaQuery(theme.breakpoints.down('xs'));
  const { initTransak } = useInitTransak();
  const allTokens = useAllTokens();
  const toggleWalletModal = useWalletModalToggle();
  const quickToken = Object.values(allTokens).find((val) => val.symbol === 'QUICK');
  const [ fiatCurrency, setFiatCurrency ] = useState<Currency | undefined>(quickToken);
  const [ fiatAmount, setFiatAmount ] = useState('');

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

  const { ethPrice, updateEthPrice } = useEthPrice();
  const { globalData, updateGlobalData } = useGlobalData();

  useEffect(() => {
    async function checkEthPrice() {
      if (!ethPrice.price) {
        const [newPrice, oneDayPrice, priceChange] = await getEthPrice();
        updateEthPrice({ price: newPrice, oneDayPrice, ethPriceChange: priceChange });
        const globalData = await getGlobalData(newPrice, oneDayPrice);
        if (globalData) {
          updateGlobalData({ data: globalData });
        }
      }
    }
    checkEthPrice();
  }, [ethPrice, updateEthPrice, updateGlobalData])

  return (
    <>
      <Box className={classes.heroSection}>
        <Typography variant='h3'>
          Total Value Locked
        </Typography>
        {
          globalData ?
            <Typography variant='h1'>
              ${Number(globalData.totalLiquidityUSD).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </Typography>
            :
            <Skeleton variant="rect" width={400} height={72} />
        }
        <Typography>
          The Top Asset Exchange on the Polygon Network
        </Typography>
        {
          !account &&
            <Button color='primary' onClick={() => { isnotMatic ? addMaticToMetamask() : toggleWalletModal() }}>
              <Typography>{ isnotMatic ? 'Switch to Matic' : 'Connect Wallet' }</Typography>
            </Button>        
        }
      </Box>
      <Box className={classes.tradingInfo} display='flex' flexWrap='wrap' justifyContent={smallWindowSize ? 'center' : 'space-between'}>
        <Box>
          <Typography>Total Trading Pairs</Typography>
          {
            globalData ?
              <Typography variant='h2'>
                {Number(globalData.pairCount).toLocaleString()}
              </Typography>
              :
              <Skeleton variant="rect" width={100} height={45} />
          }
        </Box>
        <Box>
          <Typography>24 Hours Volume</Typography>
          {
            globalData ?
              <Typography variant='h2'>
                ${formatCompact(globalData.oneDayVolumeUSD)}
              </Typography>
              :
              <Skeleton variant="rect" width={100} height={45} />
          }
        </Box>
        <Box>
          <Typography>24 Hours Transactions</Typography>
          {
            globalData ?
              <Typography variant='h2'>
                {Number(globalData.oneDayTxns).toLocaleString()}
              </Typography>
              :
              <Skeleton variant="rect" width={100} height={45} />
          }
        </Box>
        <Box>
          <Typography>24 Hours Fees</Typography>
          {
            globalData ?
              <Typography variant='h2'>
                ${(Number(globalData.oneDayVolumeUSD) * 0.003).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Typography>
              :
              <Skeleton variant="rect" width={100} height={45} />
          }
        </Box>
      </Box>
      <Box className={classes.quickInfo}>
        <Typography variant='subtitle1'>
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
            { swapIndex === 0 ? 
                <Swap />
              :
                <AddLiquidity />
            }
          </Grid>
          <Grid item sm={12} md={6} className={classes.swapInfo}>
            <Typography variant='h3'>
              {
                swapIndex === 0 ?
                  'Swap tokens at near-zero gas fees'
                  :
                  'Let your crypto work for you'
              }
            </Typography>
            <Typography variant='subtitle1'>
              {
                swapIndex === 0 ?
                  'Exchange any combination of ERC-20 tokens permissionless, with ease'
                  :
                  'Provide Liquidity and earn 0.25% fee on all trades proportional to your share of the pool. Earn additional rewards by depositing your LP Tokens in Rewards Pools.'
              }
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.rewardsContainer}>
        <Typography variant='h3'>
          Earn additional rewards in $QUICK by depositing your LP Tokens
        </Typography>
        <Typography variant='subtitle1'>
          Deposit your Liquidity Provider tokens to receive Rewards in $QUICK on top of LP Fees.
        </Typography>
        <RewardSlider />
        {/* <Button variant='contained' color='secondary'>
          See all pools
        </Button> */}
      </Box>
      <Box className={classes.buyFiatContainer}>
        <img src={FiatMask} alt='Fiat Mask' />
        <Box>
          <Box className='buyFiatInfo'>
            <img src={BuyWithFiat} alt='buy with fiat' />
            <Box>
              <Typography variant='h3'>
                Buy crypto with Fiat
              </Typography>
              <Typography variant='subtitle1'>
                Simple way to buy or sell crypto with a credit card, bank transfer and more
              </Typography>
            </Box>
          </Box>
          <Box className='buyFiatWrapper'>
            <Box className='buyContent'>
              <CurrencyInput currency={fiatCurrency} title='I want to Buy:' showMaxButton={false} otherCurrency={undefined} handleCurrencySelect={setFiatCurrency} amount={fiatAmount} setAmount={setFiatAmount} />
            </Box>
            {
              fiatCurrency &&
                <Button fullWidth color='primary' onClick={() => initTransak(account, mobileWindowSize, fiatCurrency.symbol || '')}>Buy { fiatCurrency.symbol } Now</Button>
            }
          </Box>
        </Box>
      </Box>
      <Box className={classes.featureContainer}>
        <Box className={classes.featureHeading}>
          <Typography variant='h3'>
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
                  <Typography variant='h3'>
                    { val.title }
                  </Typography>
                  <Typography variant='body1'>
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
          <Typography variant='h3'>
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
    </>
  );
};

export default LandingPage;
