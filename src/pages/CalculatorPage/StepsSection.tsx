import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@material-ui/core';
import { SwapEthButton } from './SwapEthButton';

export const StepsSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' mt={5} mb={4}>
      <h6>{t('ethStepsHeading')}</h6>
      <ul>
        <li className='step'>
          <Box ml={3} pb={2}>
            <Box className='step-heading'>Step 1:</Box>
            <Box className='step-description'>{t('ethStep1Details')}</Box>
          </Box>
        </li>
        <li className='step'>
          <Box ml={3} pb={2}>
            <Box className='step-heading'>Step 2:</Box>
            <Box className='step-description'>{t('ethStep2Details')}</Box>
          </Box>
        </li>
        <li className='step'>
          <Box ml={3} pb={2}>
            <Box className='step-heading'>Step 3:</Box>
            <Box className='step-description'>{t('ethStep3Details')}</Box>
          </Box>
        </li>
        <li className='step'>
          <Box ml={3} pb={2}>
            <Box className='step-heading'>Step 4:</Box>
            <Box className='step-description'>{t('ethStep4Details')}</Box>
          </Box>
        </li>
        <li className='step'>
          <Box ml={3} pb={2}>
            <Box className='step-heading'>Step 5:</Box>
            <Box className='step-description'>{t('ethStep5Details')}</Box>
          </Box>
        </li>
      </ul>
      <Box>
        <SwapEthButton />
      </Box>
    </Box>
  );
};
