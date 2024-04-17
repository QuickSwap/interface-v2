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
import { ReactComponent as ArrowAhead } from '../../assets/images/landingPage/arrow_ahead.svg';
import BGSHINE from '../../assets/images/shine.webp';
import NewTag from 'assets/images/NewTag.png';

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
        { title: t('perpsV1'), link: '/' },
        { title: t('perpsFalkor'), link: '/', isNew: true },
        { title: t('pool'), link: '/pools' },
        { title: t('farm'), link: '/farm' },
        { title: t('bonds'), link: '/onds' },
      ],
    },
    {
      title: '',
      items: [
        { title: t('dragonslair'), link: '/dragons' },
        { title: t('gamingHub'), link: '/' },
        { title: t('leaderboard'), link: '/' },
        { title: t('convert'), link: '/convert' },
        { title: t('dappos'), link: '/' },
        { title: t('analytics'), link: '/analytics' },
      ],
    },
    {
      title: t('developers'),
      items: [
        { title: t('github'), link: 'https://github.com/QuickSwap' },
        { title: t('gitBook'), link: '' },
        { title: t('docs'), link: 'https://docs.quickswap.exchange/' },
      ],
    },
    {
      title: t('governance'),
      items: [
        { title: t('proposals'), link: 'https://snapshot.org/#/quickvote.eth' },
        { title: t('vote'), link: '' },
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
        <Grid container spacing={2} className='socialMenuWrapper'>
          <Grid item container xs={12} sm={12} md={8} spacing={2}>
            {socialMenuItems.map((item) => (
              <Grid key={item.title} item xs={6} sm={6} md={3}>
                <small
                  className={
                    item.title == ''
                      ? 'footer-text margin-extra'
                      : 'footer-title'
                  }
                >
                  {item.title}
                </small>
                <Box mt={3} className='footer_links'>
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
                      {socialItem.isNew ? (
                        <div className='mobile-new-tag'>
                          <small className='footer-text'>
                            {socialItem.title}
                          </small>
                          <img
                            src={NewTag}
                            alt='new menu'
                            className='new-tag'
                            width={46}
                          />
                        </div>
                      ) : (
                        <small className='footer-text'>
                          {socialItem.title}
                        </small>
                      )}
                    </Box>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
          <Grid item xs={12} sm={12} md={4} className='email_input'>
            {/* shiny img */}
            <img src={BGSHINE} className='bg_shine' alt='' />

            <picture>
              <source height={40} srcSet={QUICKLogoWebP} type='image/webp' />
              <img src={QUICKLogo} alt='QUICK' height={40} />
            </picture>
            <Box mt={2} maxWidth='318px'>
              <small className='text-secondary'>{t('socialDescription')}</small>
            </Box>
            <Box mt={2} id='footerNewsletterSignup'>
              <small className='text-grey'>{t('signupnewsletter')}</small>
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
                  <ArrowAhead />
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
        </Grid>
        <Box
          className={`copyrightWrapper ${
            tabletWindowSize ? 'copyright-mobile' : ''
          }`}
        >
          <small className='text-secondary'>
            © {copyrightYear} QuickSwap. All rights reserved.
          </small>
          {tabletWindowSize && <hr className='divider-mobile'></hr>}
          <small className='text-secondary'>
            <Link className='footer-link' to='/tos'>
              {t('termsofuse')}
            </Link>
          </small>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
