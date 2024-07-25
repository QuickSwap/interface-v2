import { Box } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SwapPageHeader: React.FC<{ proMode: boolean; isTablet: boolean }> = ({
  proMode,
  isTablet,
}) => {
  const helpURL = process.env.REACT_APP_HELP_URL;
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
