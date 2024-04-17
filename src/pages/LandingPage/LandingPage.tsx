import React, { lazy, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
  Grid,
} from '@material-ui/core';
import { useTranslation, Trans } from 'react-i18next';
import { ReactComponent as DiscordIcon } from 'assets/images/social/discord_new.svg';
import { ReactComponent as BlogIcon } from 'assets/images/social/blog_new.svg';
import { ReactComponent as RedditIcon } from 'assets/images/social/Reddit.svg';
import { ReactComponent as TelegramIcon } from 'assets/images/social/Telegram.svg';
import { ReactComponent as YouTubeIcon } from 'assets/images/social/YouTube.svg';
import { ReactComponent as GeckoterminalIcon } from 'assets/images/social/Geckoterminal.svg';
import { ReactComponent as Medium } from '../../assets/images/social/Medium.svg';
import { ReactComponent as Announcements } from '../../assets/images/social/announcements.svg';
import CoinMarketCap from '../../assets/images/social/coinMarketCap.png';
import CoinpaprikaIcon from 'assets/images/social/coinpaprika-logo.png';
import XIcon from 'assets/images/social/X.png';
import 'pages/styles/landing.scss';
import { useIsV2 } from 'state/application/hooks';
import { getConfig } from 'config/index';
import { useActiveWeb3React } from 'hooks';
import NewsletterSignupForm from './NewsletterSignupForm';
import Features1 from '../../assets/images/landingPage/features1.svg';
import Features2 from '../../assets/images/landingPage/features2.svg';
import Features3 from '../../assets/images/landingPage/features3.svg';
import Features4 from '../../assets/images/landingPage/features4.svg';
import Earn1 from '../../assets/images/landingPage/earn1.svg';
import Earn2 from '../../assets/images/landingPage/earn2.svg';
import Earn3 from '../../assets/images/landingPage/earn3.svg';
import GoAhead from '../../assets/images/landingPage/GoAhead.svg';
import { HypeLabAds } from 'components';
import { useIsSupportedNetwork } from 'utils';
import { SUPPORTED_CHAINIDS } from 'constants/index';
import { BuyFiatButton } from 'components';

import Polygon from '../../assets/images/landingPage/chains/aMATIC.svg';
import PolygonZK from '../../assets/images/landingPage/chains/PolygonZK.png';
import MantaPacific from '../../assets/images/landingPage/chains/MantaPacific.png';
import ImmutableZK from '../../assets/images/landingPage/chains/Immutable.png';
import AstarZK from '../../assets/images/landingPage/chains/Astar.png';
import X1Network from '../../assets/images/landingPage/chains/x1.png';
import DogeChain from '../../assets/images/landingPage/chains/dogechain.png';
import Kava from '../../assets/images/landingPage/chains/KAVA.svg';
import BGSHINE from '../../assets/images/shine.webp';

const GlobalSection = lazy(() => import('./GlobalSection'));
// const BuyFiatSection = lazy(() => import('./BuyFiatSection'));
// const BuySpritzSection = lazy(() => import('./BuySpritzSection'));
// const TopMovers = lazy(() => import('components/TopMovers'));
// const RewardSlider = lazy(() => import('components/RewardSlider'));

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const isFarmAvailable = config['farm']['available'];

  const availableChains = [
    {
      icon: Polygon,
      name: 'Polygon',
    },
    {
      icon: PolygonZK,
      name: 'Polygon zkEVM',
    },
    {
      icon: MantaPacific,
      name: 'Manta Pacific',
    },
    {
      icon: ImmutableZK,
      name: 'Immutable zkEVM',
    },
    {
      icon: AstarZK,
      name: 'Astar zkEVM',
    },
    {
      icon: X1Network,
      name: 'X1 Network',
    },
    {
      icon: DogeChain,
      name: 'DogeChain',
    },
    {
      icon: Kava,
      name: 'Kava - Kinetix',
    },
  ];

  const statistics = [
    {
      title: t('TotalValueLocked'),
      numbers: '203.45M',
    },
    {
      title: t('24hVol'),
      numbers: '2.58B+',
    },
    {
      title: t('TotalVol'),
      numbers: '8,459,984',
    },
    {
      title: t('24hRewards'),
      numbers: '109,870',
    },
    {
      title: t('DragonsLairTVL'),
      numbers: '20,948,324',
    },
    {
      title: t('DragonsLairAPY'),
      numbers: '40.85%',
    },
  ];

  const features = [
    {
      img: Features1,
      title: t('swap'),
      desc: t('featureSwapDesc'),
      button: t('TradeNow'),
      link: '/#/swap',
    },
    {
      img: Features2,
      title: t('addLiquidity'),
      desc: t('featureLiquidityDesc'),
      button: t('LPNow'),
      link: '/#/pools',
    },
    {
      img: Features3,
      title: t('perpetual'),
      desc: t('featurePerpetualDesc'),
      button: t('TradeNow'),
      link: 'https://perps.quickswap.exchange/#/trade',
    },
    {
      img: Features4,
      title: t('buyWithFiat'),
      desc: t('featureBuyFiatDesc'),
      button: t('BuyNow'),
      link: '/#/swap',
    },
  ];

  const earnContent = [
    {
      img: Earn1,
      title: t('DragonLair'),
      desc: t('earnDragonDesc'),
      button: t('Stake'),
      link: '/#/dragons',
    },
    {
      img: Earn2,
      title: t('Farm'),
      desc: t('earnFarmDesc'),
      button: t('Add'),
      link: '/#/farm',
    },
    {
      img: Earn3,
      title: t('Bonds'),
      desc: t('earnBondsDesc'),
      button: t('TradeNow'),
      link: '/#/bonds',
    },
  ];

  const socialicons = [
    {
      link: 'https://twitter.com/QuickswapDEX',
      icon: <img src={XIcon} alt='X' />,
      title: 'X',
    },
    {
      link: 'https://t.me/QuickSwapDEX',
      icon: <TelegramIcon />,
      title: 'Telegram',
    },
    {
      link: 'https://t.me/QuickSwapAnnouncements',
      icon: <Announcements />,
      title: 'Announcements',
    },
    {
      link: 'https://discord.gg/dSMd7AFH36',
      icon: <DiscordIcon />,
      title: 'Discord',
    },
    {
      link: 'https://blog.quickswap.exchange/',
      icon: <BlogIcon />,
      title: 'Blog',
    },
    {
      link: 'https://www.youtube.com/@quickswapofficial',
      icon: <YouTubeIcon />,
      title: 'Youtube',
    },
    {
      link: 'https://www.reddit.com/r/QuickSwap/',
      icon: <RedditIcon />,
      title: 'Reddit',
    },
    {
      link: 'https://medium.com/@quickswap-layer2',
      icon: <Medium />,
      title: 'Medium',
    },
    {
      link: 'https://www.geckoterminal.com/polygon_pos/quickswap_v3/pools',
      icon: <GeckoterminalIcon />,
      title: 'GeckoTerminal',
    },
    {
      link: 'https://coinpaprika.com/exchanges/quickswap-v3/',
      icon: <img src={CoinpaprikaIcon} alt='Coinpaprika' />,
      title: 'Coinpaprika',
    },
    {
      link: 'https://coinmarketcap.com/currencies/quickswap-new/',
      icon: <img src={CoinMarketCap} alt='CoinMarketCao' />,
      title: 'CoinMarketCap',
    },
  ];
  //

  const history = useHistory();
  const { updateIsV2 } = useIsV2();

  useEffect(() => {
    updateIsV2(false);
  }, [updateIsV2]);

  const [networkType, setNetworkType] = useState('mainnet');
  const supportedChains = SUPPORTED_CHAINIDS.filter((chain) => {
    const config = getConfig(chain);
    return config && config.isMainnet === (networkType === 'mainnet');
  });

  return (
    <div className='background-img' style={{ width: '100%' }}>
      <GlobalSection />

      <Box className='chainsContainer'>
        <span className='font-14'>{t('AvailableOn')}</span>
        {/*  */}
        {/* <Box className='chainsItems'>
          {supportedChains.map((chain) => {
            const config = getConfig(chain);
            return (
              <Box className='chainsAddress' key={chain}>
                <img
                  src={config['nativeCurrencyImage']}
                  alt='network Image'
                  className='networkIcon'
                />
                <p className='font-14'>{config['networkName']}</p>
                <p className='networkDivider'></p>
              </Box>
            );
          })}
        </Box> */}
        {/*  */}
        <Box className='chainsItems'>
          {availableChains.map((val, index) => (
            <Box key={index} className='chainsAddress'>
              <img className='networkIcon' src={val.icon} alt={val.name} />
              <p className='font-14'>{val.name}</p>
              <p className='networkDivider'></p>
            </Box>
          ))}
        </Box>
        {/*  */}
      </Box>

      <Box className='sectionContainer statsContainer'>
        <h3 className='sectionHeading'>{t('QuickStatistics')}</h3>
        <p className='sectionDesc'>{t('QuickStatisticsDesc')}</p>
        <Box className='statsCardBox'>
          {statistics.map((val, index) => (
            <Box className='statsCard' key={index}>
              <h5>{val.title}</h5>
              <p
                className={val.title == t('DragonsLairAPY') ? 'text-green' : ''}
              >
                {val.numbers}
              </p>
            </Box>
          ))}
        </Box>
        <a href='/#/analytics' className='analytics'>
          <p className='btn'>{t('ViewAnalytics')}</p>
          <img src={GoAhead} alt='goAhead' />
        </a>
      </Box>

      <Box className='sectionContainer'>
        <h3 className='sectionHeading'>{t('TradeLiquidity')}</h3>
        <p className='sectionDesc'>{t('TradeLiquidityDesc')}</p>
        <Box className='cardBox'>
          {features.map((val, index) => (
            <Box className='sectionCard' key={index}>
              <div>
                <div className='card_title'>
                  <img src={val.img} alt={val.title} />
                  <h5>{val.title}</h5>
                </div>
                <p>{val.desc}</p>
              </div>
              <a href={val.link}>
                <p className='btn'>{val.button}</p>
                <img src={GoAhead} alt='goAhead' />
              </a>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className='sectionContainer'>
        <h3 className='sectionHeading'>{t('Earn')}</h3>
        <p className='sectionDesc'>{t('EarnDesc')}</p>
        <Box className='cardBox'>
          {earnContent.map((val, index) => (
            <Box className='sectionCard' key={index}>
              <div>
                <div className='card_title'>
                  <img src={val.img} alt={val.title} />
                  <h5>{val.title}</h5>
                </div>
                <p>{val.desc}</p>
              </div>
              <a href={val.link}>
                <p className='btn'>{val.button}</p>
                <img src={GoAhead} alt='goAhead' />
              </a>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className='communityContainer'>
        <Box className='Subscribe'>
          <h3 className='sectionHeading'>{t('SubscribeQuickSwap')}</h3>
          <p className='sectionDesc'>{t('SubscribeQuickSwapDesc')}</p>
          <NewsletterSignupForm />
        </Box>

        <Box className='socialContent'>

          <img src={BGSHINE} className='bg_shine' alt='' />

          {socialicons.map((val, ind) => (
            <Box
              key={ind}
              className={
                val.title.toLowerCase() === 'geckoterminal'
                  ? 'noFill socialGrid'
                  : 'svgFill'
              }
            >
              <a href={val.link} target='_blank' rel='noopener noreferrer'>

                {val.icon}
                <p>{val.title}</p>
              </a>
            </Box>
          ))}
        </Box>
      </Box>
    </div>
  );
};

export default LandingPage;
