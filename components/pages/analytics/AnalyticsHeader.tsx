import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ArrowForwardIos } from '@mui/icons-material';
import AnalyticsSearch from 'components/AnalyticsSearch';
import { shortenAddress } from 'utils';
import styles from 'styles/pages/Analytics.module.scss';
import { useTranslation } from 'next-i18next';
import VersionToggle from 'components/Toggle/VersionToggle';
import { getConfig } from 'config';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { useIsV2 } from 'state/application/hooks';
import { Adshares } from 'components';

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
  const { chainId } = useActiveWeb3React();
  const router = useRouter();
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const v3 = config['v3'];
  const v2 = config['v2'];
  const showAnalytics = config['analytics']['available'];
  useEffect(() => {
    if (!showAnalytics) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnalytics]);

  const { updateIsV2 } = useIsV2();

  useEffect(() => {
    if (!v2 && v3) {
      updateIsV2(false);
    }
  }, [updateIsV2, v2, v3]);
  const version = useAnalyticsVersion();
  const isPairDetails = router.pathname === '/analytics/[version]/pair';

  return (
    <Box width='100%' mb={3}>
      <Box mb={4} className='flex items-center'>
        <h4>{t('quickswapAnalytics')}</h4>
        {v2 && v3 && !isPairDetails && (
          <Box ml={2}>
            <VersionToggle />
          </Box>
        )}
      </Box>
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='0 auto 24px'>
        <Adshares />
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
                className={styles.link}
                onClick={() => {
                  router.push(`/analytics/${version}`);
                }}
              >
                {t('analytics')}
              </span>
              <ArrowForwardIos style={{ width: 16 }} />
              <span
                className={styles.link}
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
