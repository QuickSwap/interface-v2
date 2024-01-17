import React from 'react';
import { Trans, useTranslation } from 'next-i18next';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import { ExpandMoreOutlined } from '@mui/icons-material';
import { SwapEthButton } from './SwapEthButton';
import styles from 'styles/pages/Calculator.module.scss';

export const FaqSection: React.FC = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      header: t('ethFaqQuestion1'),
      content: <Box>{t('ethFaqAnswer1')}</Box>,
    },
    {
      header: t('ethFaqQuestion2'),
      content: (
        <Box>
          <Trans
            i18nKey='ethFaqAnswer2'
            components={{
              underline: <u></u>,
            }}
          />
        </Box>
      ),
    },
    {
      header: t('ethFaqQuestion3'),
      content: (
        <Box>
          <Trans
            i18nKey='ethFaqAnswer3'
            components={{
              underline: <u></u>,
              break: <br />,
            }}
          />
        </Box>
      ),
    },
  ];

  return (
    <Box className={styles.section} mb={4}>
      <Box className={`${styles.subHeading} ${styles.subHeading20}`} mb={3}>
        {t('ethFaqHeading')}
      </Box>
      <Box>
        {faqs.map((val, i) => (
          <Accordion key={`accordation-${i}`}>
            <AccordionSummary
              expandIcon={<ExpandMoreOutlined />}
              aria-controls='panel1a-content'
              id='panel1a-header'
            >
              <Typography>{val.header}</Typography>
            </AccordionSummary>
            <AccordionDetails>{val.content}</AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Box mt={4}>
        <SwapEthButton />
      </Box>
    </Box>
  );
};
