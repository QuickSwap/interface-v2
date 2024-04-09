import React, { useState } from 'react';
import { Box, Button, CircularProgress } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';
import { ReactComponent as ArrowAhead } from '../../assets/images/landingPage/arrow_ahead.svg';

const NewsletterSignupForm: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const { mutate, isLoading, data } = useSubscribeNewsletter();
  const handleSignup = async () => {
    await mutate(email);
  };

  return (
    <Box mt={2} id='footerNewsletterSignup'>
      <Box className='newsletterInput'>
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
          <ArrowAhead />
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
    // <Box className='newsletterSignupWrapper'>
    //   {/* <Box>
    //     <p>{t('dragonDispatch')}</p>
    //     <h4>{t('newsletterSignup')}</h4>
    //     <small className='text-primaryText'>{t('newsletterSignupDesc')}</small>
    //   </Box> */}
    //   <Box className='newsletterSignupFormWrapper'>
    //     <Box className='newsletterSignupForm'>
    //       <input
    //         type='email'
    //         placeholder={t('enterEmail')}
    //         onChange={(e) => setEmail(e.target.value)}
    //       />
    //       <Button disabled={isLoading} onClick={handleSignup}>
    //         {isLoading && (
    //           <CircularProgress
    //             size='20px'
    //             style={{ color: 'white', marginRight: 5 }}
    //           />
    //         )}
    //         {t('signup')}
    //       </Button>
    //     </Box>
    //     {data && (
    //       <Box mt={1} textAlign='center'>
    //         {data.data && (
    //           <small className='text-success'>{t('subscribeSuccess')}</small>
    //         )}
    //         {data.error && (
    //           <small className='text-error'>{t('subscribeError')}</small>
    //         )}
    //       </Box>
    //     )}
    //   </Box>
    //   {/* <img src={newsletterBg} /> */}
    // </Box>
  );
};

export default NewsletterSignupForm;
