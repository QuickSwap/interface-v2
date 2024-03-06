import { Box } from '@material-ui/core';
import HelpIcon from '~/assets/images/HelpIcon1.svg?react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SwapPageHeader: React.FC<{ proMode: boolean; isTablet: boolean }> = ({
  proMode,
  isTablet,
}) => {
  const helpURL = import.meta.env.VITE_HELP_URL;
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
          <HelpIcon />
        </Box>
      )}
    </Box>
  );
};

export default SwapPageHeader;
