import React from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';

const Background: React.FC<{ fallback: boolean | undefined }> = ({
  fallback = false,
}) => {
  const router = useRouter();
  const showDefaultBG = fallback || router.pathname !== '/';
  return (
    <Box className='heroBkg'>
      <picture>
        <img
          className={showDefaultBG ? 'hidden' : ''}
          src='/assets/images/heroBkg.png'
          alt='Hero Background'
        />
      </picture>
      <picture>
        <img
          className={showDefaultBG ? '' : 'hidden'}
          src='/assets/images/heroBkg.svg'
          alt='Hero Background'
        />
      </picture>
    </Box>
  );
};

export default React.memo(Background);
