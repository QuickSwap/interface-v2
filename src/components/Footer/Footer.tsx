import React, { useState } from 'react';
import {
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  Button,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/router';
import styles from 'styles/components/Footer.module.scss';
import { useTranslation } from 'next-i18next';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';
import Image from 'next/image';

const Footer: React.FC = () => {
  const router = useRouter();
  const copyrightYear = new Date().getFullYear();
  const { t } = useTranslation();
  const theme = useTheme();
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('sm'));

  const socialMenuItems = [
    {
      title: t('services'),
      items: [
        { title: t('swap'), link: '/swap' },
        { title: t('pool'), link: '/pools' },
        { title: t('farm'), link: '/farm' },
        { title: t('dragonslair'), link: '/dragons' },
        { title: t('convert'), link: '/convert' },
        { title: t('calculator'), link: '/calculator/0.01-eth-to-usd' },
        { title: t('analytics'), link: '/analytics' },
      ],
    },
    {
      title: t('developers'),
      items: [
        { title: t('github'), link: 'https://github.com/QuickSwap' },
        { title: t('docs'), link: 'https://docs.quickswap.exchange/' },
      ],
    },
    {
      title: t('governance'),
      items: [
        { title: t('proposals'), link: 'https://snapshot.org/#/quickvote.eth' },
      ],
    },
  ];

  const [email, setEmail] = useState('');
  const { mutate, isLoading, data } = useSubscribeNewsletter();
  const handleSignup = async () => {
    await mutate(email);
  };

  return (
    <Box className={styles.footer}>
      <Box className={styles.footerContainer}>
        <Grid container spacing={4} className={styles.socialMenuWrapper}>
          <Grid item xs={12} sm={12} md={4}>
            <Image
              src='/assets/images/quickLogo.png'
              alt='QUICK'
              width={130}
              height={40}
            />
            <Box mt={2} maxWidth='240px'>
              <small className='text-secondary'>{t('socialDescription')}</small>
            </Box>
            <Box mt={2} id='footerNewsletterSignup'>
              <small className='text-secondary'>{t('signupnewsletter')}</small>
              <Box className={styles.newsletterInput}>
                <input
                  placeholder={t('enterEmail') ?? ''}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button disabled={isLoading} onClick={handleSignup}>
                  {isLoading && (
                    <CircularProgress
                      size='20px'
                      style={{ color: 'white', marginRight: 5 }}
                    />
                  )}
                  {t('signup')}
                </Button>
              </Box>
              {data && (
                <Box mt={1} textAlign='center'>
                  {data.data && (
                    <span className='text-success'>
                      {t('subscribeSuccess')}
                    </span>
                  )}
                  {data.error && (
                    <span className='text-error'>{t('subscribeError')}</span>
                  )}
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item container xs={12} sm={12} md={8} spacing={4}>
            {socialMenuItems.map((item) => (
              <Grid key={item.title} item xs={12} sm={6} md={4}>
                <small>{item.title}</small>
                <Box mt={3}>
                  {item.items.map((socialItem) => (
                    <Box
                      key={socialItem.title}
                      className='cursor-pointer'
                      my={1.5}
                      onClick={() => {
                        if (socialItem.link.includes('http')) {
                          window.open(socialItem.link, '_blank');
                        } else {
                          router.push(socialItem.link);
                        }
                      }}
                    >
                      <small className='text-secondary'>
                        {socialItem.title}
                      </small>
                    </Box>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Box
          className={`${styles.copyrightWrapper} ${
            tabletWindowSize ? styles.copyrightMobile : ''
          }`}
        >
          <small className='text-secondary'>© {copyrightYear} QuickSwap</small>
          <small className='text-secondary'>
            <a
              className={styles.footerLink}
              href='https://docs.google.com/document/d/1Gglh43oxUZHdgrS2L9lZfsI4f6HYNF6MbBDsDPJVFkM/edit'
              target='_blank'
              rel='noreferrer'
            >
              {t('termsofuse')}
            </a>
          </small>
          {!tabletWindowSize && router.pathname === '/' && (
            <Box className={styles.fakeCommunityContainer}>&nbsp;</Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
