import React, { useCallback, useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useHistory } from 'react-router-dom';
import './index.scss';

const VersionToggle: React.FC<{
  isV3: boolean;
  onToggleV3: (isV3: boolean) => void;
}> = ({ onToggleV3: onToggleV3, isV3: isV3 }) => {
  const { t } = useTranslation();

  return (
    <Box className='version-toggle-container' onClick={() => onToggleV3(!isV3)}>
      <Box className={!isV3 ? 'version-toggle-active' : ''}>
        <small>{t('V2')}</small>
      </Box>

      <Box className={isV3 ? 'version-toggle-active' : ''}>
        <small>{t('V3')}</small>
      </Box>
    </Box>
  );
};

export default VersionToggle;
