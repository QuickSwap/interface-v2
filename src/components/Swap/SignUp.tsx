import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import bg from 'assets/images/subcribe-bg.png';
import {
  Box,
  ButtonBase,
  CircularProgress,
  InputBase,
  Typography,
} from '@material-ui/core';
import { useSubscribeNewsletter } from 'hooks/useNewsletterSignup';

interface SignUpProps {
  onSubcribe: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSubcribe }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const { mutate, isLoading, data } = useSubscribeNewsletter();
  const handleSubscribe = async () => {
    await mutate(email);
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '140px',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
        padding: '16px',
        marginTop: '16px',
      }}
    >
      <img
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          left: 0,
          top: 0,
          objectFit: 'cover',
          zIndex: -1,
        }}
        src={bg}
        alt='sub bg'
      />
      <Typography style={{ fontSize: '16px', color: '#fff', fontWeight: 600 }}>
        {t('dragonDispatch')}
      </Typography>
      <Typography
        style={{
          fontSize: '13px',
          color: 'rgb(157 157 157)',
          fontWeight: 500,
          marginBottom: '16px',
        }}
      >
        {t('dragonDispatchSignUp')}
      </Typography>
      <Box
        style={{ backdropFilter: 'blur(12px)' }}
        sx={{
          width: '100%',
          bgcolor: 'rgb(85 60 123)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
        }}
      >
        <InputBase
          style={{ width: '100%' }}
          placeholder='Enter your email'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        {isLoading ? (
          <CircularProgress
            size='20px'
            style={{ color: 'white', marginRight: 5 }}
          />
        ) : (
          <ButtonBase
            style={{ padding: '0 16px', color: 'rgba(255, 255, 255, 0.32)' }}
            onClick={handleSubscribe}
          >
            Subscribe
          </ButtonBase>
        )}
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
export default SignUp;
