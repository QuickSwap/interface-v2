import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { AlertTriangle, XCircle } from 'react-feather';
import 'components/styles/BetaWarningBanner.scss';
import { useTranslation } from 'react-i18next';

const BetaWarningBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(true);
  const { t } = useTranslation();
  return (
    <>
      {showBanner && (
        <Box className='warningBanner'>
          <AlertTriangle size={20} />
          <span className='text-bold'>{t('betaWarningDesc')}</span>
          <Box onClick={() => setShowBanner(false)} className='closeBanner'>
            <XCircle size={20} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default BetaWarningBanner;
