import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { TopMovers, TokensTable } from 'components';
import { useBookmarkTokens } from 'state/application/hooks';
import { getEthPrice, getTopTokens } from 'utils';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  tokensFilter: {
    cursor: 'pointer',
    display: 'flex',
    margin: '8px 16px 8px 0',
  },
  panel: {
    background: palette.grey.A700,
    borderRadius: 20,
    padding: 24,
    [breakpoints.down('xs')]: {
      padding: 12,
    },
  },
}));

const AnalyticsTokens: React.FC = () => {
  const classes = useStyles();
  const { palette } = useTheme();
  const [tokensFilter, setTokensFilter] = useState(0);

  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const { bookmarkTokens } = useBookmarkTokens();

  const favoriteTokens = useMemo(() => {
    if (topTokens) {
      return topTokens.filter(
        (token: any) => bookmarkTokens.indexOf(token.id) > -1,
      );
    } else {
      return [];
    }
  }, [topTokens, bookmarkTokens]);

  useEffect(() => {
    const fetchTopTokens = async () => {
      updateTopTokens(null);
      const [newPrice, oneDayPrice] = await getEthPrice();
      const topTokensData = await getTopTokens(newPrice, oneDayPrice, 200);
      if (topTokensData) {
        updateTopTokens(topTokensData);
      }
    };
    fetchTopTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateTopTokens]);

  return (
    <>
      <TopMovers background={palette.grey.A700} hideArrow={true} />
      <Box my={4} px={2} display='flex' flexWrap='wrap' alignItems='center'>
        <Box
          className={classes.tokensFilter}
          onClick={() => setTokensFilter(0)}
          color={
            tokensFilter === 0 ? palette.primary.main : palette.text.disabled
          }
        >
          <Typography variant='h6'>All Cryptos</Typography>
        </Box>
        <Box
          className={classes.tokensFilter}
          color={
            tokensFilter === 1 ? palette.primary.main : palette.text.disabled
          }
          onClick={() => setTokensFilter(1)}
        >
          <Typography variant='h6'>Favourites</Typography>
        </Box>
        <Box
          className={classes.tokensFilter}
          color={
            tokensFilter === 2 ? palette.primary.main : palette.text.disabled
          }
          onClick={() => setTokensFilter(2)}
        >
          <Typography variant='h6'>New Listing</Typography>
        </Box>
      </Box>
      <Box className={classes.panel}>
        {topTokens && topTokens.length === 200 ? (
          <TokensTable data={tokensFilter === 0 ? topTokens : favoriteTokens} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </>
  );
};

export default AnalyticsTokens;
