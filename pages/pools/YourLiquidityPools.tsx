import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import NoLiquidity from 'assets/images/NoLiquidityPool.png';
import { PoolFinderModal, PoolPositionCard } from 'components';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const YourLiquidityPools: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const history = useHistory();
  const [openPoolFinder, setOpenPoolFinder] = useState(false);
  const {
    loading: v2IsLoading,
    pairs: allV2PairsWithLiquidity,
  } = useV2LiquidityPools(account ?? undefined);

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
        {/* {!v2IsLoading && allV2PairsWithLiquidity.length > 0 && (
          <Box
            className='v3-manage-v2liquidity-button'
            onClick={() => history.push('/migrate')}
          >
            <small className='text-primary'>Migrate Liquidity to V3</small>
          </Box>
        )} */}
      </Box>

      <Box mt={3}>
        {v2IsLoading ? (
          <Box width={1}>
            <Skeleton width='100%' height={50} />
          </Box>
        ) : allV2PairsWithLiquidity.length > 0 ? (
          <Box>
            <small className='liquidityText'>
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
            <img
              src={NoLiquidity}
              alt='No Liquidity'
              className='noLiquidityImage'
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
