'use client';
import React from 'react';
import { Button, Box, Typography } from '@material-ui/core';
import TrustswapLogo from 'assets/images/launchpad/trustswap_logo_white.png';

const HeroSection: React.FC<{
  caseLaunch: number;
  openModal?: boolean;
  setOpenModal?: any;
}> = ({ caseLaunch, openModal, setOpenModal }) => {
  const handleClick = () => {
    setOpenModal(!openModal);
  };
  return (
    <Box className='section launchHeroSection'>
      <Box
        style={{
          background: '#448aff29',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingTop: '8px',
          paddingBottom: '8px',
          marginBottom: '24px',
          color: '#61F3F3',
          borderRadius: '16px',
        }}
      >
        <Typography style={{ fontSize: '16px', fontWeight: '700' }}>
          Coming Soon
        </Typography>
      </Box>
      <Box className='cover_title'>
        <Typography className='title' style={{ color: '#f6f6f9' }}>
          Get exclusive early access to new project IDOs on Polygon
        </Typography>
      </Box>
      <Box className='cover_sub_title'>
        <Typography
          className='subTitle'
          style={{
            color: '#ccd8e7',
          }}
        >
          Web3 projects you can trust, supported by industry-leading creators
          and funds.
        </Typography>
      </Box>
      <Box mt={2} height={48}>
        <Button
          fullWidth
          className='bg-blue1 p'
          style={{
            borderRadius: '12px',
            height: '100%',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
          onClick={() => {
            handleClick();
          }}
        >
          {caseLaunch !== 0 ? 'Get started' : 'Join The QuickLaunch Waitlist'}
        </Button>
      </Box>
      <Box
        style={{
          display: 'flex',
          alignItems: 'end',
          gap: '8px',
          justifyContent: 'center',
          marginTop: '64px',
        }}
      >
        <p
          style={{
            textTransform: 'uppercase',
            color: '#636780',
            fontSize: '12px',
          }}
        >
          Powered by
        </p>
        <img src={TrustswapLogo} alt='poweredby' style={{ height: '25px' }} />
      </Box>
    </Box>
  );
};

export default HeroSection;
