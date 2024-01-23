import React from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Background: React.FC<{ fallback: boolean | undefined }> = ({
  fallback = false,
}) => {
  const router = useRouter();
  const showDefaultBG = fallback || router.pathname !== '/';
  return (
    <Box className='heroBkg'>
      <Image
        className={showDefaultBG ? 'hidden' : ''}
        src='/assets/images/heroBkg.png'
        alt='Hero Background'
        layout='fill'
        objectFit='cover'
      />
      <Image
        className={showDefaultBG ? '' : 'hidden'}
        src='/assets/images/heroBkg.svg'
        alt='Hero Background'
        layout='fill'
        objectFit='cover'
      />
    </Box>
  );
};

export default React.memo(Background);
