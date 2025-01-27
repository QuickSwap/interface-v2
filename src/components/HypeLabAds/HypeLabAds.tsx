import React from 'react';
import { useMediaQuery, useTheme } from '@material-ui/core';
import { Banner } from '@hypelab/sdk-react';

const HypeLabAds: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  return (
    <div className='flex justify-center'>
      {isMobile && <Banner placement='4177d327af' />}
      {!isMobile && <Banner placement='f70b3ef021' />}
    </div>
  );
};

export default HypeLabAds;
