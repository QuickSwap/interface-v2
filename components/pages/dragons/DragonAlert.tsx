import React, { useState } from 'react';
import { Box } from '@mui/material';
import AlertIcon from 'svgs/AlertIcon.svg';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

const DragonAlert: React.FC = () => {
  const [openAlert, setOpenAlert] = useState(true);
  const { t } = useTranslation();
  return (
    <>
      {openAlert && (
        <Box className='dragonAlertWrapper bg-secondary2'>
          <AlertIcon />
          <Box mx={2} width='calc(100% - 96px)'>
            <p>{t('dragonAlertDesc')}</p>
          </Box>
          <Close
            className='cursor-pointer'
            onClick={() => setOpenAlert(false)}
          />
        </Box>
      )}
    </>
  );
};

export default DragonAlert;
