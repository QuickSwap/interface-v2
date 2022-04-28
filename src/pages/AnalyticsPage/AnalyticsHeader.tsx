import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useHistory, useLocation } from 'react-router-dom';
import { Box, Typography } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import cx from 'classnames';
import Search from 'components/Search';
import { shortenAddress } from 'utils';

const useStyles = makeStyles(({ palette }) => ({
  topTab: {
    height: 46,
    padding: '0 24px',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '& p': {
      color: palette.text.disabled,
    },
  },
  selectedTab: {
    background: palette.secondary.light,
    '& p': {
      color: palette.text.primary,
    },
  },
  link: {
    cursor: 'pointer',
    color: palette.text.secondary,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

interface AnalyticHeaderProps {
  data?: any;
  type?: string;
}

const AnalyticsHeader: React.FC<AnalyticHeaderProps> = ({ data, type }) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const history = useHistory();
  const { pathname } = useLocation();

  return (
    <Box width='100%' mb={3}>
      <Box mb={4}>
        <Typography variant='h4'>Quickswap Analytics</Typography>
      </Box>
      <Box
        mb={4}
        position='relative'
        display='flex'
        justifyContent='space-between'
        flexWrap='wrap'
      >
        <Box marginY={1.5} display='flex' alignItems='center'>
          {type && data && (
            <Box display='flex' alignItems='center' color={palette.text.hint}>
              <Typography
                variant='caption'
                className={classes.link}
                onClick={() => {
                  history.push('/analytics');
                }}
              >
                Analytics
              </Typography>
              <ArrowForwardIos style={{ width: 16 }} />
              <Typography
                variant='caption'
                className={classes.link}
                onClick={() => {
                  history.push(`/analytics/${type}s`);
                }}
              >
                {type === 'token' ? 'Tokens' : 'Pairs'}
              </Typography>
              <ArrowForwardIos style={{ width: 16 }} />
              <Typography variant='caption'>
                <span style={{ color: '#b6b9cc' }}>
                  {type === 'token'
                    ? data.symbol
                    : `${data.token0.symbol}/${data.token1.symbol}`}
                </span>
                ({shortenAddress(data.id)})
              </Typography>
            </Box>
          )}
          {!type && (
            <>
              <Box
                className={cx(
                  classes.topTab,
                  pathname.indexOf('pair') === -1 &&
                    pathname.indexOf('token') === -1 &&
                    classes.selectedTab,
                )}
                onClick={() => history.push(`/analytics`)}
              >
                <Typography variant='body1'>Overview</Typography>
              </Box>
              <Box
                className={cx(
                  classes.topTab,
                  pathname.indexOf('token') > -1 && classes.selectedTab,
                )}
                onClick={() => history.push(`/analytics/tokens`)}
              >
                <Typography variant='body1'>Tokens</Typography>
              </Box>
              <Box
                className={cx(
                  classes.topTab,
                  pathname.indexOf('pair') > -1 && classes.selectedTab,
                )}
                onClick={() => history.push(`/analytics/pairs`)}
              >
                <Typography variant='body1'>Pairs</Typography>
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
