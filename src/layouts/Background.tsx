import React from 'react';
import { Box } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import HeroBkg from 'assets/images/heroBkg.png';
import HeroBkgWebp from 'assets/images/heroBkg.webp';
import defaultHeroBkg from 'assets/images/heroBkg.svg';

const Background: React.FC<{ fallback: boolean | undefined }> = ({
  fallback = false,
}) => {
  const { pathname } = useLocation();
  const showDefaultBG = fallback || pathname !== '/';
  return (
    <Box className='heroBkg'>
      <picture className={showDefaultBG ? 'hidden' : ''}>
        <source srcSet={HeroBkgWebp} type='image/webp' />
        <img src={HeroBkg} alt='Hero Background' />
      </picture>
      <img
        className={showDefaultBG ? '' : 'hidden'}
        src={defaultHeroBkg}
        alt='Hero Background'
      />
    </Box>
  );
};

export default React.memo(Background);
