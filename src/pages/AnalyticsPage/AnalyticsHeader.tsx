import React, { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box } from 'theme/components';
import { ChevronRight } from 'react-feather';
import AnalyticsSearch from 'components/AnalyticsSearch';
import { shortenAddress } from 'utils';
import 'pages/styles/analytics.scss';
import { useTranslation } from 'react-i18next';
import { useIsV2 } from 'state/application/hooks';
import AdsSlider from 'components/AdsSlider';
import VersionToggle from 'components/Toggle/VersionToggle';
import { isMobile } from 'react-device-detect';

interface AnalyticHeaderProps {
  data?: any;
  type?: string;
  address?: string;
}

const AnalyticsHeader: React.FC<AnalyticHeaderProps> = ({
  data,
  type,
  address,
}) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const { isV2 } = useIsV2();
  const version = useMemo(() => `${isV2 ? `v2` : 'v3'}`, [isV2]);

  return (
    <Box width='100%' margin='0 0 24px'>
      <Box margin='0 0 32px' className='flex items-center'>
        <h4>{t('quickswapAnalytics')}</h4>
        <Box margin='0 0 16px'>
          <VersionToggle />
        </Box>
      </Box>
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='0 auto 24px'>
        <AdsSlider sort='analytics' />
      </Box>
      <Box
        margin='0 0 32px'
        position='relative'
        className='flex justify-between flex-wrap'
      >
        <Box margin='12px 0' className='flex items-center'>
          {type && (
            <Box className='flex items-center text-hint'>
              <span
                className='link'
                onClick={() => {
                  history.push(`/analytics/${version}`);
                }}
              >
                {t('analytics')}
              </span>
              <ChevronRight style={{ width: 16 }} />
              <span
                className='link'
                onClick={() => {
                  history.push(`/analytics/${version}/${type}s`);
                }}
              >
                {type === 'token' ? t('tokens') : t('pairs')}
              </span>
              <ChevronRight style={{ width: 16 }} />
              <span>
                {data && (
                  <span className='text-gray19'>
                    {type === 'token'
                      ? data.symbol
                      : `${data.token0.symbol}/${data.token1.symbol}`}
                  </span>
                )}
                (
                {data || address
                  ? shortenAddress(data ? data.id : address)
                  : ''}
                )
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
