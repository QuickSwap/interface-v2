import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { TopMovers, TokensTable } from 'components';
import { useBookmarkTokens } from 'state/application/hooks';
import { getEthPrice, getTopTokens } from 'utils';
import { Skeleton } from '@material-ui/lab';

const AnalyticsTokens: React.FC = () => {
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
      updateTopTokens(null); //set top tokens as null to show loading status when fetching tokens data
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
    <Box width='100%' mb={3}>
      <TopMovers background={palette.grey.A700} hideArrow={true} />
      <Box my={4} px={2} display='flex' flexWrap='wrap' alignItems='center'>
        <Box
          className='tokensFilter'
          onClick={() => setTokensFilter(0)}
          color={
            tokensFilter === 0 ? palette.primary.main : palette.text.disabled
          }
        >
          <p className='weight-600'>All Cryptos</p>
        </Box>
        <Box
          className='tokensFilter'
          color={
            tokensFilter === 1 ? palette.primary.main : palette.text.disabled
          }
          onClick={() => setTokensFilter(1)}
        >
          <p className='weight-600'>Favourites</p>
        </Box>
        <Box
          className='tokensFilter'
          color={
            tokensFilter === 2 ? palette.primary.main : palette.text.disabled
          }
          onClick={() => setTokensFilter(2)}
        >
          <p className='weight-600'>New Listing</p>
        </Box>
      </Box>
      <Box className='panel'>
        {topTokens && topTokens.length === 200 ? (
          <TokensTable data={tokensFilter === 0 ? topTokens : favoriteTokens} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsTokens;
