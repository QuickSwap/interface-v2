import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { ReactComponent as ArrowLeft } from 'assets/images/ArrowLeft.svg';
import { QuestionHelper, PoolFinderModal } from 'components';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import Loader from 'components/Loader';
import V2PositionCard from './components/V2PositionCard';
import './index.scss';
import { useTranslation } from 'react-i18next';

export default function MigrateV2LiquidityPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const { account } = useActiveWeb3React();
  const {
    loading: v2PairsLoading,
    pairs: allV2PairsWithLiquidity,
  } = useV2LiquidityPools(account ?? undefined);
  const [openPoolFinder, setOpenPoolFinder] = useState(false);

  return (
    <>
      {openPoolFinder && (
        <PoolFinderModal
          open={openPoolFinder}
          onClose={() => setOpenPoolFinder(false)}
        />
      )}
      <Box className='wrapper' maxWidth='464px' width='100%'>
        <Box className='flex justify-between items-center'>
          <Box
            className='flex cursor-pointer'
            onClick={() => history.push('pools/v3')}
          >
            <ArrowLeft />
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
        <Box mt={3}>
          {v2PairsLoading ? (
            <Box className='flex justify-center'>
              <Loader stroke='white' size={'2rem'} />
            </Box>
          ) : allV2PairsWithLiquidity.length > 0 ? (
            allV2PairsWithLiquidity.map((pair) => (
              <V2PositionCard key={pair.liquidityToken.address} pair={pair} />
            ))
          ) : (
            <Box textAlign='center'>
              <small>{t('noV2LiquidityPools')}</small>
            </Box>
          )}
        </Box>
        <Box mt={2} textAlign='center'>
          <small className='text-secondary'>
            {t('dontseeV2Liquidity')}?{' '}
            <small
              className='text-primary cursor-pointer'
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
