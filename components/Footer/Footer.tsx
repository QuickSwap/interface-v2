import React from 'react';
import { Box, Grid } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from 'styles/components/Footer.module.scss';

const Footer: React.FC = () => {
  const router = useRouter();
  const copyrightYear = new Date().getFullYear();

  const socialMenuItems = [
    {
      title: 'Services',
      items: [
        { title: 'Swap', link: '/swap' },
        { title: 'Pool', link: '/pools/v3' },
        { title: 'Farm', link: '/farm/v3' },
        { title: 'Dragons Lair', link: '/dragons' },
        { title: 'Convert', link: '/convert' },
        { title: 'Analytics', link: '/analytics/total' },
      ],
    },
    {
      title: 'Developers',
      items: [
        { title: 'Github', link: 'https://github.com/QuickSwap' },
        { title: 'Docs', link: 'https://docs.quickswap.exchange/' },
      ],
    },
    {
      title: 'Governance',
      items: [
        { title: 'Proposals', link: 'https://snapshot.org/#/quickvote.eth' },
      ],
    },
  ];

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
              <small className='text-secondary'>
                Our community is building a comprehensive decentralized trading
                platform for the future of finance. Join us!
              </small>
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
        <Box className={styles.copyrightWrapper}>
          <small className='text-secondary'>© {copyrightYear} QuickSwap.</small>
          <small className='text-secondary'>Terms of Use</small>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
