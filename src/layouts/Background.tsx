import React from 'react';
import { Box } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import HeroBkg from 'assets/images/heroBkg.png';
import HeroBkg1 from 'assets/images/heroBkg.svg';

const Background: React.FC<{ fallback: boolean | undefined }> = ({
  fallback = false,
}) => {
  const { pathname } = useLocation();

  if (fallback) {
    return <img src={HeroBkg1} alt='Hero Background' />;
  }
  return (
    <Box className='heroBkg'>
      <img src={pathname === '/' ? HeroBkg : HeroBkg1} alt='Hero Background' />
    </Box>
  );
};

export default React.memo(Background);
