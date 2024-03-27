import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  useMediaQuery,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import QUICKLogo from 'assets/images/quickLogo.png';
import QUICKLogoWebP from 'assets/images/quickLogo.webp';
import 'components/styles/Footer.scss';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';

const Footer: React.FC = () => {
  const history = useHistory();
  const { pathname } = useLocation();
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
    <Box className='footer'>
      <Box className='footerContainer'>
        <Grid container spacing={4} className='socialMenuWrapper'>
          <Grid item xs={12} sm={12} md={4}>
            <picture>
              <source srcSet={QUICKLogoWebP} type='image/webp' />
              <img src={QUICKLogo} alt='QUICK' />
            </picture>
            <Box mt={2} maxWidth='240px'>
              <small className='text-secondary'>{t('socialDescription')}</small>
            </Box>
            <Box mt={2} id='footerNewsletterSignup'>
              <small className='text-secondary'>{t('signupnewsletter')}</small>
              <Box className='newsletterInput'>
                <input
                  placeholder={t('enterEmail')}
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
                          history.push(socialItem.link);
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
          className={`copyrightWrapper ${
            tabletWindowSize ? 'copyright-mobile' : ''
          }`}
        >
          <small className='text-secondary'>© {copyrightYear} QuickSwap</small>
          <small className='text-secondary'>
            <Link className='footer-link' to='/tos'>
              {t('termsofuse')}
            </Link>
          </small>
          {!tabletWindowSize && pathname === '/' && (
            <Box className='fake-community-container'>&nbsp;</Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
