import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'config/index';
import { GlobalConst, DRAGON_EGGS_SHOW } from 'constants/index';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { Eggs } from 'components';

import {
  useGammaPositionsCount,
  useV3Positions,
  useDefiedgePositions,
  useV3SteerPositionsCount,
  useICHIPositionsCount,
  useUnipilotPositionsCount,
} from 'hooks/v3/useV3Positions';
import Loader from 'components/Loader';
import MyQuickswapPoolsV3 from '../MyQuickswapPoolsV3';
import MyGammaPoolsV3 from '../MyGammaPoolsV3';
import FilterPanelItem from '../FilterPanelItem';
import MyUnipilotPoolsV3 from '../MyUnipilotPoolsV3';
import MyDefiedgePoolsV3 from '../MyDefiedgePoolsV3';
import MySteerPoolsV3 from '../MySteerPoolsV3';
import MyICHIPools from '../MyICHIPools';

export default function MyLiquidityPoolsV3() {
  const { t } = useTranslation();
  const { chainId, account } = useActiveWeb3React();
  const history = useHistory();

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

  const { count: quickPoolsCount } = useV3Positions(
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
    gammaPoolsLoading &&
    uniPilotPositionsLoading &&
    steerPoolsLoading &&
    ichiLoading &&
    defiedgeStrategiesLoading;

  const [poolFilter, setPoolFilter] = useState(
    GlobalConst.utils.poolsFilter.quickswap,
  );

  const myPoolsFilter = useMemo(() => {
    const filters: any[] = [];
    filters.push({
      id: GlobalConst.utils.poolsFilter.quickswap,
      text: (
        <Box className='flex items-center'>
          <small>Quickswap</small>
          <Box
            ml='6px'
            className={`myV3PoolCountWrapper ${
              poolFilter === GlobalConst.utils.poolsFilter.quickswap
                ? 'activeMyV3PoolCountWrapper'
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
            <small>A51 Finance</small>
            <Box
              ml='6px'
              className={`myV3PoolCountWrapper ${
                poolFilter === GlobalConst.utils.poolsFilter.unipilot
                  ? 'activeMyV3PoolCountWrapper'
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
              className={`myV3PoolCountWrapper ${
                poolFilter === GlobalConst.utils.poolsFilter.gamma
                  ? 'activeMyV3PoolCountWrapper'
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
              className={`myV3PoolCountWrapper ${
                poolFilter === GlobalConst.utils.poolsFilter.defiedge
                  ? 'activeMyV3PoolCountWrapper'
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
              className={`myV3PoolCountWrapper ${
                poolFilter === GlobalConst.utils.poolsFilter.steer
                  ? 'activeMyV3PoolCountWrapper'
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
              className={`myV3PoolCountWrapper ${
                poolFilter === GlobalConst.utils.poolsFilter.ichi
                  ? 'activeMyV3PoolCountWrapper'
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
      <Box
        className='flex justify-between items-center'
        sx={{ position: 'relative', padding: '20px 0' }}
      >
        <p className='weight-600'>{t('myPools')}</p>
        <Box
          sx={{
            minWidth: '100px',
            position: 'absolute',
            right: '0px',
            top: '-80px',
          }}
        >
          {DRAGON_EGGS_SHOW && <Eggs type={3}></Eggs>}
        </Box>

        {allV2PairsWithLiquidity.length > 0 && isMigrateAvailable && (
          <Box
            className='v3-manage-v2liquidity-button'
            onClick={() => history.push('/migrate')}
          >
            <small className='text-primary'>Migrate V2 Liquidity</small>
          </Box>
        )}
      </Box>
      {loading ? (
        <Box py={5} className='flex items-center justify-center'>
          <Loader size='40px' />
        </Box>
      ) : (
        <>
          <Box className='myV3PoolsFilterWrapper'>
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
