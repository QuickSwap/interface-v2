'use client';
import React from 'react';
// import Image from 'next/image';
// import Button from 'components/common/Button';
// import { useRouter } from 'next/navigation';
import { Button, Box, Typography } from '@material-ui/core';

const HeroSection: React.FC<{
  caseLaunch: number;
  openModal?: boolean;
  setOpenModal?: any;
}> = ({ caseLaunch, openModal, setOpenModal }) => {
  const handleClick = () => {
    setOpenModal(!openModal);
  };
  return (
    <Box className='heroSection'>
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
            handleClick;
          }}
        >
          {caseLaunch !== 0 ? 'Get started' : 'Join The QuickLaunch Waitlist'}
        </Button>
      </Box>
    </Box>
  );
};

export default HeroSection;
