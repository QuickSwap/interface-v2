import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box } from '@mui/material';
import { SwapEthButton } from './SwapEthButton';
import styles from 'styles/pages/Calculator.module.scss';

export const AboutSecction: React.FC<{ factor: number }> = ({ factor = 0 }) => {
  const { t } = useTranslation();
  const price = (factor * 0.01).toFixed(3);
  return (
    <Box className={styles.section} mb={3}>
      <Box className={`${styles.subHeading} ${styles.subHeading20}`} mb={3}>
        {t('aboutETH')}
      </Box>
      <Box className={styles.textDesc}>{t('aboutETHDetails')}</Box>
      <Box className={`mt-1 ${styles.textDesc}`}>{t('aboutETHDetails2')}</Box>
      <Box
        className={`${styles.subHeading} mt-1 ${styles.subHeading20}`}
        mb={3}
        mt={4}
      >
        {t('aboutUSD')}
      </Box>
      <Box className={styles.textDesc}>{t('aboutUSDDetails')}</Box>
      <Box mt={4}>
        <SwapEthButton />
      </Box>
      <Box mt={4}>
        <Box className={`${styles.subHeading} ${styles.subHeading20}`}>
          {t('whyUseQuickSwap')}
        </Box>
        <Box className={styles.textDesc}>{t('whyQSDetails1')}</Box>
        <Box className={styles.textDesc} mt={2}>
          {t('whyQSDetails2')}
        </Box>
        <Box className={styles.textDesc} mt={2}>
          {t('whyQSDetails3')}
        </Box>
        <Box className={styles.textDesc} mt={2}>
          {t('whyQSDetails4', { price })}
        </Box>
        <Box mt={4}>
          <SwapEthButton />
        </Box>
      </Box>
    </Box>
  );
};
