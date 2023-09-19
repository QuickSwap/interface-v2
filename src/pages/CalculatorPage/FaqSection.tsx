import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@material-ui/core';
import { ExpandMoreOutlined } from '@material-ui/icons';
import { SwapEthButton } from './SwapEthButton';

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
    <Box width='100%' mb={3}>
      <h6>{t('ethFaqHeading')}</h6>
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
      <Box>
        <SwapEthButton />
      </Box>
    </Box>
  );
};
