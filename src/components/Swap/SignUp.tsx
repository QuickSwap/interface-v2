import React, { useState } from 'react';
import bg from 'assets/images/subcribe-bg.png';
import { Box, ButtonBase, InputBase, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

interface SignUpProps {
  onSubcribe: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSubcribe }) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>('');

  return (
    <Box
      sx={{
        width: '100%',
        height: '140px',
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
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <ButtonBase
          style={{ padding: '0 16px', color: 'rgba(255, 255, 255, 0.32)' }}
        >
          Subscribe
        </ButtonBase>
      </Box>
    </Box>
  );
};
export default SignUp;
