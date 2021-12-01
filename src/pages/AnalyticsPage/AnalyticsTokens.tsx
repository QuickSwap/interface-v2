import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TopMovers, TokensTable } from 'components';
import { useTopTokens } from 'state/application/hooks';
import { getEthPrice, getTopTokens } from 'utils';

const useStyles = makeStyles(({}) => ({
  tokensFilter: {
    cursor: 'pointer',
    display: 'flex',
  },
  panel: {
    background: '#1b1d26',
    borderRadius: 20,
  },
}));

const AnalyticsTokens: React.FC = () => {
  const classes = useStyles();
  const [tokensFilter, setTokensFilter] = useState(0);

  const { topTokens, updateTopTokens } = useTopTokens();

  useEffect(() => {
    updateTopTokens({ data: null });
    const fetchTopTokens = async () => {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const topTokensData = await getTopTokens(newPrice, oneDayPrice, 200);
      if (topTokensData) {
        updateTopTokens({ data: topTokensData });
      }
    };
    fetchTopTokens();
  }, [updateTopTokens]);

  return (
    <>
      <TopMovers background='#1b1d26' hideArrow={true} />
      <Box my={4} px={2} display='flex' alignItems='center'>
        <Box
          mr={4}
          className={classes.tokensFilter}
          onClick={() => setTokensFilter(0)}
          color={tokensFilter === 0 ? '#448aff' : '#626680'}
        >
          <Typography variant='h6'>All Cryptos</Typography>
        </Box>
        <Box
          mr={4}
          className={classes.tokensFilter}
          color={tokensFilter === 1 ? '#448aff' : '#626680'}
          onClick={() => setTokensFilter(1)}
        >
          <Typography variant='h6'>Favourites</Typography>
        </Box>
        <Box
          className={classes.tokensFilter}
          color={tokensFilter === 2 ? '#448aff' : '#626680'}
          onClick={() => setTokensFilter(2)}
        >
          <Typography variant='h6'>New Listing</Typography>
        </Box>
      </Box>
      <Box paddingX={4} paddingY={3} className={classes.panel}>
        {topTokens && <TokensTable data={topTokens} />}
      </Box>
    </>
  );
};

export default AnalyticsTokens;
