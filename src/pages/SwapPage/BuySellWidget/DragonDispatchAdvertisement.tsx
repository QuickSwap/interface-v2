import { Box, Button, CircularProgress } from '@material-ui/core';
import DragonDispatchIcon from 'assets/images/featured/DragonDispatchIcon.png';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
          <img
            className='wallet'
            src={DragonDispatchIcon}
            alt='buy with fiat'
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
          <Box className='newsletterSignupFormSwap'>
            <input
              placeholder={t('enterEmail')}
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
