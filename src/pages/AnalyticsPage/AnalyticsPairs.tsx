import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { PairTable } from 'components';
import { getEthPrice, getTopPairs, getBulkPairData } from 'utils';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  tokensFilter: {
    cursor: 'pointer',
    display: 'flex',
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

const AnalyticsPairs: React.FC = () => {
  const classes = useStyles();
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchTopPairs = async () => {
      updateTopPairs(null);
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
    fetchTopPairs();
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
