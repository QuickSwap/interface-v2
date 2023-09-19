import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@material-ui/core';
import { SwapEthButton } from './SwapEthButton';

export const StepsSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' mb={3}>
      <h6>{t('ethStepsHeading')}</h6>
      <ul>
        <li>
          <Box>
            <b>Step 1:</b>
          </Box>
          <Box>{t('ethStep1Details')}</Box>
        </li>
        <li>
          <Box>
            <b>Step 2:</b>
          </Box>
          <Box>{t('ethStep2Details')}</Box>
        </li>
        <li>
          <Box>
            <b>Step 3:</b>
          </Box>
          <Box>{t('ethStep3Details')}</Box>
        </li>
        <li>
          <Box>
            <b>Step 4:</b>
          </Box>
          <Box>{t('ethStep4Details')}</Box>
        </li>
        <li>
          <Box>
            <b>Step 5:</b>
          </Box>
          <Box>{t('ethStep5Details')}</Box>
        </li>
      </ul>
      <Box>
        <SwapEthButton />
      </Box>
    </Box>
  );
};
