import React from 'react';
import { Box, Grid } from '@material-ui/core';
import QUICKLogo from 'assets/images/quickLogo.png';
import 'components/styles/Footer.scss';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const history = useHistory();
  const copyrightYear = new Date().getFullYear();
  const { t } = useTranslation();

  const socialMenuItems = [
    {
      title: t('services'),
      items: [
        { title: t('swap'), link: '/swap' },
        { title: t('pool'), link: '/pools' },
        { title: t('farm'), link: '/farm' },
        { title: t('dragonslair'), link: '/dragons' },
        { title: t('convert'), link: '/convert' },
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

  return (
    <Box className='footer'>
      <Box className='footerContainer'>
        <Grid container spacing={4} className='socialMenuWrapper'>
          <Grid item xs={12} sm={12} md={4}>
            <img src={QUICKLogo} alt='QUICK' height={40} />
            <Box mt={2} maxWidth='240px'>
              <small className='text-secondary'>{t('socialDescription')}</small>
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
        <Box className='copyrightWrapper'>
          <small className='text-secondary'>© {copyrightYear} QuickSwap.</small>
          <small className='text-secondary'>{t('termsofuse')}</small>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
