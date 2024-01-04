import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Close } from '@material-ui/icons';
import { useOnClickOutside } from 'hooks/v3/useOnClickOutside';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';

const NewsletterSignupPanel: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [email, setEmail] = useState('');
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

  const { mutate, isLoading, data } = useSubscribeNewsletter();
  const handleSignup = async () => {
    await mutate(email);
  };

  return showPanel ? (
    <div ref={signupPanel} className='staticNewsletterSignUpPanel'>
      <p>{t('dragonDispatch')}</p>
      <h4>{t('newsletterSignup')}</h4>
      <small>
        {t('newsletterSignupDesc')}&nbsp;
        <b>{t('earn300QUICK')}</b>
      </small>
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
        {t('signup')}
      </Button>
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
      <Box className='newsletterSignupClose cursor-pointer' onClick={hidePanel}>
        <Close />
      </Box>
    </div>
  ) : (
    <></>
  );
};

export default React.memo(NewsletterSignupPanel);
