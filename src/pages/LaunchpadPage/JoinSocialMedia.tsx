'use client';
import React from 'react';
import { Button, Box, Typography } from '@material-ui/core';
import { TelegramIcon, TwitterIcon } from './SocialIcon';
import { Link } from 'react-router-dom';
import SocialMediaBg from 'assets/images/launchpad/social_media_bg.png';

const JoinSocialMedia: React.FC = () => {
  return (
    <Box className='section socialMediaSection'>
      <Box className='cover_title'>
        <Typography className='title2'>Follow on Social Media</Typography>
        <Typography className='desc'>
          Follow QuickLaunch on social media channels for exclusive updates on
          upcoming crypto launches, industry insights, and real-time
          discussions. Connect with like-minded individuals and be the first to
          know about the latest opportunities for IDOs on Polygon.
        </Typography>
      </Box>
      <Box className='cover_social_icons'>
        <a
          href='https://t.me/QuickLaunchOfficial'
          target='_blank'
          rel='noreferrer'
        >
          <TelegramIcon className='social_icon'></TelegramIcon>
        </a>
        <a
          href='https://x.com/quickswapdex?s=21&t=nQjWO49uC8GB7M59QlcWjQ'
          target='_blank'
          rel='noreferrer'
        >
          <TwitterIcon className='social_icon'></TwitterIcon>
        </a>
      </Box>
      <Box className='social_media_bg'>
        <img src={SocialMediaBg} alt='social-media-bg' />
      </Box>
    </Box>
  );
};

export default JoinSocialMedia;
