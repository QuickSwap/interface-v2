import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import AnalyticsSearch from 'components/AnalyticsSearch';
import { shortenAddress } from 'utils';
import 'pages/styles/analytics.scss';
import { useTranslation } from 'react-i18next';
import VersionToggle from 'components/Toggle/VersionToggle';
import { getConfig } from 'config/index';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { useIsV2 } from 'state/application/hooks';
import { HypeLabAds } from 'components';

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
  const history = useHistory();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const v3 = config['v3'];
  const v2 = config['v2'];
  const showAnalytics = config['analytics']['available'];
  const lHAnalyticsAvailable = config['analytics']['liquidityHub'];
  useEffect(() => {
    if (!showAnalytics) {
      history.push('/');
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
  const isPairDetails = history.location.pathname.includes('pair/');
  const isLiquidityHub = version === 'liquidityhub';

  useEffect(() => {
    if (!lHAnalyticsAvailable && isLiquidityHub) {
      history.push('/analytics');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lHAnalyticsAvailable, isLiquidityHub]);

  return (
    <Box width='100%' mb={3}>
      <Box mb={4} className='flex items-center'>
        <h1 className='h4'>{t('quickswapAnalytics')}</h1>
        {v2 && v3 && !isPairDetails && (
          <Box ml={2}>
            <VersionToggle />
          </Box>
        )}
      </Box>
      <Box margin='0 auto 24px'>
        <HypeLabAds />
      </Box>
      <Box
        mb={4}
        position='relative'
        className='flex justify-between flex-wrap'
      >
        <Box marginY={1.5} className='flex items-center'>
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
          {!type && !isLiquidityHub && (
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

        {!isLiquidityHub && <AnalyticsSearch />}
      </Box>
    </Box>
  );
};

export default AnalyticsHeader;
