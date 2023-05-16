import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import { ArrowBack } from '@mui/icons-material';
import { QuestionHelper, PoolFinderModal } from 'components';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import V2PositionCard from './components/V2PositionCard';
import { useTranslation } from 'next-i18next';
import { getConfig } from 'config';

export default function MigrateV2LiquidityPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { account, chainId } = useActiveWeb3React();
  const {
    loading: v2PairsLoading,
    pairs: allV2PairsWithLiquidity,
  } = useV2LiquidityPools(account ?? undefined);
  const [openPoolFinder, setOpenPoolFinder] = useState(false);

  const config = getConfig(chainId);
  const isMigrateAvailable = config['migrate']['available'];

  useEffect(() => {
    if (!isMigrateAvailable) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMigrateAvailable]);

  return (
    <>
      {openPoolFinder && (
        <PoolFinderModal
          open={openPoolFinder}
          onClose={() => setOpenPoolFinder(false)}
        />
      )}
      <Box className='wrapper' maxWidth='464px' width='100%'>
        <Box className='flex items-center justify-between'>
          <Box
            className='flex cursor-pointer'
            onClick={() => router.push('pools/v3')}
          >
            <ArrowBack />
          </Box>
          <p className='weight-600'>{t('migrateLiquidity')}</p>
          <Box
            width={28}
            height={28}
            className='flex items-center justify-center'
          >
            <QuestionHelper size={24} className='text-secondary' text='' />
          </Box>
        </Box>
        <Box mt={3}>
          <small>{t('migrateLiquidityDesc')}</small>
        </Box>
        <Box>
          {v2PairsLoading ? (
            <Box className='flex justify-center' mt={3}>
              <CircularProgress size={'2rem'} />
            </Box>
          ) : allV2PairsWithLiquidity.length > 0 ? (
            allV2PairsWithLiquidity.map((pair) => (
              <Box mt={3} key={pair.liquidityToken.address}>
                <V2PositionCard pair={pair} />
              </Box>
            ))
          ) : (
            <Box textAlign='center' mt={3}>
              <small>{t('noV2LiquidityPools')}</small>
            </Box>
          )}
        </Box>
        <Box mt={2} textAlign='center'>
          <small className='text-secondary'>
            {t('dontseeV2Liquidity')}?{' '}
            <small
              className='cursor-pointer text-primary'
              onClick={() => setOpenPoolFinder(true)}
            >
              {t('importIt')}
            </small>
          </small>
        </Box>
      </Box>
    </>
  );
}
