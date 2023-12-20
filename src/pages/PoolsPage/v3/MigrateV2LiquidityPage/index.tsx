import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { ReactComponent as ArrowLeft } from 'assets/images/ArrowLeft.svg';
import { QuestionHelper, PoolFinderModal } from 'components';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import Loader from 'components/Loader';
import V2PositionCard from './components/V2PositionCard';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'config/index';

export default function MigrateV2LiquidityPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const { chainId, account } = useActiveWeb3React();
  const {
    loading: v2PairsLoading,
    pairs: allV2PairsWithLiquidity,
  } = useV2LiquidityPools(account ?? undefined);
  const [openPoolFinder, setOpenPoolFinder] = useState(false);

  const config = getConfig(chainId);
  const isMigrateAvailable = config['migrate']['available'];

  useEffect(() => {
    if (!isMigrateAvailable) {
      history.push('/');
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
      <Box className='wrapper' maxWidth='464px' width='100%' mb={6}>
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
            {/* <QuestionHelper size={24} className='text-secondary' text='' /> */}
          </Box>
        </Box>
        <Box mt={3}>
          <small>{t('migrateLiquidityDesc')}</small>
        </Box>
        <Box>
          {v2PairsLoading ? (
            <Box className='flex justify-center' mt={3}>
              <Loader stroke='white' size={'2rem'} />
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
