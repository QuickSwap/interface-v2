'use client';
import React from 'react';
import { Button, Box, Typography } from '@material-ui/core';
import CtaBg from 'assets/images/launchpad/cta_bg.png';

const CTA: React.FC = () => {
  const handleOpenGoogleForm = () => {
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLSf5C5pJwVt7jNrlO6TmmWdRB1UvLcxYZDbtALJgAlQzwQeOxw/viewform',
      '_blank',
    );
  };

  return (
    <Box className='ctaSection'>
      <Box className='cover_title'>
        <Typography className='title'>
          Ready to launch your project on Polygon with QuickLaunch? Apply below!
        </Typography>
      </Box>
      <Box className='cover-btn'>
        <Button
          fullWidth
          className='bg-blue1 p cta-btn'
          onClick={() => handleOpenGoogleForm()}
        >
          Apply now
        </Button>
      </Box>
      <Box className='cta_bg'>
        <img src={CtaBg} alt='cta-bg' />
      </Box>
    </Box>
  );
};

export default CTA;
