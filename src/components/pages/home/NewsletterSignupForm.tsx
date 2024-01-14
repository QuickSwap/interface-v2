import React, { useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';
import styles from 'styles/pages/Home.module.scss';

const NewsletterSignupForm: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const { mutate, isLoading, data } = useSubscribeNewsletter();
  const handleSignup = async () => {
    await mutate(email);
  };

  return (
    <Box className={styles.newsletterSignupWrapper}>
      <Box>
        <p>{t('dragonDispatch')}</p>
        <h4>{t('newsletterSignup')}</h4>
        <small className='text-primaryText'>
          {t('newsletterSignupDesc')}&nbsp;
          <b>{t('earn300QUICK')}</b>
        </small>
      </Box>
      <Box className={styles.newsletterSignupFormWrapper}>
        <Box className={styles.newsletterSignupForm}>
          <input
            type='email'
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
            {t('signup')}
          </Button>
        </Box>
        {data && (
          <Box mt={1} textAlign='center'>
            {data.data && (
              <small className='text-success'>{t('subscribeSuccess')}</small>
            )}
            {data.error && (
              <small className='text-error'>{t('subscribeError')}</small>
            )}
          </Box>
        )}
      </Box>
      <img src='/assets/images/newsletterBg.svg' />
    </Box>
  );
};

export default NewsletterSignupForm;
