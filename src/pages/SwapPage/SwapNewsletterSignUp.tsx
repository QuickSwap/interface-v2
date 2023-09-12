import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const SwapNewsletterSignup: React.FC = () => {
  const { t } = useTranslation();

  const signupNewsletter = async () => {
    const formSubmit = document.querySelector(
      '[data-form="b97ce206-2a21-11ee-b259-89605999ef42"] form input[type=submit]',
    );
    if (formSubmit) {
      (formSubmit as any).click();
    }
  };

  const inputEmail = (e: any) => {
    const emailInput = document.querySelector(
      '[data-form="b97ce206-2a21-11ee-b259-89605999ef42"] form input[type=email]',
    );
    if (emailInput) {
      (emailInput as any).value = e.target.value;
    }
  };

  return (
    <Box className='wrapper newsletterSignupSwap'>
      <p>{t('dragonDispatch')}</p>
      <h4>{t('quickOfficialNewsletter')}</h4>
      <small>
        {t('newsletterSignupDesc')}&nbsp;
        <b>{t('earn300QUICK')}</b>
      </small>
      <Box className='newsletterSignupFormSwap'>
        <input placeholder={t('enterEmail')} onChange={inputEmail} />
        <Button onClick={signupNewsletter}>{t('subscribe')}</Button>
      </Box>
    </Box>
  );
};

export default SwapNewsletterSignup;
