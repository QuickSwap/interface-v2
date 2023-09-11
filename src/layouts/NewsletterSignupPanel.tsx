import React, { useEffect, useRef, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Close } from '@material-ui/icons';
import { useOnClickOutside } from 'hooks/v3/useOnClickOutside';

const NewsletterSignupPanel: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const signupPanel = useRef<any>(null);
  const hidePanel = () => {
    setShowPanel(false);
  };
  useOnClickOutside(signupPanel, hidePanel);
  const { t } = useTranslation();
  useEffect(() => {
    setTimeout(() => {
      setShowPanel(true);
    }, 3000);
  }, []);
  return showPanel ? (
    <div ref={signupPanel} className='staticNewsletterSignUpPanel'>
      <p>{t('dragonDispatch')}</p>
      <h4>{t('newsletterSignup')}</h4>
      <small>
        {t('newsletterSignupDesc')}&nbsp;
        <b>{t('earn300QUICK')}</b>
      </small>
      <input placeholder={t('enterEmail')} />
      <Button>{t('signup')}</Button>
      <Box className='cursor-pointer' onClick={hidePanel}>
        <Close />
      </Box>
    </div>
  ) : (
    <></>
  );
};

export default React.memo(NewsletterSignupPanel);
