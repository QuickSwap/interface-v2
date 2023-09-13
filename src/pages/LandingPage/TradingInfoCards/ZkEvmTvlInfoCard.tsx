import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { getAumForZkevm } from 'utils/getAumForZkevm';

export const ZkEvmTvlInfoCard: React.FC = ({}) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    getAumForZkevm()
      .then((value) => {
        setRewards(value);
      })
      .catch((error) => {
        console.log('error => ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Box className='tradingSection'>
      {loading && <Skeleton variant='rect' width={100} height={45} />}
      {!loading && rewards && (
        <Box>
          <Box display='flex'>
            <h6>$</h6>
            <h3>{rewards}</h3>
          </Box>
        </Box>
      )}
      <p className='text-uppercase'>{t('qlpPool')}</p>
    </Box>
  );
};
