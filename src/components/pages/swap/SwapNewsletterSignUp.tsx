import React, { useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';
import styles from 'styles/pages/Swap.module.scss';

const SwapNewsletterSignup: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const { mutate, isLoading, data } = useSubscribeNewsletter();
  const handleSignup = async () => {
    await mutate(email);
  };

  return (
    <Box className={`wrapper ${styles.newsletterSignupSwap}`}>
      <p>{t('dragonDispatch')}</p>
      <h4>{t('quickOfficialNewsletter')}</h4>
      <small>
        {t('newsletterSignupDesc')}&nbsp;
        <b>{t('earn300QUICK')}</b>
      </small>
      <Box className={styles.newsletterSignupFormSwap}>
        <input
          placeholder={t('enterEmail') ?? ''}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button disabled={isLoading} onClick={handleSignup}>
          {isLoading && (
            <CircularProgress
              size='20px'
              style={{ color: 'white', marginRight: 5 }}
            />
          )}
          {t('subscribe')}
        </Button>
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
  );
};

export default SwapNewsletterSignup;
