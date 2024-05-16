import React from 'react';
import { Box } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import HeroBkg from 'assets/images/banner.png';
import HeroBkgWebp from 'assets/images/banner.png';
import defaultHeroBkg from 'assets/images/heroBkg.svg';
import layer from 'assets/images/layer1.png';
import layer2 from 'assets/images/BottomWave.png';
import layer3 from 'assets/images/layer3.png';

const Background: React.FC<{ fallback: boolean | undefined }> = ({
  fallback = false,
}) => {
  const { pathname } = useLocation();
  const showDefaultBG = fallback || pathname !== '/';
  return (
    <Box className='heroBkg'>
      {/* <picture className={showDefaultBG ? 'hidden' : ''}> */}
      {/* <source srcSet={HeroBkgWebp} type='image/webp' /> */}
      <img
        src={HeroBkg}
        alt='Hero Background'
        style={{ maxWidth: '1440px', position: 'absolute', right: 0 }}
      />
      {/* </picture> */}
      <img
        className={showDefaultBG ? '' : 'hidden'}
        src={defaultHeroBkg}
        alt='Hero Background'
      />
      <img src={layer} alt='layer' style={{ position: 'absolute', left: 0 }} />
      <img
        src={layer2}
        alt='wave'
        style={{
          position: 'absolute',
          top: '42%',
          left: 0,
        }}
      />
      <img
        src={layer2}
        alt='layer 3'
        style={{
          position: 'absolute',
          top: '72%',
          left: 0,
        }}
      />
      {/* <img src={layer} alt='layer' /> */}
      {/* <img src={layer2} alt='layer2' /> */}
    </Box>
  );
};

export default React.memo(Background);
