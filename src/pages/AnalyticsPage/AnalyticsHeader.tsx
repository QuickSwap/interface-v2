import React, { useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import AnalyticsSearch from 'components/AnalyticsSearch';
import { shortenAddress } from 'utils';
import 'pages/styles/analytics.scss';
import { useTranslation } from 'react-i18next';
import { useIsV3 } from 'state/application/hooks';
import AdsSlider from 'components/AdsSlider';
import VersionToggle from 'components/Toggle/VersionToggle';
import { getConfig } from '../../config/index';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';

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
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const farms = config['farm']['available'];
  const v3 = config['v3'];
  const v2 = config['v2'];
  const { isV3, updateIsV3 } = useIsV3();
  const version = useMemo(() => `${isV3 ? `v3` : 'v2'}`, [isV3]);

  useEffect(() => {
    updateIsV3(
      v2 === true && v3 === true
        ? isV3 === true
          ? true
          : false
        : v2
        ? false
        : true,
    );
  }, [v2, v3, isV3]);

  return (
    <Box width='100%' mb={3}>
      <Box mb={4} className='flex items-center'>
        <h4>{t('quickswapAnalytics')}</h4>
        {v2 && v3 && (
          <Box ml={2}>
            <VersionToggle />
          </Box>
        )}
        ;
      </Box>
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='0 auto 24px'>
        <AdsSlider sort='analytics' />
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
