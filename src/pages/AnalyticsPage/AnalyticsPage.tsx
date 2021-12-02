import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import cx from 'classnames';
import { useAnalyticToken } from 'state/application/hooks';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import AnalyticsOverview from './AnalyticsOverview';
import AnalyticsTokens from './AnalyticsTokens';
import AnalyticsPairs from './AnalyticsPairs';
import AnalyticsTokenDetails from './AnalyticTokenDetails';

const useStyles = makeStyles(({}) => ({
  topTab: {
    width: 120,
    height: 46,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '& p': {
      color: '#626680',
    },
  },
  selectedTab: {
    background: '#252833',
    '& p': {
      color: '#ebecf2',
    },
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    background: '#1b1d26',
    height: 46,
    borderRadius: 10,
    margin: '12px 0',
    '& input': {
      background: 'transparent',
      border: 'none',
      outline: 'none',
      fontSize: 15,
      fontWeight: 500,
      minWidth: 240,
      color: '#ebecf2',
    },
  },
}));

const AnalyticsPage: React.FC = () => {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const { analyticToken, updateAnalyticToken } = useAnalyticToken();

  useEffect(() => {
    updateAnalyticToken(null);
  }, []);

  return (
    <Box width='100%' mb={3}>
      {analyticToken ? (
        <AnalyticsTokenDetails token={analyticToken} goBack={setTabIndex} />
      ) : (
        <>
          <Box mb={4}>
            <Typography variant='h4'>Quickswap Analytics</Typography>
          </Box>
          <Box
            mb={4}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            flexWrap='wrap'
          >
            <Box display='flex' alignItems='center'>
              <Box
                className={cx(
                  classes.topTab,
                  tabIndex === 0 && classes.selectedTab,
                )}
                onClick={() => setTabIndex(0)}
              >
                <Typography variant='body1'>Overview</Typography>
              </Box>
              <Box
                className={cx(
                  classes.topTab,
                  tabIndex === 1 && classes.selectedTab,
                )}
                onClick={() => setTabIndex(1)}
              >
                <Typography variant='body1'>Tokens</Typography>
              </Box>
              <Box
                className={cx(
                  classes.topTab,
                  tabIndex === 2 && classes.selectedTab,
                )}
                onClick={() => setTabIndex(2)}
              >
                <Typography variant='body1'>Pairs</Typography>
              </Box>
            </Box>
            <Box className={classes.searchInput}>
              <input
                placeholder='Search for tokens, pairs, etc…'
                value={searchVal}
                onChange={(evt) => setSearchVal(evt.target.value)}
              />
              <Box display='flex'>
                <SearchIcon />
              </Box>
            </Box>
          </Box>
          {tabIndex === 0 && (
            <AnalyticsOverview
              showAllTokens={() => setTabIndex(1)}
              showAllPairs={() => setTabIndex(2)}
            />
          )}
          {tabIndex === 1 && <AnalyticsTokens />}
          {tabIndex === 2 && <AnalyticsPairs />}
        </>
      )}
    </Box>
  );
};

export default AnalyticsPage;
