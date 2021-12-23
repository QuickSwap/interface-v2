import React, { useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { PairTable } from 'components';
import { useTopPairs } from 'state/application/hooks';
import { getEthPrice, getTopPairs, getBulkPairData } from 'utils';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles(({ breakpoints }) => ({
  tokensFilter: {
    cursor: 'pointer',
    display: 'flex',
  },
  panel: {
    background: '#1b1d26',
    borderRadius: 20,
    padding: 24,
    [breakpoints.down('xs')]: {
      padding: 12,
    },
  },
}));

const AnalyticsPairs: React.FC = () => {
  const classes = useStyles();
  const { topPairs, updateTopPairs } = useTopPairs();

  useEffect(() => {
    updateTopPairs(null);
    const fetchTopPairs = async () => {
      const [newPrice] = await getEthPrice();
      const pairs = await getTopPairs(500);
      const formattedPairs = pairs
        ? pairs.map((pair: any) => {
            return pair.id;
          })
        : [];
      const pairData = await getBulkPairData(formattedPairs, newPrice);
      if (pairData) {
        updateTopPairs(pairData);
      }
    };
    if (!topPairs || topPairs.length < 500) {
      fetchTopPairs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateTopPairs]);

  return (
    <>
      <Typography>All Pairs</Typography>
      <Box mt={4} className={classes.panel}>
        {topPairs ? (
          <PairTable data={topPairs} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </>
  );
};

export default AnalyticsPairs;
