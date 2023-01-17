import React, { useState } from 'react';
import { Box } from 'theme/components';
import { ReactComponent as AlertIcon } from 'assets/images/AlertIcon.svg';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useTranslation } from 'react-i18next';

const DragonAlert: React.FC = () => {
  const [openAlert, setOpenAlert] = useState(true);
  const { t } = useTranslation();
  return (
    <>
      {openAlert && (
        <Box className='dragonAlertWrapper bg-secondary2'>
          <AlertIcon />
          <Box margin='0 16px' width='calc(100% - 96px)'>
            <p>{t('dragonAlertDesc')}</p>
          </Box>
          <CloseIcon
            className='cursor-pointer'
            onClick={() => setOpenAlert(false)}
          />
        </Box>
      )}
    </>
  );
};

export default DragonAlert;
