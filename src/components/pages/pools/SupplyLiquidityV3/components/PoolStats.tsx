import React, { ReactElement } from 'react';
import { Box, CircularProgress } from '@mui/material';
import styles from 'styles/pages/pools/PoolStats.module.scss';
import { useTranslation } from 'next-i18next';

interface IPoolStats {
  fee: string | ReactElement;
  apr: string | ReactElement | undefined;
  noLiquidity: boolean | undefined;
  loading: boolean;
}

export function PoolStats({ fee, apr, noLiquidity, loading }: IPoolStats) {
  const { t } = useTranslation();
  if (loading)
    return (
      <Box className='flex items-center justify-center'>
        <CircularProgress />
      </Box>
    );

  return (
    <Box className={styles.poolStats}>
      <span>{noLiquidity ? t('newPool') : t('currentPoolstats')}</span>
      <Box mt='6px' className='flex items-center'>
        <Box className={`${styles.poolStatsWrapper} bg-primaryLight`}>
          <span>{fee}</span>
        </Box>
        {apr && (
          <Box
            ml='6px'
            className={`${styles.poolStatsWrapper} bg-successLight`}
          >
            <span className='text-success'>
              {apr}% {t('apr')}
            </span>
          </Box>
        )}
      </Box>
    </Box>
  );
}
