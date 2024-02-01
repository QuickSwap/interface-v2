import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import './index.scss';
import { useIsV2 } from 'state/application/hooks';
import { NEW_QUICK_ADDRESS } from 'constants/v3/addresses';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { getConfig } from 'config/index';

const VersionToggle: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const lHAnalyticsAvailable = config['analytics']['liquidityHub'];
  const singleTokenEnabled = config['ichi']['available'];
  const { updateIsV2 } = useIsV2();
  const params: any = useParams();
  const history = useHistory();
  const isAnalyticsPage = history.location.pathname.includes('/analytics');
  const isPoolPage = history.location.pathname.includes('/pools');
  const analyticsVersion = useAnalyticsVersion();
  const version =
    params && params.version
      ? params.version
      : isAnalyticsPage
      ? analyticsVersion
      : 'v3';

  useEffect(() => {
    updateIsV2(version === 'v2');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const redirectWithVersion = (version: string) => {
    const versionParam = params ? params.version : undefined;
    const currencyIdAParam = params ? params.currencyIdA : undefined;
    const currencyIdBParam = params ? params.currencyIdB : undefined;
    if (versionParam !== version) {
      const redirectPathName = versionParam
        ? history.location.pathname.replace('/' + versionParam, `/${version}`)
        : history.location.pathname +
          (history.location.pathname.includes('/add')
            ? (currencyIdAParam ? '' : `/ETH`) +
              (currencyIdBParam ? '' : `/${NEW_QUICK_ADDRESS}`)
            : '') +
          `${history.location.pathname.endsWith('/') ? '' : '/'}${version}`;
      history.push(
        redirectPathName +
          (version !== 'singleToken' &&
          versionParam !== 'singleToken' &&
          history.location.pathname.includes('/pools')
            ? history.location.search
            : ''),
      );
    }
  };

  return (
    <Box className='version-toggle-container'>
      <Box
        className={version === 'v2' ? 'version-toggle-active' : ''}
        onClick={() => {
          redirectWithVersion('v2');
        }}
      >
        <small>{t('V2')}</small>
      </Box>

      <Box
        className={version === 'v3' ? 'version-toggle-active' : ''}
        onClick={() => {
          redirectWithVersion('v3');
        }}
      >
        <small>{t('V3')}</small>
      </Box>

      {isPoolPage && singleTokenEnabled && (
        <Box
          className={version === 'singleToken' ? 'version-toggle-active' : ''}
          onClick={() => {
            redirectWithVersion('singleToken');
          }}
        >
          <small>{t('singleToken')}</small>
        </Box>
      )}

      {isAnalyticsPage && (
        <>
          {lHAnalyticsAvailable && (
            <Box
              className={
                version === 'liquidityhub' ? 'version-toggle-active' : ''
              }
              onClick={() => {
                redirectWithVersion('liquidityhub');
              }}
            >
              <small>{t('liquidityHub')}</small>
            </Box>
          )}
          <Box
            className={version === 'total' ? 'version-toggle-active' : ''}
            onClick={() => {
              redirectWithVersion('total');
            }}
          >
            <small>{t('total')}</small>
          </Box>
        </>
      )}
    </Box>
  );
};

export default VersionToggle;
