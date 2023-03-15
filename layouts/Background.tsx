import React from 'react';
import { Box } from '@mui/material';

const Background: React.FC<{ fallback: boolean | undefined }> = ({
  fallback = false,
}) => {
  const showDefaultBG = fallback;
  return (
    <Box className='heroBkg'>
      <img
        className={showDefaultBG ? 'hidden' : ''}
        src='assets/images/heroBkg.png'
        alt='Hero Background'
      />
      <img
        className={showDefaultBG ? '' : 'hidden'}
        src='assets/images/heroBkg.svg'
        alt='Hero Background'
      />
    </Box>
  );
};

export default React.memo(Background);
