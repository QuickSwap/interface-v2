import React from 'react';
import { useRouter } from 'next/router';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ArrowForwardIos } from '@mui/icons-material';
import AnalyticsSearch from 'components/AnalyticsSearch';
import { shortenAddress } from 'utils';
import styles from 'styles/pages/Analytics.module.scss';
import { useTranslation } from 'react-i18next';
import AdsSlider from 'components/AdsSlider';
import VersionToggle from 'components/Toggle/VersionToggle';

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
  const router = useRouter();
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const version = router.query.version ?? 'total';
  const isPairDetails = router.pathname.includes('pair/');

  return (
    <Box width='100%' mb={3}>
      <Box mb={4} className='flex items-center'>
        <h4>{t('quickswapAnalytics')}</h4>
        {!isPairDetails && (
          <Box ml={2}>
            <VersionToggle />
          </Box>
        )}
      </Box>
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='0 auto 24px'>
        <AdsSlider sort='analytics' />
      </Box>
      <Box
        mb={4}
        position='relative'
        className='flex flex-wrap justify-between'
      >
        <Box marginY={1.5} className='flex items-center'>
          {type && (
            <Box className='flex items-center text-hint'>
              <span
                className='link'
                onClick={() => {
                  router.push(`/analytics/${version}`);
                }}
              >
                {t('analytics')}
              </span>
              <ArrowForwardIos style={{ width: 16 }} />
              <span
                className='link'
                onClick={() => {
                  router.push(`/analytics/${version}/${type}s`);
                }}
              >
                {type === 'token' ? t('tokens') : t('pairs')}
              </span>
              <ArrowForwardIos style={{ width: 16 }} />
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
                className={`${styles.topTab} ${router.pathname.indexOf(
                  'pair',
                ) === -1 &&
                  router.pathname.indexOf('token') === -1 &&
                  styles.selectedTab}`}
                onClick={() => router.push(`/analytics/${version}`)}
              >
                <p>{t('overview')}</p>
              </Box>
              <Box
                className={`${styles.topTab} ${router.pathname.indexOf(
                  'token',
                ) > -1 && styles.selectedTab}`}
                onClick={() => router.push(`/analytics/${version}/tokens`)}
              >
                <p>{t('tokens')}</p>
              </Box>
              <Box
                className={`${styles.topTab} ${router.pathname.indexOf('pair') >
                  -1 && styles.selectedTab}`}
                onClick={() => router.push(`/analytics/${version}/pairs`)}
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
