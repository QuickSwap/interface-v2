import { Box } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SwapPageHeader: React.FC<{ proMode: boolean }> = ({ proMode }) => {
  const helpURL = process.env.REACT_APP_HELP_URL;
  const { t } = useTranslation();

  return proMode ? (
    <></>
  ) : (
    <Box className='pageHeading'>
      <h4>{t('swap')}</h4>
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
