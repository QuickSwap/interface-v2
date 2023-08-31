import React from 'react';
import { useMediaQuery, useTheme } from '@material-ui/core';
import { Banner } from 'hypelab-react';

const HypeLabAds: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  return (
    <div className='flex justify-center'>
      {isMobile && <Banner placement='92d1d5bbde' />}
      {!isMobile && <Banner placement='6a6aec7c5f' />}
    </div>
  );
};

export default HypeLabAds;
