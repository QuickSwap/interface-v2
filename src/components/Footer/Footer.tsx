import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import QUICKLogo from 'assets/images/quickLogo.png';
import QUICKLogoWebP from 'assets/images/quickLogo.webp';
import Fire from 'assets/images/fire-new.svg';
import 'components/styles/Footer.scss';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';
import CallMadeIcon from '@material-ui/icons/CallMade';

const Footer: React.FC = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const copyrightYear = new Date().getFullYear();
  const { t } = useTranslation();
  const theme = useTheme();
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('sm'));

  const socialMenuItems = [
    {
      title: t('Products'),
      items: [
        { title: t('swap'), link: '/swap' },
        { title: t('PersV1'), link: '/convert' },
        { title: 'Perps: Falkor', link: '/convert', isNew: true },
        { title: t('pool'), link: '/pools' },
        { title: t('farm'), link: '/farm' },
        { title: t('Bonds'), link: '/dragons' },
      ],
    },
    {
      items: [
        { title: t('dragonslair'), link: '/dragons' },
        { title: t('Gaming Hub'), link: '/dragons' },
        { title: t('Leaderboard'), link: '/dragons' },
        { title: t('Convert QUICK'), link: '/convert' },
        { title: t('dappOS'), link: '/calculator/0.01-eth-to-usd' },
        { title: t('analytics'), link: '/analytics' },
      ],
    },
    {
      title: t('developers'),
      items: [
        { title: t('github'), link: 'https://github.com/QuickSwap' },
        { title: t('gitbook'), link: 'https://github.com/QuickSwap' },
        { title: t('docs'), link: 'https://docs.quickswap.exchange/' },
      ],
    },
    {
      title: t('governance'),
      items: [
        { title: t('proposals'), link: 'https://snapshot.org/#/quickvote.eth' },
        { title: t('vote'), link: 'https://snapshot.org/#/quickvote.eth' },
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
          <Grid item container xs={12} sm={12} md={8} spacing={4}>
            {socialMenuItems.map((item) => (
              <Grid key={item.title} item xs={6} sm={6} md={3}>
                <small style={{ height: '17px' }}>{item.title} &emsp;</small>
                <Box mt={3}>
                  {item.items.map((socialItem: any) => (
                    <Box
                      key={socialItem.title}
                      className='cursor-pointer'
                      my={1.5}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
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
                      {socialItem.isNew && <img src={Fire} alt='fire' />}
                    </Box>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <picture>
              <source height={40} srcSet={QUICKLogoWebP} type='image/webp' />
              <img src={QUICKLogo} alt='QUICK' height={40} />
            </picture>
            <Box mt={2} maxWidth='240px'>
              <small className='text-secondary'>{t('socialDescription')}</small>
            </Box>
            <Box mt={2} id='footerNewsletterSignup'>
              <small
                className='text-secondary'
                style={{ color: '#cedaeb', fontWeight: 600 }}
              >
                {t('subNewsletter')}
              </small>
              <Box className='newsletterInput'>
                <input
                  placeholder={t('enterEmail')}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  onClick={handleSignup}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CallMadeIcon
                    style={{
                      transform: 'rotate(45deg)',
                      width: '18px',
                      height: '18px',
                      color: '#448aff',
                      marginTop: '4px',
                    }}
                  />
                </button>
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
        </Grid>
        {tabletWindowSize && (
          <Box>
            <Typography
              style={{
                marginBottom: '16px',
                fontSize: '12px',
                color: '#6880a3',
              }}
            >
              Terms of Use
            </Typography>
          </Box>
        )}
        <Box
          className={`copyrightWrapper ${
            tabletWindowSize ? 'copyright-mobile' : ''
          }`}
        >
          <small className='text-secondary'>
            © {copyrightYear} QuickSwap. &nbsp;
          </small>
          <small className='text-secondary'>
            <Link className='footer-link' to='/tos'>
              {t('allRights')}
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
