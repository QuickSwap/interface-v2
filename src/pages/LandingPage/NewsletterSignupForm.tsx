import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import newsletterBg from 'assets/images/newsletterBg.svg';

const NewsletterSignupForm: React.FC = () => {
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
    <Box className='newsletterSignupWrapper'>
      <Box>
        <p>{t('dragonDispatch')}</p>
        <h4>{t('newsletterSignup')}</h4>
        <small className='text-primaryText'>
          {t('newsletterSignupDesc')}&nbsp;
          <b>{t('earn300QUICK')}</b>
        </small>
      </Box>
      <div className='newsletterSignupForm'>
        <input
          type='email'
          placeholder={t('enterEmail')}
          onChange={inputEmail}
        />
        <Button onClick={signupNewsletter}>{t('signup')}</Button>
      </div>
      <img src={newsletterBg} />
    </Box>
  );
};

export default NewsletterSignupForm;
