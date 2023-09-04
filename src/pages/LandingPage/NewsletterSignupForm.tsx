import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import newsletterBg from 'assets/images/newsletterBg.svg';

const NewsletterSignupForm: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box className='newsletterSignupWrapper'>
      <Box>
        <p>{t('dragonDispatch')}</p>
        <h4>{t('newsletterSignup')}</h4>
        <small className='text-primaryText'>
          {t('newsletterSignupDesc')}&nbsp;
          <b>{t('earn300QUICK')}</b>
        </small>
      </Box>
      <Box className='newsletterSignupForm'>
        <input placeholder={t('enterEmail')} />
        <Button>{t('signup')}</Button>
      </Box>
      <img src={newsletterBg} />
    </Box>
  );
};

export default NewsletterSignupForm;
