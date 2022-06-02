import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { PairTable } from 'components';
import { getEthPrice, getTopPairs, getBulkPairData } from 'utils';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';

const AnalyticsPairs: React.FC = () => {
  const { t } = useTranslation();
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
    <Box width='100%' mb={3}>
      <p>{t('allPairs')}</p>
      <Box mt={4} className='panel'>
        {topPairs ? (
          <PairTable data={topPairs} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsPairs;
