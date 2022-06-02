import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import Search from 'components/Search';
import { shortenAddress } from 'utils';
import 'pages/styles/analytics.scss';

interface AnalyticHeaderProps {
  data?: any;
  type?: string;
}

const AnalyticsHeader: React.FC<AnalyticHeaderProps> = ({ data, type }) => {
  const history = useHistory();
  const { pathname } = useLocation();

  return (
    <Box width='100%' mb={3}>
      <Box mb={4}>
        <h4>Quickswap Analytics</h4>
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
                  history.push('/analytics');
                }}
              >
                Analytics
              </span>
              <ArrowForwardIos style={{ width: 16 }} />
              <span
                className='link'
                onClick={() => {
                  history.push(`/analytics/${type}s`);
                }}
              >
                {type === 'token' ? 'Tokens' : 'Pairs'}
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
                onClick={() => history.push(`/analytics`)}
              >
                <p>Overview</p>
              </Box>
              <Box
                className={`topTab ${pathname.indexOf('token') > -1 &&
                  'selectedTab'}`}
                onClick={() => history.push(`/analytics/tokens`)}
              >
                <p>Tokens</p>
              </Box>
              <Box
                className={`topTab ${pathname.indexOf('pair') > -1 &&
                  'selectedTab'}`}
                onClick={() => history.push(`/analytics/pairs`)}
              >
                <p>Pairs</p>
              </Box>
            </>
          )}
        </Box>

        <Search />
      </Box>
    </Box>
  );
};

export default AnalyticsHeader;
