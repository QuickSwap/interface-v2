import React from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';

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
        width={4326}
        height={1752}
      />
      <Image
        className={showDefaultBG ? '' : 'hidden'}
        src='/assets/images/heroBkg.svg'
        alt='Hero Background'
        width={270}
        height={150}
      />
    </Box>
  );
};

export default React.memo(Background);
