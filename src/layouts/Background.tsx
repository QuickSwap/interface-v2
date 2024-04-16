import React from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import HeroBkg from 'assets/images/landingPage/Bkg.png';
import defaultHeroBkg from 'assets/images/heroBkg.svg';
import bgMobileDragon from 'assets/images/BGLandingMobile.png';

const Background: React.FC<{ fallback: boolean | undefined }> = ({
  fallback = false,
}) => {
  const { pathname } = useLocation();
  const showDefaultBG = fallback || pathname !== '/';

  const theme = useTheme();
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box className='heroBkg'>
      {tabletWindowSize ? (
        <img
          className={showDefaultBG ? 'hidden' : ''}
          src={bgMobileDragon}
          alt='Hero Background'
        />
      ) : (
        <img
          className={showDefaultBG ? 'hidden' : ''}
          src={HeroBkg}
          alt='Hero Background'
        />
      )}

      <img
        className={showDefaultBG ? '' : 'hidden'}
        src={defaultHeroBkg}
        alt='Hero Background'
      />
    </Box>
  );
};

export default React.memo(Background);
