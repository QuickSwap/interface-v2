import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import './index.scss';
import { useIsV2 } from 'state/application/hooks';
import { GlobalConst } from 'constants/index';

const VersionToggle: React.FC = () => {
  const { t } = useTranslation();
  const { isV2, updateIsV2 } = useIsV2();
  const params: any = useParams();
  const history = useHistory();
  const isAnalyticsPage =
    history.location.pathname.includes('/analytics') &&
    !history.location.pathname.includes('pair/');
  const version =
    params && params.version
      ? params.version
      : isAnalyticsPage
      ? 'total'
      : 'v3';

  useEffect(() => {
    updateIsV2(version === 'v2');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const redirectWithVersion = (version: string) => {
    const newQuickAddress = GlobalConst.addresses.NEW_QUICK_ADDRESS;
    const versionParam = params ? params.version : undefined;
    const currencyIdAParam = params ? params.currencyIdA : undefined;
    const currencyIdBParam = params ? params.currencyIdB : undefined;
    const redirectPathName = versionParam
      ? history.location.pathname.replace('/' + versionParam, `/${version}`)
      : history.location.pathname +
        (history.location.pathname.includes('/add')
          ? (currencyIdAParam ? '' : `/ETH`) +
            (currencyIdBParam ? '' : `/${newQuickAddress}`)
          : '') +
        `/${version}`;
    history.push(
      redirectPathName +
        (history.location.pathname.includes('/pools')
          ? history.location.search
          : ''),
    );
  };

  return (
    <div className='version-toggle-container'>
      <div
        className={isV2 && version !== 'total' ? 'version-toggle-active' : ''}
        onClick={() => redirectWithVersion('v2')}
      >
        <small>{t('V2')}</small>
      </div>

      <div
        className={!isV2 && version !== 'total' ? 'version-toggle-active' : ''}
        onClick={() => redirectWithVersion('v3')}
      >
        <small>{t('V3')}</small>
      </div>

      {isAnalyticsPage && (
        <div
          className={version === 'total' ? 'version-toggle-active' : ''}
          onClick={() => redirectWithVersion('total')}
        >
          <small>{t('total')}</small>
        </div>
      )}
    </div>
  );
};

export default VersionToggle;
