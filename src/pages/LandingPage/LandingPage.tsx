import React, { lazy, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Typography,
} from '@material-ui/core';
import { ExpandMoreOutlined } from '@material-ui/icons';
import { useTranslation, Trans } from 'react-i18next';
import Motif from 'assets/images/Motif.svg';
import BuyWithFiat from 'assets/images/featured/BuyWithFiatNoPad.png';
import Analytics from 'assets/images/featured/Analytics.svg';
import DragonsLair from 'assets/images/featured/DragonsLair.svg';
import ProvideLiquidity from 'assets/images/featured/ProvideLiquidity.svg';
import Rewards from 'assets/images/featured/Rewards.svg';
import FeaturedSwap from 'assets/images/featured/Swap.svg';
import { ReactComponent as CoingeckoIcon } from 'assets/images/social/Coingecko.svg';
import { ReactComponent as DiscordIcon } from 'assets/images/social/Discord.svg';
import { ReactComponent as BlogIcon } from 'assets/images/social/Blog.svg';
import { ReactComponent as RedditIcon } from 'assets/images/social/Reddit.svg';
import { ReactComponent as MediumIcon } from 'assets/images/social/Medium.svg';
import { ReactComponent as TelegramIcon } from 'assets/images/social/Telegram.svg';
import { ReactComponent as TwitterIcon } from 'assets/images/social/Twitter.svg';
import { ReactComponent as YouTubeIcon } from 'assets/images/social/YouTube.svg';
import { ReactComponent as GeckoterminalIcon } from 'assets/images/social/Geckoterminal.svg';
import TikTokIcon from 'assets/images/social/TikTok_Qs.png';
import CoinpaprikaIcon from 'assets/images/social/coinpaprika-logo.png';
import InstagramIcon from 'assets/images/social/instagram.png';
import 'pages/styles/landing.scss';
import { useIsV2 } from 'state/application/hooks';
import { getConfig } from 'config';
import { useActiveWeb3React } from 'hooks';

const SwapSection = lazy(() => import('./SwapSection'));
const BuyFiatSection = lazy(() => import('./BuyFiatSection'));
const GlobalSection = lazy(() => import('./GlobalSection'));
const BuySpritzSection = lazy(() => import('./BuySpritzSection'));
const TopMovers = lazy(() => import('components/TopMovers'));
const RewardSlider = lazy(() => import('components/RewardSlider'));

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const isFarmAvailable = config['farm']['available'];

  const features = [
    {
      img: FeaturedSwap,
      title: t('swapTokens'),
      desc: t('featureTradeDesc'),
    },
    {
      img: ProvideLiquidity,
      title: t('supplyLiquidity'),
      desc: t('featureLiquidityDesc'),
    },
    {
      img: Rewards,
      title: t('earndQUICK'),
      desc: t('featureDepositDesc'),
    },
    {
      img: DragonsLair,
      title: t('dragonLair'),
      desc: t('featureDragonDesc'),
    },
    {
      img: BuyWithFiat,
      title: t('buyWithFiat'),
      desc: t('featureBuyFiatDesc'),
    },
    {
      img: Analytics,
      title: t('analytics'),
      desc: t('featureAnalyticsDesc'),
    },
  ];

  const socialicons = [
    {
      link: 'https://twitter.com/QuickswapDEX',
      icon: <TwitterIcon />,
      title: 'Twitter',
    },
    {
      link: 'https://t.me/QuickSwapDEX',
      icon: <TelegramIcon />,
      title: 'Telegram',
    },
    {
      link: 'https://t.me/QuickSwapAnnouncements',
      icon: <TelegramIcon />,
      title: 'Announcement',
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
      link: 'https://www.youtube.com/channel/UCrPlF-DBwD-UzLFDzJ4Z5Fw',
      icon: <YouTubeIcon />,
      title: 'Youtube',
    },
    {
      link: 'https://www.reddit.com/r/QuickSwap/',
      icon: <RedditIcon />,
      title: 'Reddit',
    },
    {
      link: 'https://www.tiktok.com/@quickswapofficial',
      icon: <img src={TikTokIcon} alt='TikTok' />,
      title: 'TikTok',
    },
    {
      link: 'https://www.instagram.com/quickswapofficial',
      icon: <img src={InstagramIcon} alt='Instagram' />,
      title: 'Instagram',
    },
    {
      link: 'https://quickswap-layer2.medium.com/',
      icon: <MediumIcon />,
      title: 'Medium',
    },
    {
      link: 'https://www.coingecko.com/en/exchanges/quickswap',
      icon: <CoingeckoIcon />,
      title: 'CoinGecko',
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
  ];

  const faqs = [
    {
      header: t('faq-1-title'),
      content: <Box>{t('faq-1-content')}</Box>,
    },
    {
      header: t('faq-2-title'),
      content: (
        <Box>
          <Trans
            i18nKey='faq-2-content'
            components={{
              underline: <u></u>,
            }}
          />
        </Box>
      ),
    },
    {
      header: t('faq-3-title'),
      content: (
        <Box>
          <Trans
            i18nKey='faq-3-content'
            components={{
              underline: <u></u>,
              break: <br />,
            }}
          />
        </Box>
      ),
    },
    {
      header: t('faq-4-title'),
      content: (
        <Box>
          <Trans
            i18nKey='faq-4-content'
            components={{
              underline: <u></u>,
              break: <br />,
              alink: (
                <a
                  className='text-primary'
                  href='https://snapshot.org/#/quickvote.eth'
                  rel='noreferrer'
                  target='_blank'
                />
              ),
            }}
          />
        </Box>
      ),
    },
    {
      header: t('faq-5-title'),
      content: (
        <Box>
          <Trans
            i18nKey='faq-5-content'
            components={{
              underline: <u></u>,
              break: <br />,
              alink: (
                <a
                  className='text-primary'
                  href='https://quickswap.exchange/#/convert'
                  rel='noreferrer'
                  target='_blank'
                />
              ),
            }}
          />
        </Box>
      ),
    },
    {
      header: t('faq-6-title'),
      content: (
        <Box>
          <Trans
            i18nKey='faq-6-content'
            components={{
              underline: <u></u>,
              break: <br />,
            }}
          />
        </Box>
      ),
    },
    {
      header: t('faq-7-title'),
      content: (
        <Box>
          <Trans
            i18nKey='faq-7-content'
            components={{
              underline: <u></u>,
              break: <br />,
            }}
          />
        </Box>
      ),
    },
  ];

  const history = useHistory();
  const { updateIsV2 } = useIsV2();

  useEffect(() => {
    updateIsV2(false);
  }, [updateIsV2]);

  return (
    <div id='landing-page' style={{ width: '100%' }}>
      <GlobalSection />
      <Box className='smallCommunityContainer'>
        {socialicons.map((val, ind) => (
          <Box
            key={ind}
            mx={1.5}
            className={
              val.title.toLowerCase() === 'geckoterminal' ? 'noFill' : 'svgFill'
            }
          >
            <a href={val.link} target='_blank' rel='noopener noreferrer'>
              {val.icon}
            </a>
          </Box>
        ))}
      </Box>
      <Box mt={2} width={1}>
        <TopMovers />
      </Box>
      <Box className='quickInfo'>
        <h1 className='h4'>{t('quickInfoTitle')}</h1>
        <img src={Motif} alt='Motif' />
      </Box>
      <SwapSection />
      {isFarmAvailable && (
        <Box className='rewardsContainer'>
          <Box maxWidth='80%' width='100%'>
            <h1 className='h4'>{t('earnRewardsbyDeposit')}</h1>
            <p style={{ marginTop: '20px' }}>{t('depositLPTokensRewards')}</p>
          </Box>
          <RewardSlider />
          <Box
            className='allRewardPairs'
            onClick={() => {
              history.push('/farm');
            }}
          >
            <p>{t('seeAllPairs')}</p>
          </Box>
        </Box>
      )}
      <Box margin='100px 0 120px'>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={6}>
            <BuyFiatSection />
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <BuySpritzSection />
          </Grid>
        </Grid>
      </Box>
      <Box className='featureContainer'>
        <Box className='featureHeading'>
          <h3>{t('features')}</h3>
          <Box className='featureDivider' />
        </Box>
        <Grid container spacing={4}>
          {features.map((val, index) => (
            <Grid item container alignItems='center' sm={12} md={6} key={index}>
              <img src={val.img} alt={val.title} />
              <Box className='featureText'>
                <h5>{val.title}</h5>
                <p>{val.desc}</p>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box className='communityContainer'>
        <Box className='featureHeading'>
          <h3>{t('faqs')}</h3>
          <Box className='featureDivider' />
        </Box>
        <Box className=''>
          {faqs.map((val, i) => (
            <Accordion key={`accordation-{i}`}>
              <AccordionSummary
                expandIcon={<ExpandMoreOutlined />}
                aria-controls='panel1a-content'
                id='panel1a-header'
              >
                <Typography>{val.header}</Typography>
              </AccordionSummary>
              <AccordionDetails>{val.content}</AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
      <Box className='communityContainer'>
        <Box className='featureHeading'>
          <h3>{t('joinCommunity')}</h3>
          <Box className='featureDivider' />
        </Box>
        <Box className='socialContent'>
          {socialicons.map((val, ind) => (
            <Box
              key={ind}
              className={
                val.title.toLowerCase() === 'geckoterminal'
                  ? 'noFill'
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
