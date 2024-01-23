import React from 'react';
import {
  Box,
  Grid,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import { ExpandMoreOutlined } from '@mui/icons-material';
import { useTranslation, Trans } from 'next-i18next';
import styles from 'styles/pages/Home.module.scss';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config/index';
import { HypeLabAds, TopMovers, RewardSlider } from 'components';
import NewsletterSignupForm from 'components/pages/home/NewsletterSignupForm';
import GlobalSection from 'components/pages/home/GlobalSection';
import SwapSection from 'components/pages/home/SwapSection';
import BuyFiatSection from 'components/pages/home/BuyFiatSection';
import BuySpritzSection from 'components/pages/home/BuySpritzSection';
import { useRouter } from 'next/router';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Motif from 'svgs/Motif.svg';
import Image from 'next/image';

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
      link: 'https://twitter.com/QuickswapDEX',
      icon: '/assets/images/social/X.png',
      title: 'X',
    },
    {
      link: 'https://t.me/QuickSwapDEX',
      icon: '/assets/images/social/Telegram.svg',
      title: 'Telegram',
    },
    {
      link: 'https://t.me/QuickSwapAnnouncements',
      icon: '/assets/images/social/Telegram.svg',
      title: 'Announcement',
    },
    {
      link: 'https://discord.gg/dSMd7AFH36',
      icon: '/assets/images/social/Discord.svg',
      title: 'Discord',
    },
    {
      link: 'https://blog.quickswap.exchange/',
      icon: '/assets/images/social/Blog.svg',
      title: 'Blog',
    },
    {
      link: 'https://www.youtube.com/@quickswapofficial',
      icon: '/assets/images/social/YouTube.svg',
      title: 'Youtube',
    },
    {
      link: 'https://www.reddit.com/r/QuickSwap/',
      icon: '/assets/images/social/Reddit.svg',
      title: 'Reddit',
    },
    {
      link: 'https://www.tiktok.com/@quickswapofficial',
      icon: '/assets/images/social/TikTok_Qs.png',
      title: 'TikTok',
    },
    {
      link: 'https://www.instagram.com/quickswapofficial',
      icon: '/assets/images/social/instagram.png',
      title: 'Instagram',
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
      link: 'https://coinpaprika.com/exchanges/quickswap-v3/',
      icon: '/assets/images/social/coinpaprika-logo.png',
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

  return (
    <>
      <GlobalSection />
      <Box className={styles.smallCommunityContainer}>
        {socialicons.map((val, ind) => (
          <Box key={ind} mx={1.5} position='relative' width={32} height={32}>
            <a href={val.link} target='_blank' rel='noopener noreferrer'>
              <Image src={val.icon} alt='social icons' layout='fill' />
            </a>
          </Box>
        ))}
      </Box>
      <Box mt={2} width={1}>
        <TopMovers />
      </Box>
      <Box margin='32px auto'>
        <HypeLabAds />
      </Box>
      <Box className={styles.quickInfo}>
        <h4>{t('quickInfoTitle')}</h4>
        <Motif />
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
              router.push('/farm/v3');
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
            <Grid
              item
              alignItems='center'
              sm={12}
              md={6}
              key={index}
              className={styles.featureContainerItem}
            >
              <Box className={styles.featureContainerImage}>
                <Image src={val.img} alt={val.title} layout='fill' />
              </Box>
              <Box className={styles.featureText}>
                <h5>{val.title}</h5>
                <p>{val.desc}</p>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box my={4}>
        <NewsletterSignupForm />
      </Box>
      <Box className={styles.communityContainer}>
        <Box className={styles.featureHeading}>
          <h3>{t('faqs')}</h3>
          <Box className={styles.featureDivider} />
        </Box>
        <Box>
          {faqs.map((val, i) => (
            <Accordion key={`accordation-${i}`}>
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
                  width={64}
                  height={64}
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
