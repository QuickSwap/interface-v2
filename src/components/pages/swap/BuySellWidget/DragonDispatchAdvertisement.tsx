import { Box, Button, CircularProgress } from '@mui/material';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/Swap.module.scss';
import Image from 'next/image';

export const DragonDispatchAdvertisement: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const { mutate, isLoading, data } = useSubscribeNewsletter();
  const handleSignup = async () => {
    await mutate(email);
  };

  return (
    <Box>
      <Box className='flex'>
        <Box>
          <Image
            src='/assets/images/featured/DragonDispatchIcon.png'
            alt='buy with fiat'
            width={47}
            height={47}
          />
        </Box>
        <Box pl={1} className='flex'>
          <Box className='text-white text-lg my-auto'>
            {t('dragonDipatchAd')}
          </Box>
        </Box>
      </Box>
      <Box>
        <Box className='flex items-center'>
          <Box className={styles.newsletterSignupFormSwap}>
            <input
              placeholder={t('enterEmail') ?? ''}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              disabled={isLoading}
              onClick={handleSignup}
              style={{ boxShadow: 'none' }}
            >
              {isLoading && (
                <CircularProgress
                  size='20px'
                  style={{ color: 'white', marginRight: 5 }}
                />
              )}
              {t('subscribe')}
            </Button>
          </Box>
        </Box>
        {data && (
          <Box mt={1} textAlign='center'>
            {data.data && (
              <span className='text-success'>{t('subscribeSuccess')}</span>
            )}
            {data.error && (
              <span className='text-error'>{t('subscribeError')}</span>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
