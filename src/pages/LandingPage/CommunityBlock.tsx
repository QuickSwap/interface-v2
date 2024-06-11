import {
  Box,
  Button,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { ReactComponent as BlogIcon } from 'assets/images/social/Blog.svg';
import { ReactComponent as CoingeckoIcon } from 'assets/images/social/Coingecko.svg';
import { ReactComponent as DiscordIcon } from 'assets/images/social/Discord.svg';
import { ReactComponent as GeckoterminalIcon } from 'assets/images/social/Geckoterminal.svg';
import { ReactComponent as RedditIcon } from 'assets/images/social/Reddit.svg';
import { ReactComponent as TelegramIcon } from 'assets/images/social/Telegram.svg';
import { ReactComponent as Announcement } from 'assets/images/social/announcement.svg';
import { ReactComponent as YouTubeIcon } from 'assets/images/social/YouTube.svg';
import { ReactComponent as Medium } from 'assets/images/social/Medium.svg';
import CoinmarketCap from 'assets/images/social/coin-market-cap.webp';
import TikTokIcon from 'assets/images/social/TikTok_Qs.png';
import XIcon from 'assets/images/social/X.png';
import CoinpaprikaIcon from 'assets/images/social/coinpaprika-logo.png';
import InstagramIcon from 'assets/images/social/instagram.png';
import { useTranslation } from 'react-i18next';
import EastIcon from '@material-ui/icons';
import CallMadeIcon from '@material-ui/icons/CallMade';
// interface CommunityBlockProps {}
import layer3 from 'assets/images/layer3.png';

const CommunityBlock: React.FC = ({}) => {
  const { t } = useTranslation();

  const socialicons = [
    {
      link: 'https://twitter.com/QuickswapDEX',
      icon: <img src={XIcon} alt='X' />,
      title: 'X',
    },
    {
      link: 'https://t.me/QuickSwapDEX',
      icon: <TelegramIcon />,
      title: 'Telegram',
    },
    {
      link: 'https://t.me/QuickSwapAnnouncements',
      icon: <Announcement />,
      title: 'Announcements',
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
      link: 'https://www.youtube.com/@quickswapofficial',
      icon: <YouTubeIcon />,
      title: 'Youtube',
    },
    {
      link: 'https://www.reddit.com/r/QuickSwap/',
      icon: <RedditIcon />,
      title: 'Reddit',
    },
    {
      link: 'https://quickswap-layer2.medium.com/',
      icon: <Medium />,
      title: 'Medium',
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
    {
      link: 'https://coinmarketcap.com/currencies/quickswap/',
      icon: <img src={CoinmarketCap} alt='CoinmarketCapp' />,
      title: 'CoinMarketCap',
    },
  ];

  return (
    <Grid
      container
      className='cover_community_content'
      style={{
        borderRadius: '24px',
        backgroundColor: '#9b9b9b0f',
        backdropFilter: 'blur(40px)',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <img
        src={layer3}
        alt='layer'
        style={{
          position: 'absolute',
          right: '-40%',
          marginTop: 10,
          top: '-40%',
          width: '200%',
          height: '200%',
          filter: 'none',
          objectFit: 'contain',
          objectPosition: 'right',
        }}
      />
      <Grid item sm={12} md={6}>
        <Box className='cover_content'>
          <Typography
            className='title'
            style={{
              color: '#448aff',
              fontWeight: 600,
              lineHeight: '1.28',
              marginBottom: '16px',
            }}
          >
            {t('subscribeToQuickSwap')}
          </Typography>
          <Typography
            className='desc'
            style={{
              color: '#ccd8e7',
              lineHeight: '1.63',
              marginBottom: '32px',
            }}
          >
            {t('subscribeDesc')}
          </Typography>
          <Box
            className='email_form'
            component='form'
            style={{
              padding: '15px 20px',
              display: 'flex',
              alignItems: 'center',
              height: 50,
              borderRadius: '12px',
              backgroundColor: 'rgb(0 0 0 / 12%)',
            }}
          >
            <InputBase
              className='email_input'
              style={{ flex: 1, fontSize: '16px', color: '#fff' }}
              placeholder='Enter Email'
              inputProps={{ 'aria-label': 'Enter Email' }}
            />
            <button
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: '.3s ease-in-out',
                width: '18px',
                height: '18px',
                cursor: 'pointer',
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
        </Box>
      </Grid>
      <Grid item sm={12} md={6}>
        <Grid container spacing={4} className='cover_social_list'>
          {socialicons.map((val, ind) => (
            <Grid item key={ind} xs={4} sm={3}>
              <Box
                className={
                  val.title.toLowerCase() === 'geckoterminal'
                    ? 'noFill'
                    : 'svgFill'
                }
              >
                <a href={val.link} target='_blank' rel='noopener noreferrer'>
                  {val.icon}
                  <Typography style={{ color: '#fff' }}>{val.title}</Typography>
                </a>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default CommunityBlock;
