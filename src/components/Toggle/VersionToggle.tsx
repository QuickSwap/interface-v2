import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import './index.scss';
import { useIsV3 } from 'state/application/hooks';

const VersionToggle: React.FC = () => {
  const { t } = useTranslation();
  const { isV3, updateIsV3 } = useIsV3();
  const params: any = useParams();
  const history = useHistory();
  const version = params ? params.version : 'v2';

  useEffect(() => {
    updateIsV3(version === 'v3');
  }, [version]);

  return (
    <Box className='version-toggle-container'>
      <Box
        className={!isV3 ? 'version-toggle-active' : ''}
        onClick={() => {
          history.push(
            history.location.pathname.replace(
              '/v3',
              history.location.pathname.includes('/analytics') ? '/v2' : '',
            ),
          );
        }}
      >
        <small>{t('V2')}</small>
      </Box>

      <Box
        className={isV3 ? 'version-toggle-active' : ''}
        onClick={() => {
          history.push(
            params && params.version
              ? history.location.pathname.replace('/' + params.version, '/v3')
              : history.location.pathname + '/v3',
          );
        }}
      >
        <small>{t('V3')}</small>
      </Box>
    </Box>
  );
};

export default VersionToggle;
