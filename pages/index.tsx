import React from 'react';
import { Box, Grid } from '@mui/material';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import styles from 'styles/pages/Home.module.scss';
import GlobalSection from 'components/pages/home/GlobalSection';
import SwapSection from 'components/pages/home/SwapSection';
import BuyFiatSection from 'components/pages/home/BuyFiatSection';
import BuySpritzSection from 'components/pages/home/BuySpritzSection';
import { TopMovers, RewardSlider } from 'components';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config';

const LandingPage = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const isFarmAvailable = config['farm']['available'];

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
      icon: '/assets/images/social/Reddit.svg',
      title: 'Reddit',
    },
    {
      link: 'https://discord.gg/dSMd7AFH36',
      icon: '/assets/images/social/Discord.svg',
      title: 'Discord',
    },
    {
      link: 'https://twitter.com/QuickswapDEX',
      icon: '/assets/images/social/Twitter.svg',
      title: 'Twitter',
    },
    {
      link: 'https://quickswap-layer2.medium.com/',
      icon: '/assets/images/social/Medium.svg',
      title: 'Medium',
    },
    {
      link: 'https://www.youtube.com/channel/UCrPlF-DBwD-UzLFDzJ4Z5Fw',
      icon: '/assets/images/social/YouTube.svg',
      title: 'Youtube',
    },
    {
      link: 'https://t.me/QuickSwapDEX',
      icon: '/assets/images/social/Telegram.svg',
      title: 'Telegram',
    },
    {
      link: 'https://www.coingecko.com/en/exchanges/quickswap',
      icon: '/assets/images/social/Coingecko.svg',
      title: 'CoinGecko',
    },
    {
      link: 'https://www.geckoterminal.com/polygon_pos/quickswap_v3/pools',
      icon: '/assets/images/social/Geckoterminal.svg',
      title: 'GeckoTerminal',
    },
    {
      link: 'https://www.tiktok.com/@quickswapofficial',
      icon: '/assets/images/social/TikTok_Qs.png',
      title: 'TikTok',
    },
    {
      link: 'https://t.me/QuickSwapAnnouncements',
      icon: '/assets/images/social/Telegram.svg',
      title: 'Announcement',
    },
  ];

  return (
    <>
      <GlobalSection />
      <Box className={styles.smallCommunityContainer}>
        {socialicons.map((val, ind) => (
          <Box key={ind} mx={1.5}>
            <a href={val.link} target='_blank' rel='noopener noreferrer'>
              <Image src={val.icon} alt='social icons' width={64} height={64} />
            </a>
          </Box>
        ))}
      </Box>
      <Box mt={2} width={1}>
        <TopMovers />
      </Box>
      <Box className={styles.quickInfo}>
        <h4>{t('quickInfoTitle')}</h4>
        <Image
          src='/assets/images/Motif.svg'
          alt='Motif'
          width={15}
          height={38}
        />
      </Box>
      <SwapSection />
      {isFarmAvailable && (
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
      <Box>
        <Box className={styles.featureHeading}>
          <h3>{t('features')}</h3>
          <Box className={styles.featureDivider} />
        </Box>
        <Grid container spacing={4} className={styles.featureContainer}>
          {features.map((val, index) => (
            <Grid item container alignItems='center' sm={12} md={6} key={index}>
              <Image src={val.img} alt={val.title} width={150} height={150} />
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
            <Box key={ind}>
              <a href={val.link} target='_blank' rel='noopener noreferrer'>
                <Image
                  src={val.icon}
                  alt='social icons'
                  width={32}
                  height={32}
                />
                <p>{val.title}</p>
              </a>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default LandingPage;
