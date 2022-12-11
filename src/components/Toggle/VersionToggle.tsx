import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import './index.scss';
import { useIsV2 } from 'state/application/hooks';

const VersionToggle: React.FC = () => {
  const { t } = useTranslation();
  const { isV2, updateIsV2 } = useIsV2();
  const params: any = useParams();
  const history = useHistory();
  const version = params && params.version ? params.version : 'v3';

  useEffect(() => {
    updateIsV2(version === 'v2');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  return (
    <Box className='version-toggle-container'>
      <Box
        className={isV2 ? 'version-toggle-active' : ''}
        onClick={() => {
          history.push(
            params && params.version
              ? history.location.pathname.replace('/' + params.version, '/v2')
              : history.location.pathname + '/v2',
          );
        }}
      >
        <small>{t('V2')}</small>
      </Box>

      <Box
        className={!isV2 ? 'version-toggle-active' : ''}
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
