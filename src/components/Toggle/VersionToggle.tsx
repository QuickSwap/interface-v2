import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import styles from 'styles/components/Toggle.module.scss';
import { useIsV2 } from 'state/application/hooks';
import { NEW_QUICK_ADDRESS } from 'constants/v3/addresses';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { getConfig } from 'config/index';

const VersionToggle: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const singleTokenEnabled = config['ichi']['available'];
  const { updateIsV2 } = useIsV2();
  const router = useRouter();
  const isAnalyticsPage = router.pathname.includes('/analytics');
  const isPoolPage = router.pathname.includes('/pools');
  const analyticsVersion = useAnalyticsVersion();
  const version = router.query.version
    ? (router.query.version as string)
    : isAnalyticsPage
    ? analyticsVersion
    : 'v3';

  useEffect(() => {
    updateIsV2(version === 'v2');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const redirectWithVersion = (version: string) => {
    const versionParam = router.query.version
      ? (router.query.version as string)
      : undefined;
    const currencyIdAParam = router.query.currencyIdA
      ? (router.query.currencyIdA as string)
      : undefined;
    const currencyIdBParam = router.query.currencyIdB
      ? (router.query.currencyIdB as string)
      : undefined;
    const redirectPathName = versionParam
      ? router.pathname.replace('/[version]', `/${version}`)
      : router.pathname +
        (router.pathname.includes('/add')
          ? (currencyIdAParam ? '' : `/ETH`) +
            (currencyIdBParam ? '' : `/${NEW_QUICK_ADDRESS}`)
          : '') +
        `/${version}`;
    router.push(
      redirectPathName +
        (router.pathname.includes('/pools')
          ? router.asPath.indexOf('?') === -1
            ? ''
            : router.asPath.substring(router.asPath.indexOf('?'))
          : ''),
    );
  };

  return (
    <Box className={styles.versionToggleContainer}>
      <Box
        className={version === 'v2' ? styles.versionToggleActive : ''}
        onClick={() => {
          redirectWithVersion('v2');
        }}
      >
        <small>{t('V2')}</small>
      </Box>

      <Box
        className={version === 'v3' ? styles.versionToggleActive : ''}
        onClick={() => {
          redirectWithVersion('v3');
        }}
      >
        <small>{t('V3')}</small>
      </Box>

      {isPoolPage && singleTokenEnabled && (
        <Box
          className={
            version === 'singleToken' ? styles.versionToggleActive : ''
          }
          onClick={() => {
            redirectWithVersion('singleToken');
          }}
        >
          <small>{t('singleToken')}</small>
        </Box>
      )}

      {isAnalyticsPage && (
        <Box
          className={version === 'total' ? styles.versionToggleActive : ''}
          onClick={() => {
            redirectWithVersion('total');
          }}
        >
          <small>{t('total')}</small>
        </Box>
      )}
    </Box>
  );
};

export default VersionToggle;
