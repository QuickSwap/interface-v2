import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import {
  ButtonGroup,
  Typography,
  Button,
  Box,
  Grid,
  useMediaQuery,
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
import {
  Swap,
  CurrencyInput,
  RewardSlider,
  AddLiquidity,
  StakeQuickModal,
  TopMovers,
} from 'components';
import { useActiveWeb3React, useInitTransak } from 'hooks';
import {
  addMaticToMetamask,
  getEthPrice,
  getGlobalData,
  formatCompact,
  getDaysCurrentYear,
} from 'utils';
import {
  useEthPrice,
  useGlobalData,
  useWalletModalToggle,
} from 'state/application/hooks';
import { QUICK } from 'constants/index';
import { useLairInfo, useTotalRewardsDistributed } from 'state/stake/hooks';

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
      textTransform: 'uppercase',
      marginBottom: 20,
    },
    '& h1': {
      color: palette.primary.main,
    },
    '& > button': {
      height: 56,
      width: 194,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    [breakpoints.down('xs')]: {
      margin: '64px 0',
    },
  },
  tradingInfo: {
    width: '100%',
    position: 'relative',
    zIndex: 2,
    justifyContent: 'center',
    [breakpoints.down('md')]: {
      flexWrap: 'wrap',
    },
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
      [breakpoints.down('xs')]: {
        height: 'unset',
      },
    },
  },
  quickInfo: {
    textAlign: 'center',
    margin: '128px 0 30px',
    maxWidth: 800,
    '& h2': {
      marginBottom: 60,
    },
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
          color: palette.background.default,
        },
        '&:first-child': {
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
        },
        '&:last-child': {
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
      },
    },
    [breakpoints.down('xs')]: {
      '& .MuiGrid-item': {
        width: '100%',
        marginBottom: 32,
        textAlign: 'center',
      },
    },
  },
  buttonGroup: {
    textAlign: 'center',
    padding: '20px 0',
    maxWidth: 1048,
    margin: 'auto',
    width: '100%',
    '& > div': {
      width: '100%',
    },
    '& .MuiButtonGroup-root': {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
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
        color: palette.text.secondary,
        '&.active': {
          background: '#FFFFFFDE',
          border: `1px solid transparent`,
          color: palette.background.default,
        },
        '&:first-child': {
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
        },
        '&:last-child': {
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
      },
    },
    [breakpoints.down('xs')]: {
      '& .MuiGrid-item': {
        width: '100%',
        marginBottom: 32,
        textAlign: 'center',
      },
    },
  },
  swapInfo: {
    textAlign: 'left',
    marginBottom: 60,
    [breakpoints.down('sm')]: {
      order: -1,
    },
    '& h3': {
      marginBottom: 16,
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
    bottom: 80,
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
    [breakpoints.down('xs')]: {
      display: 'none',
    },
  },
}));

const LandingPage: React.FC = () => {
  const classes = useStyles();
  const daysCurrentYear = getDaysCurrentYear();
  const [swapIndex, setSwapIndex] = useState(0);
  const [openStakeModal, setOpenStakeModal] = useState(false);
  const { palette, breakpoints } = useTheme();
  const { account, chainId } = useActiveWeb3React();
  const { ethereum } = window as any;
  const isnotMatic =
    ethereum && ethereum.isMetaMask && Number(ethereum.chainId) !== 137;
  const mobileWindowSize = useMediaQuery(breakpoints.down('sm'));
  const { initTransak } = useInitTransak();
  const toggleWalletModal = useWalletModalToggle();
  const [fiatCurrency, setFiatCurrency] = useState<Currency | undefined>(QUICK);
  const [fiatAmount, setFiatAmount] = useState('');

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
      title: 'Dragons Lair',
      desc:
        'Dragons’s lair is a single staking pool for QUICK token. Stake your QUICK to recieve dQuick, and earn your share of .04%',
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
      desc: 'Scan through Quickwap analytics & Historical Data.',
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
  const { ethPrice, updateEthPrice } = useEthPrice();
  const { globalData, updateGlobalData } = useGlobalData();
  const lairInfo = useLairInfo();

  const APR =
    (((Number(lairInfo?.oneDayVol) * 0.04 * 0.01) /
      Number(lairInfo?.dQuickTotalSupply.toSignificant(6))) *
      daysCurrentYear) /
    (Number(lairInfo?.dQUICKtoQUICK.toSignificant()) *
      Number(lairInfo?.quickPrice));

  const dQUICKAPY = useMemo(() => {
    return APR
      ? (
          (Math.pow(1 + APR / daysCurrentYear, daysCurrentYear) - 1) *
          100
        ).toFixed(4)
      : 0;
  }, [APR, daysCurrentYear]);

  const totalRewardsUSD = useTotalRewardsDistributed();

  useEffect(() => {
    async function checkEthPrice() {
      if (!ethPrice.price) {
        const [newPrice, oneDayPrice, priceChange] = await getEthPrice();
        updateEthPrice({
          price: newPrice,
          oneDayPrice,
          ethPriceChange: priceChange,
        });
        const globalData = await getGlobalData(newPrice, oneDayPrice);
        if (globalData) {
          updateGlobalData({ data: globalData });
        }
      }
    }
    checkEthPrice();
  }, [ethPrice, updateEthPrice, updateGlobalData]);

  return (
    <>
      {openStakeModal && (
        <StakeQuickModal
          open={openStakeModal}
          onClose={() => setOpenStakeModal(false)}
        />
      )}
      <Box className={classes.heroSection}>
        <Typography variant='body2' style={{ fontWeight: 'bold' }}>
          Total Value Locked
        </Typography>
        {globalData ? (
          <Box display='flex' flexDirection='row' style={{ paddingTop: '5px' }}>
            <Typography variant='h3' style={{ paddingTop: '9px' }}>
              $
            </Typography>
            <Typography style={{ fontSize: '55px', fontWeight: 700 }}>
              {Number(globalData.totalLiquidityUSD).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </Typography>
          </Box>
        ) : (
          <Box my={1}>
            <Skeleton variant='rect' width={400} height={72} />
          </Box>
        )}
        <Typography style={{ fontSize: '15px', color: palette.text.secondary }}>
          Top Asset Exchange on the Polygon Network
        </Typography>
        <Box mt={2} width={200} height={48}>
          <Button
            fullWidth
            style={{
              backgroundColor: '#004ce6',
              borderRadius: '30px',
              height: '100%',
              fontSize: 16,
              fontWeight: 500,
            }}
            onClick={() => {
              isnotMatic
                ? addMaticToMetamask()
                : account
                ? history.push('/swap')
                : toggleWalletModal();
            }}
          >
            {isnotMatic
              ? 'Switch to Polygon'
              : account
              ? 'Enter App'
              : 'Connect Wallet'}
          </Button>
        </Box>
      </Box>
      <Box className={classes.tradingInfo} display='flex'>
        <Box>
          {globalData?.oneDayTxns ? (
            <Typography variant='h3'>
              {Number(globalData.oneDayTxns).toLocaleString()}
            </Typography>
          ) : (
            <Skeleton variant='rect' width={100} height={45} />
          )}
          <Typography
            style={{
              fontSize: '12px',
              color: palette.text.secondary,
              paddingTop: '15px',
            }}
          >
            24H TRANSACTIONS
          </Typography>
        </Box>
        <Box>
          {globalData ? (
            <Box display='flex' flexDirection='row'>
              <Typography variant='h6' style={{ paddingTop: '2px' }}>
                $
              </Typography>
              <Typography variant='h3'>
                {formatCompact(globalData.oneDayVolumeUSD)}
              </Typography>
            </Box>
          ) : (
            <Skeleton variant='rect' width={100} height={45} />
          )}
          <Typography
            style={{
              fontSize: '12px',
              color: palette.text.secondary,
              paddingTop: '15px',
            }}
          >
            24H TRADING VOLUME
          </Typography>
        </Box>
        <Box>
          {totalRewardsUSD ? (
            <Box display='flex' flexDirection='row'>
              <Typography variant='h6' style={{ paddingTop: '2px' }}>
                $
              </Typography>
              <Typography variant='h3'>
                {totalRewardsUSD.toLocaleString()}
              </Typography>
            </Box>
          ) : (
            <Skeleton variant='rect' width={100} height={45} />
          )}
          <Typography
            style={{
              fontSize: '12px',
              color: palette.text.secondary,
              paddingTop: '15px',
            }}
          >
            24h REWARDS DISTRIBUTED
          </Typography>
        </Box>
        <Box>
          {globalData ? (
            <Typography variant='h3'>
              {Number(globalData.pairCount).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </Typography>
          ) : (
            <Skeleton variant='rect' width={100} height={45} />
          )}
          <Typography
            style={{
              fontSize: '12px',
              color: palette.text.secondary,
              paddingTop: '15px',
            }}
          >
            TOTAL TRADING PAIRS
          </Typography>
        </Box>
        <Box>
          {globalData ? (
            <Typography variant='h3' style={{ paddingTop: '20px' }}>
              {Number(dQUICKAPY).toLocaleString()}%
            </Typography>
          ) : (
            <Skeleton variant='rect' width={100} height={45} />
          )}
          <Box
            style={{
              fontSize: '12px',
              color: palette.text.secondary,
              paddingTop: '15px',
            }}
          >
            dQUICK APY
          </Box>
          <Typography
            style={{
              color: palette.primary.main,
              fontSize: '12px',
              cursor: 'pointer',
            }}
            onClick={() => setOpenStakeModal(true)}
          >
            stake {'>'}
          </Typography>
        </Box>
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
      <Box className={classes.buttonGroup}>
        <ButtonGroup>
          <Button
            className={swapIndex === 0 ? 'active' : ''}
            onClick={() => setSwapIndex(0)}
          >
            Swap
          </Button>
          <Button
            className={swapIndex === 1 ? 'active' : ''}
            onClick={() => setSwapIndex(1)}
          >
            Liquidity
          </Button>
        </ButtonGroup>
      </Box>
      <Box className={classes.swapContainer}>
        <Grid container spacing={mobileWindowSize ? 0 : 8} alignItems='center'>
          <Grid item sm={12} md={6}>
            {swapIndex === 0 ? (
              <Swap currencyBg={palette.background.paper} />
            ) : (
              <AddLiquidity currencyBg={palette.background.paper} />
            )}
          </Grid>
          <Grid item sm={12} md={6} className={classes.swapInfo}>
            <Typography variant='h4'>
              {swapIndex === 0
                ? 'Swap tokens at near-zero gas fees'
                : 'Let your crypto work for you'}
            </Typography>
            <Typography variant='body1' style={{ marginTop: '20px' }}>
              {swapIndex === 0
                ? 'Deposit your Liquidity Provider tokens to receive Rewards in $QUICK on top of LP Fees.'
                : 'Provide Liquidity and earn 0.25% fee on all trades proportional to your share of the pool. Earn additional rewards by depositing your LP Tokens in Rewards Pools.'}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.rewardsContainer}>
        <Typography variant='h4'>
          Earn additional rewards in $QUICK by
        </Typography>
        <Typography variant='h4'>depositing your LP Tokens</Typography>
        <Typography variant='body2' style={{ marginTop: '20px' }}>
          Deposit your Liquidity Provider tokens to receive Rewards
        </Typography>
        <Typography variant='body2'>in $QUICK on top of LP Fees.</Typography>
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
      <Box className={classes.buyFiatContainer}>
        <img src={FiatMask} alt='Fiat Mask' />
        <Box>
          <Box className='buyFiatInfo'>
            <img src={BuyWithFiat} alt='buy with fiat' />
            <Box>
              <Typography variant='h3'>Buy crypto with Fiat</Typography>
              <Typography variant='h6'>
                Simple way to buy or sell crypto with a credit card, bank
                transfer and more
              </Typography>
            </Box>
          </Box>
          <Box className='buyFiatWrapper'>
            <Box className='buyContent'>
              <CurrencyInput
                currency={fiatCurrency}
                title='I want to Buy:'
                showMaxButton={false}
                otherCurrency={undefined}
                handleCurrencySelect={setFiatCurrency}
                amount={fiatAmount}
                setAmount={setFiatAmount}
              />
            </Box>
            {fiatCurrency && (
              <Button
                fullWidth
                color='primary'
                onClick={() =>
                  initTransak(
                    account,
                    mobileWindowSize,
                    fiatCurrency.symbol || '',
                  )
                }
              >
                Buy {fiatCurrency.symbol} Now
              </Button>
            )}
          </Box>
        </Box>
      </Box>
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
    </>
  );
};

export default LandingPage;
