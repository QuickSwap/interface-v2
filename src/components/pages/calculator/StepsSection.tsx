import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box } from '@mui/material';
import { SwapEthButton } from './SwapEthButton';
import styles from 'styles/pages/Calculator.module.scss';

export const StepsSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' mt={5} mb={4}>
      <h6>{t('ethStepsHeading')}</h6>
      <ul>
        <li className={styles.step}>
          <Box ml={3} pb={2}>
            <Box className={styles.stepHeading}>Step 1:</Box>
            <Box className={styles.stepDescription}>{t('ethStep1Details')}</Box>
          </Box>
        </li>
        <li className={styles.step}>
          <Box ml={3} pb={2}>
            <Box className={styles.stepHeading}>Step 2:</Box>
            <Box className={styles.stepDescription}>{t('ethStep2Details')}</Box>
          </Box>
        </li>
        <li className={styles.step}>
          <Box ml={3} pb={2}>
            <Box className={styles.stepHeading}>Step 3:</Box>
            <Box className={styles.stepDescription}>{t('ethStep3Details')}</Box>
          </Box>
        </li>
        <li className={styles.step}>
          <Box ml={3} pb={2}>
            <Box className={styles.stepHeading}>Step 4:</Box>
            <Box className={styles.stepDescription}>{t('ethStep4Details')}</Box>
          </Box>
        </li>
        <li className={styles.step}>
          <Box ml={3} pb={2}>
            <Box className={styles.stepHeading}>Step 5:</Box>
            <Box className={styles.stepDescription}>{t('ethStep5Details')}</Box>
          </Box>
        </li>
      </ul>
      <Box>
        <SwapEthButton />
      </Box>
    </Box>
  );
};
