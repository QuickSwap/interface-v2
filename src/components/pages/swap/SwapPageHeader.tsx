import { Box } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import React from 'react';
import { useTranslation } from 'next-i18next';

const SwapPageHeader: React.FC<{ proMode: boolean; isTablet: boolean }> = ({
  proMode,
  isTablet,
}) => {
  const helpURL = process.env.NEXT_PUBLIC_HELP_URL;
  const { t } = useTranslation();

  return proMode || isTablet ? (
    <></>
  ) : (
    <Box className='pageHeading'>
      <h1 className='h4'>{t('swap')}</h1>
      {helpURL && (
        <Box
          className='helpWrapper'
          onClick={() => window.open(helpURL, '_blank')}
        >
          <small>{t('help')}</small>
          <HelpOutline />
        </Box>
      )}
    </Box>
  );
};

export default SwapPageHeader;
