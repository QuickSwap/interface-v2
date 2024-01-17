import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Box } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { getAumForZkevm } from 'utils/getAumForZkevm';
import styles from 'styles/pages/Home.module.scss';

export const ZkEvmTvlInfoCard: React.FC = () => {
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
    <Box className={styles.tradingSection}>
      {loading && <Skeleton variant='rectangular' width={100} height={45} />}
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
