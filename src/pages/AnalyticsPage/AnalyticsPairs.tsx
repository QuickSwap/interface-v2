import React, { useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { PairTable } from 'components';
import { useTopPairs } from 'state/application/hooks';
import { getEthPrice, getTopPairs, getBulkPairData } from 'utils';

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
    fetchTopPairs();
  }, [updateTopPairs]);

  return (
    <>
      <Typography>All Pairs</Typography>
      <Box mt={4} paddingX={4} paddingY={3} className={classes.panel}>
        {topPairs && <PairTable data={topPairs} />}
      </Box>
    </>
  );
};

export default AnalyticsPairs;
