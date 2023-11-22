import React, { useState } from 'react';
import { Box, Button, CircularProgress } from '@material-ui/core';
import 'pages/styles/swap.scss';
import { useTranslation, Trans } from 'react-i18next';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';
import MSB_LOGO from 'assets/images/MSB_Logo.png';

const NewsletterMasaPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const { mutate, isLoading, data } = useSubscribeNewsletter(
    process.env.REACT_APP_CONVERTKIT_MASA_FORM_ID,
  );
  const handleSignup = async () => {
    await mutate({ email });
  };

  return (
    <Box
      width='100%'
      maxWidth='550px'
      padding='32px 0 64px'
      id='newsletterMasaPage'
      minHeight='calc(100vh - 600px)'
    >
      <Box className='wrapper newsletterSignupSwap'>
        <p>QUICKSWAP X MASA</p>
        <h4>{t('newsletterMasaSignupForm')}</h4>
        <small>
          <Trans
            i18nKey='newsletterSignupMasaDetails'
            components={{ bold: <b></b> }}
          />
        </small>
        <Box className='newsletterSignupFormSwap'>
          <input
            placeholder={t('enterEmail')}
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
            {data.subscription && (
              <span className='text-success'>{t('subscribeSuccess')}</span>
            )}
            {data.error && (
              <span className='text-error'>{t('subscribeError')}</span>
            )}
          </Box>
        )}
        <Box className='flex justify-center' mt={3}>
          <img src={MSB_LOGO} width={200} />
        </Box>
      </Box>
    </Box>
  );
};

export default NewsletterMasaPage;
