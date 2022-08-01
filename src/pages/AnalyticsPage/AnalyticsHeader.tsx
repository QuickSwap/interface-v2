import React, { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import AnalyticsSearch from 'components/AnalyticsSearch';
import { shortenAddress } from 'utils';
import 'pages/styles/analytics.scss';
import { useTranslation } from 'react-i18next';
import { useIsV3 } from 'state/analytics/hooks';
import { useDispatch } from 'react-redux';
import { toggleAnalyticsVersion } from 'state/analytics/actions';

interface AnalyticHeaderProps {
  data?: any;
  type?: string;
}

const AnalyticsHeader: React.FC<AnalyticHeaderProps> = ({ data, type }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const isV3 = useIsV3();

  const version = useMemo(() => `${isV3 ? `v3` : 'v2'}`, [isV3]);
  const activeLink = useMemo(
    () =>
      pathname
        .split('/')
        .slice(3)
        .join('/') || '',
    [pathname],
  );

  return (
    <Box width='100%' mb={3}>
      <Box mb={4} className='flex'>
        <h4>{t('quickswapAnalytics')}</h4>
        <Box
          ml={2.5}
          className='versionToggler flex'
          onClick={() => {
            history.push(
              `/analytics/${isV3 ? 'v2' : 'v3'}${
                activeLink ? `/${activeLink}` : ''
              }`,
            );
            dispatch(toggleAnalyticsVersion());
          }}
        >
          <div className={`${!isV3 && 'activeVersion'}`}>V2</div>
          <div className={`${isV3 && 'activeVersion'}`}>V3</div>
        </Box>
      </Box>
      <Box
        mb={4}
        position='relative'
        className='flex justify-between flex-wrap'
      >
        <Box marginY={1.5} className='flex items-center'>
          {type && data && (
            <Box className='flex items-center text-hint'>
              <span
                className='link'
                onClick={() => {
                  history.push(`/analytics/${version}`);
                }}
              >
                {t('analytics')}
              </span>
              <ArrowForwardIos style={{ width: 16 }} />
              <span
                className='link'
                onClick={() => {
                  history.push(`/analytics/${version}/${type}s`);
                }}
              >
                {type === 'token' ? t('tokens') : t('pairs')}
              </span>
              <ArrowForwardIos style={{ width: 16 }} />
              <span>
                <span className='text-gray19'>
                  {type === 'token'
                    ? data.symbol
                    : `${data.token0.symbol}/${data.token1.symbol}`}
                </span>
                ({shortenAddress(data.id)})
              </span>
            </Box>
          )}
          {!type && (
            <>
              <Box
                className={`topTab ${pathname.indexOf('pair') === -1 &&
                  pathname.indexOf('token') === -1 &&
                  'selectedTab'}`}
                onClick={() => history.push(`/analytics/${version}`)}
              >
                <p>{t('overview')}</p>
              </Box>
              <Box
                className={`topTab ${pathname.indexOf('token') > -1 &&
                  'selectedTab'}`}
                onClick={() => history.push(`/analytics/${version}/tokens`)}
              >
                <p>{t('tokens')}</p>
              </Box>
              <Box
                className={`topTab ${pathname.indexOf('pair') > -1 &&
                  'selectedTab'}`}
                onClick={() => history.push(`/analytics/${version}/pairs`)}
              >
                <p>{t('pairs')}</p>
              </Box>
            </>
          )}
        </Box>

        <AnalyticsSearch />
      </Box>
    </Box>
  );
};

export default AnalyticsHeader;
