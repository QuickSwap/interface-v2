import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { PoolFinderModal, PoolPositionCard } from 'components';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import { Trans, useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { getConfig } from 'config';
import styles from 'styles/pages/Pools.module.scss';

const YourLiquidityPools: React.FC = () => {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const router = useRouter();
  const [openPoolFinder, setOpenPoolFinder] = useState(false);
  const {
    loading: v2IsLoading,
    pairs: allV2PairsWithLiquidity,
  } = useV2LiquidityPools(account ?? undefined);
  const config = getConfig(chainId);
  const isMigrateAvailable = config['migrate']['available'];

  return (
    <>
      {openPoolFinder && (
        <PoolFinderModal
          open={openPoolFinder}
          onClose={() => setOpenPoolFinder(false)}
        />
      )}
      <Box className='pageHeading'>
        <p className='weight-600'>{t('yourliquidityPools')}</p>
        {!v2IsLoading &&
          allV2PairsWithLiquidity.length > 0 &&
          isMigrateAvailable && (
            <Box
              className={styles.v3ManageV2liquidityButton}
              onClick={() => router.push('/migrate')}
            >
              <small className='text-primary'>Migrate Liquidity to V3</small>
            </Box>
          )}
      </Box>

      <Box mt={3}>
        {v2IsLoading ? (
          <Box width={1}>
            <Skeleton width='100%' height={50} />
          </Box>
        ) : allV2PairsWithLiquidity.length > 0 ? (
          <Box>
            <small className={styles.liquidityText}>
              <Trans
                i18nKey='poolMissingComment'
                components={{
                  pspan: <small onClick={() => setOpenPoolFinder(true)} />,
                }}
              />
            </small>
            {allV2PairsWithLiquidity.map((pair, ind) => (
              <Box key={ind} mt={2}>
                <PoolPositionCard
                  key={pair.liquidityToken.address}
                  pair={pair}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box textAlign='center'>
            <Image
              src='/assets/images/NoLiquidityPool.png'
              alt='No Liquidity'
              className={styles.noLiquidityImage}
              width={286}
              height={176}
            />
            <p className='small liquidityText'>
              <Trans
                i18nKey='poolMissingComment'
                components={{
                  pspan: <small onClick={() => setOpenPoolFinder(true)} />,
                }}
              />
            </p>
          </Box>
        )}
      </Box>
    </>
  );
};

export default YourLiquidityPools;
