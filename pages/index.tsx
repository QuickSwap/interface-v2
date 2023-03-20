import React from 'react';
import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CoingeckoIcon from 'svgs/social/Coingecko.svg';
import DiscordIcon from 'svgs/social/Discord.svg';
import MediumIcon from 'svgs/social/Medium.svg';
import RedditIcon from 'svgs/social/Reddit.svg';
import TelegramIcon from 'svgs/social/Telegram.svg';
import TwitterIcon from 'svgs/social/Twitter.svg';
import YouTubeIcon from 'svgs/social/YouTube.svg';
import GeckoterminalIcon from 'svgs/social/Geckoterminal.svg';
import Image from 'next/image';
import styles from 'styles/pages/Home.module.scss';
import GlobalSection from 'components/pages/home/GlobalSection';
import SwapSection from 'components/pages/home/SwapSection';
import BuyFiatSection from 'components/pages/home/BuyFiatSection';
import BuySpritzSection from 'components/pages/home/BuySpritzSection';
import { TopMovers, RewardSlider } from 'components';
import { useRouter } from 'next/router';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const features = [
    {
      img: '/assets/images/featured/Swap.svg',
      title: t('swapTokens'),
      desc: t('featureTradeDesc'),
    },
    {
      img: '/assets/images/featured/ProvideLiquidity.svg',
      title: t('supplyLiquidity'),
      desc: t('featureLiquidityDesc'),
    },
    {
      img: '/assets/images/featured/Rewards.svg',
      title: t('earndQUICK'),
      desc: t('featureDepositDesc'),
    },
    {
      img: '/assets/images/featured/DragonsLair.svg',
      title: t('dragonLair'),
      desc: t('featureDragonDesc'),
    },
    {
      img: '/assets/images/featured/BuyWithFiatNoPad.png',
      title: t('buyWithFiat'),
      desc: t('featureBuyFiatDesc'),
    },
    {
      img: '/assets/images/featured/Analytics.svg',
      title: t('analytics'),
      desc: t('featureAnalyticsDesc'),
    },
  ];

  const socialicons = [
    {
      link: 'https://www.reddit.com/r/QuickSwap/',
      icon: <RedditIcon />,
      title: 'Reddit',
    },
    {
      link: 'https://discord.gg/dSMd7AFH36',
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
    {
      link: 'https://www.geckoterminal.com/polygon_pos/quickswap_v3/pools',
      icon: <GeckoterminalIcon />,
      title: 'GeckoTerminal',
    },
    {
      link: 'https://www.tiktok.com/@quickswapofficial',
      icon: <Image src='/assets/images/TikTok_Qs.png' alt='TikTok' fill />,
      title: 'TikTok',
    },
    {
      link: 'https://t.me/QuickSwapAnnouncements',
      icon: <TelegramIcon />,
      title: 'Announcement',
    },
  ];

  return (
    <div id='landing-page' style={{ width: '100%' }}>
      <GlobalSection />
      <Box className={styles.smallCommunityContainer}>
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
      <Box className={styles.quickInfo}>
        <h4>{t('quickInfoTitle')}</h4>
        <Image src='/images/Motif.svg' alt='Motif' fill />
      </Box>
      <SwapSection />
      <Box className={styles.rewardsContainer}>
        <Box maxWidth='480px' width='100%'>
          <h4>{t('earnRewardsbyDeposit')}</h4>
          <p style={{ marginTop: '20px' }}>{t('depositLPTokensRewards')}</p>
        </Box>
        <RewardSlider />
        <Box
          className={styles.allRewardPairs}
          onClick={() => {
            router.push('/farm');
          }}
        >
          <p>{t('seeAllPairs')}</p>
        </Box>
      </Box>
      <Box mb='120px'>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={6}>
            <BuyFiatSection />
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <BuySpritzSection />
          </Grid>
        </Grid>
      </Box>
      <Box className={styles.featureContainer}>
        <Box className={styles.featureHeading}>
          <h3>{t('features')}</h3>
          <Box className={styles.featureDivider} />
        </Box>
        <Grid container spacing={4}>
          {features.map((val, index) => (
            <Grid item container alignItems='center' sm={12} md={6} key={index}>
              <img src={val.img} alt={val.title} />
              <Box className={styles.featureText}>
                <h5>{val.title}</h5>
                <p>{val.desc}</p>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box className={styles.communityContainer}>
        <Box className={styles.featureHeading}>
          <h3>{t('joinCommunity')}</h3>
          <Box className={styles.featureDivider} />
        </Box>
        <Box className={styles.socialContent}>
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
