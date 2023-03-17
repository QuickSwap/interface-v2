import React, { useState } from 'react';
import { Box } from '@mui/material';
import { AlertTriangle, XCircle } from 'react-feather';
import styles from 'styles/components/BetaWarningBanner.module.scss';
import { useTranslation } from 'react-i18next';

const BetaWarningBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(true);
  const { t } = useTranslation();
  return (
    <>
      {showBanner && (
        <Box className={styles.warningBanner}>
          <AlertTriangle size={20} />
          <span className='text-bold'>{t('betaWarningDesc')}</span>
          <Box
            onClick={() => setShowBanner(false)}
            className={styles.closeBanner}
          >
            <XCircle size={20} />
          </Box>
        </Box>
      )}
    </>
  );
};

export default BetaWarningBanner;
