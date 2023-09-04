import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const SwapNewsletterSignup: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box className='wrapper newsletterSignupSwap'>
      <p>{t('dragonDispatch')}</p>
      <h4>{t('quickOfficialNewsletter')}</h4>
      <small className='text-primaryText'>
        {t('newsletterSignupDesc')}&nbsp;
        <b>{t('earn300QUICK')}</b>
      </small>
      <Box className='newsletterSignupFormSwap'>
        <input placeholder={t('enterEmail')} />
        <Button>{t('subscribe')}</Button>
      </Box>
    </Box>
  );
};

export default SwapNewsletterSignup;
