import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress } from '@mui/material';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import { useTranslation } from 'next-i18next';
import { getConfig } from 'config/index';
import { GlobalConst } from 'constants/index';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import {
  useGammaPositionsCount,
  useV3PositionsCount,
  useDefiedgePositions,
  useV3SteerPositionsCount,
  useICHIPositionsCount,
  useUnipilotPositionsCount,
} from 'hooks/v3/useV3Positions';
import MyQuickswapPoolsV3 from './MyQuickswapPoolsV3';
import MyGammaPoolsV3 from './MyGammaPoolsV3';
import FilterPanelItem from './FilterPanelItem';
import MyUnipilotPoolsV3 from './MyUnipilotPoolsV3';
import MyDefiedgePoolsV3 from './MyDefiedgePoolsV3';
import MySteerPoolsV3 from './MySteerPoolsV3';
import MyICHIPools from './MyICHIPools';
import styles from 'styles/pages/Pools.module.scss';

export default function MyLiquidityPoolsV3() {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const router = useRouter();

  const { pairs: allV2PairsWithLiquidity } = useV2LiquidityPools(
    account ?? undefined,
  );

  const config = getConfig(chainId);
  const isMigrateAvailable = config['migrate']['available'];

  const [
    userHideQuickClosedPositions,
    setUserHideQuickClosedPositions,
  ] = useState(true);
  const [hideQuickFarmingPositions, setHideQuickFarmingPositions] = useState(
    false,
  );

  const filters = [
    {
      title: t('closed'),
      method: setUserHideQuickClosedPositions,
      checkValue: userHideQuickClosedPositions,
    },
    {
      title: t('farming'),
      method: setHideQuickFarmingPositions,
      checkValue: hideQuickFarmingPositions,
    },
  ];

  const {
    loading: quickPoolsLoading,
    count: quickPoolsCount,
  } = useV3PositionsCount(
    account,
    userHideQuickClosedPositions,
    hideQuickFarmingPositions,
  );
  const {
    loading: gammaPoolsLoading,
    count: gammaPoolsCount,
  } = useGammaPositionsCount(account, chainId);

  const {
    loading: uniPilotPositionsLoading,
    count: unipilotPositionsCount,
  } = useUnipilotPositionsCount(account, chainId);

  const {
    loading: defiedgeStrategiesLoading,
    count: defiedgeStrategiesCount,
  } = useDefiedgePositions(account, chainId);

  const {
    loading: steerPoolsLoading,
    count: steerPoolsCount,
  } = useV3SteerPositionsCount();

  const { loading: ichiLoading, count: ichiCount } = useICHIPositionsCount();

  const loading =
    quickPoolsLoading ||
    gammaPoolsLoading ||
    uniPilotPositionsLoading ||
    steerPoolsLoading ||
    ichiLoading ||
    defiedgeStrategiesLoading;

  const [poolFilter, setPoolFilter] = useState(
    GlobalConst.utils.poolsFilter.quickswap,
  );

  const myPoolsFilter = useMemo(() => {
    const filters = [];
    filters.push({
      id: GlobalConst.utils.poolsFilter.quickswap,
      text: (
        <Box className='flex items-center'>
          <small>Quickswap</small>
          <Box
            ml='6px'
            className={`${styles.myV3PoolCountWrapper} ${
              poolFilter === GlobalConst.utils.poolsFilter.quickswap
                ? styles.activeMyV3PoolCountWrapper
                : ''
            }`}
          >
            {quickPoolsCount}
          </Box>
        </Box>
      ),
    });
    if (unipilotPositionsCount > 0) {
      filters.push({
        id: GlobalConst.utils.poolsFilter.unipilot,
        text: (
          <Box className='flex items-center'>
            <small>Unipilot</small>
            <Box
              ml='6px'
              className={`${styles.myV3PoolCountWrapper} ${
                poolFilter === GlobalConst.utils.poolsFilter.unipilot
                  ? styles.activeMyV3PoolCountWrapper
                  : ''
              }`}
            >
              {unipilotPositionsCount}
            </Box>
          </Box>
        ),
      });
    }
    if (gammaPoolsCount > 0) {
      filters.push({
        id: GlobalConst.utils.poolsFilter.gamma,
        text: (
          <Box className='flex items-center'>
            <small>Gamma</small>
            <Box
              ml='6px'
              className={`${styles.myV3PoolCountWrapper} ${
                poolFilter === GlobalConst.utils.poolsFilter.gamma
                  ? styles.activeMyV3PoolCountWrapper
                  : ''
              }`}
            >
              {gammaPoolsCount}
            </Box>
          </Box>
        ),
      });
    }
    if (defiedgeStrategiesCount > 0) {
      filters.push({
        id: GlobalConst.utils.poolsFilter.defiedge,
        text: (
          <Box className='flex items-center'>
            <small>Defiedge</small>
            <Box
              ml='6px'
              className={`${styles.myV3PoolCountWrapper} ${
                poolFilter === GlobalConst.utils.poolsFilter.defiedge
                  ? styles.activeMyV3PoolCountWrapper
                  : ''
              }`}
            >
              {defiedgeStrategiesCount}
            </Box>
          </Box>
        ),
      });
    }
    if (steerPoolsCount > 0) {
      filters.push({
        id: GlobalConst.utils.poolsFilter.steer,
        text: (
          <Box className='flex items-center'>
            <small>Steer</small>
            <Box
              ml='6px'
              className={`${styles.myV3PoolCountWrapper} ${
                poolFilter === GlobalConst.utils.poolsFilter.steer
                  ? styles.activeMyV3PoolCountWrapper
                  : ''
              }`}
            >
              {steerPoolsCount}
            </Box>
          </Box>
        ),
      });
    }
    if (ichiCount > 0) {
      filters.push({
        id: GlobalConst.utils.poolsFilter.ichi,
        text: (
          <Box className='flex items-center'>
            <small>ICHI</small>
            <Box
              ml='6px'
              className={`${styles.myV3PoolCountWrapper} ${
                poolFilter === GlobalConst.utils.poolsFilter.ichi
                  ? styles.activeMyV3PoolCountWrapper
                  : ''
              }`}
            >
              {ichiCount}
            </Box>
          </Box>
        ),
      });
    }
    return filters;
  }, [
    poolFilter,
    quickPoolsCount,
    unipilotPositionsCount,
    gammaPoolsCount,
    defiedgeStrategiesCount,
    steerPoolsCount,
    ichiCount,
  ]);

  return (
    <Box>
      <Box className='flex justify-between items-center'>
        <p className='weight-600'>{t('myPools')}</p>
        {allV2PairsWithLiquidity.length > 0 && isMigrateAvailable && (
          <Box
            className={styles.v3ManageV2liquidityButton}
            onClick={() => router.push('/migrate')}
          >
            <small className='text-primary'>Migrate V2 Liquidity</small>
          </Box>
        )}
      </Box>
      {loading ? (
        <Box py={5} className='flex items-center justify-center'>
          <CircularProgress size='40px' />
        </Box>
      ) : (
        <>
          <Box className={styles.myV3PoolsFilterWrapper}>
            <CustomTabSwitch
              items={myPoolsFilter}
              value={poolFilter}
              handleTabChange={setPoolFilter}
              height={50}
            />
          </Box>
          <Box>
            {poolFilter === GlobalConst.utils.poolsFilter.quickswap && (
              <>
                {account && (
                  <Box mt={2} className='flex justify-between items-center'>
                    <Box className='flex'>
                      {filters.map((item, key) => (
                        <Box mr={1} key={key}>
                          <FilterPanelItem item={item} />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                <MyQuickswapPoolsV3
                  hideFarmingPositions={hideQuickFarmingPositions}
                  userHideClosedPositions={userHideQuickClosedPositions}
                />
              </>
            )}
            {poolFilter === GlobalConst.utils.poolsFilter.unipilot && (
              <MyUnipilotPoolsV3 />
            )}
            {poolFilter === GlobalConst.utils.poolsFilter.gamma && (
              <MyGammaPoolsV3 />
            )}
            {poolFilter === GlobalConst.utils.poolsFilter.defiedge && (
              <MyDefiedgePoolsV3 />
            )}
            {poolFilter === GlobalConst.utils.poolsFilter.steer && (
              <MySteerPoolsV3 />
            )}
            {poolFilter === GlobalConst.utils.poolsFilter.ichi && (
              <MyICHIPools />
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
