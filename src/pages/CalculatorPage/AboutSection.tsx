import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button } from '@material-ui/core';
import { SwapEthButton } from './SwapEthButton';

export const AboutSecction: React.FC<{ factor: number }> = ({ factor = 0 }) => {
  const { t } = useTranslation();
  const price = (factor * 0.01).toFixed(3);
  return (
    <Box className='section' mb={3}>
      <Box className='sub-heading sub-heading-20' mb={3}>
        {t('aboutETH')}
      </Box>
      <Box className='text-desc'>{t('aboutETHDetails')}</Box>
      <Box className='mt-1 text-desc'>{t('aboutETHDetails2')}</Box>
      <Box className='sub-heading mt-1 sub-heading-20' mb={3} mt={4}>
        {t('aboutUSD')}
      </Box>
      <Box className='text-desc'>{t('aboutUSDDetails')}</Box>
      <Box mt={4}>
        <SwapEthButton />
      </Box>
      <Box mt={4}>
        <Box className='sub-heading sub-heading-20'>{t('whyUseQuickSwap')}</Box>
        <Box className='text-desc'>{t('whyQSDetails1')}</Box>
        <Box className='text-desc' mt={2}>
          {t('whyQSDetails2')}
        </Box>
        <Box className='text-desc' mt={2}>
          {t('whyQSDetails3')}
        </Box>
        <Box className='text-desc' mt={2}>
          {t('whyQSDetails4', { price })}
        </Box>
        <Box mt={4}>
          <SwapEthButton />
        </Box>
      </Box>
    </Box>
  );
};
