import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button } from '@material-ui/core';
import { SwapEthButton } from './SwapEthButton';

export const AboutSecction: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box width='100%' mb={3}>
      <h6>{t('aboutETH')}</h6>
      <Box>{t('aboutETHDetails')}</Box>
      <Box className='mt-1'>{t('aboutETHDetails2')}</Box>
      <h6 className='mt-1'>{t('aboutUSD')}</h6>
      <Box>{t('aboutUSDDetails')}</Box>
      <Box className='mt-1'>
        <SwapEthButton />
      </Box>
      <Box>
        <h6>{t('whyUseQuickSwap')}</h6>
        <Box>{t('whyQSDetails1')}</Box>
        <Box>{t('whyQSDetails2')}</Box>
        <Box>{t('whyQSDetails3')}</Box>
        <Box>{t('whyQSDetails4')}</Box>
        <Box className='mt-1'>
          <SwapEthButton />
        </Box>
      </Box>
    </Box>
  );
};
