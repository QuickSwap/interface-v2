import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useLocation } from 'react-router-dom';
import { Box, Typography } from '@material-ui/core';
import cx from 'classnames';
import Search from 'components/Search';

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
}));

const AnalyticsHeader: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { pathname } = useLocation();

  return (
    <Box width='100%' mb={3}>
      {console.log('header rendered')}
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
        </Box>

        <Search />
      </Box>
    </Box>
  );
};

export default AnalyticsHeader;
