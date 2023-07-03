import React from 'react';
import { useMediaQuery, useTheme } from '@material-ui/core';

const AdsSlider: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  return (
    <div className='flex justify-center'>
      {isMobile ? (
        <div
          className='_0cbf1c3d417e250a'
          data-placement='0d0cfcd486a34feaa39ee2bf22c383ce'
          style={{
            width: 320,
            height: 50,
            display: 'inline-block',
            margin: '0 auto',
          }}
        />
      ) : (
        <div
          className='_0cbf1c3d417e250a'
          data-placement='b694dc6256a744bdb31467ccec38def3'
          style={{
            width: 970,
            height: 90,
            display: 'inline-block',
            margin: '0 auto',
          }}
        />
      )}
    </div>
  );
};

export default React.memo(AdsSlider);
