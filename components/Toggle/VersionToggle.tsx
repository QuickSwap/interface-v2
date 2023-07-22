import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import styles from './Toggle.module.scss';
import { useIsV2 } from 'state/application/hooks';
import { NEW_QUICK_ADDRESS } from 'constants/v3/addresses';
import { useIsAnalyticsLoaded } from 'state/analytics/hooks';
import { useAnalyticsVersion } from 'hooks';

const VersionToggle: React.FC = () => {
  const { t } = useTranslation();
  const { isV2, updateIsV2 } = useIsV2();
  const router = useRouter();
  const isAnalyticsPage = router.pathname.includes('/analytics');
  const analyticsVersion = useAnalyticsVersion();
  const version = router.query.version
    ? (router.query.version as string)
    : isAnalyticsPage
    ? analyticsVersion
    : 'v3';

  const analyticsLoaded = useIsAnalyticsLoaded();
  const toggleDisabled = isAnalyticsPage && !analyticsLoaded;

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
          ? router.asPath.substring(router.asPath.indexOf('?'))
          : ''),
    );
  };

  return (
    <Box
      className={`${styles.versionToggleContainer} ${
        toggleDisabled ? styles.versionToggleDisabled : ''
      }`}
    >
      <Box
        className={
          isV2 && version !== 'total' ? styles.versionToggleActive : ''
        }
        onClick={() => {
          if (!toggleDisabled) {
            redirectWithVersion('v2');
          }
        }}
      >
        <small>{t('V2')}</small>
      </Box>

      <Box
        className={
          !isV2 && version !== 'total' ? styles.versionToggleActive : ''
        }
        onClick={() => {
          if (!toggleDisabled) {
            redirectWithVersion('v3');
          }
        }}
      >
        <small>{t('V3')}</small>
      </Box>

      {isAnalyticsPage && (
        <Box
          className={version === 'total' ? styles.versionToggleActive : ''}
          onClick={() => {
            if (!toggleDisabled) {
              redirectWithVersion('total');
            }
          }}
        >
          <small>{t('total')}</small>
        </Box>
      )}
    </Box>
  );
};

export default VersionToggle;
