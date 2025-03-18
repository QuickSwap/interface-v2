import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'config/index';
import { GlobalConst, DRAGON_EGGS_SHOW } from 'constants/index';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { Eggs } from 'components';
import Loader from 'components/Loader';
import {
  useV3SteerPositionsCount,
  useV3Positions,
} from 'hooks/v3/useV3Positions';
import MyQuickswapPoolsV3 from '../MyQuickswapPoolsV3';
import MySteerPoolsV3 from '../MySteerPoolsV3';
import FilterPanelItem from '../FilterPanelItem';

export default function MyLiquidityPoolsV4() {
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
  const [quickswapPoolsLoading, setQuickswapPoolsLoading] = useState(false);

  const filters = [
    {
      title: t('closed'),
      method: setUserHideQuickClosedPositions,
      checkValue: userHideQuickClosedPositions,
    },
  ];

  const {
    count: quickPoolsCount,
    includeCloseCount: quickPoolsTotalCount,
    loading: quickswapCountLoading,
  } = useV3Positions(account, userHideQuickClosedPositions, false, true);

  const {
    count: steerPoolsCount,
    loading: steerPoolsCountLoading,
  } = useV3SteerPositionsCount();

  const counterLoading = quickswapCountLoading || steerPoolsCountLoading;
  const poolLoading = quickswapPoolsLoading;

  const [poolFilter, setPoolFilter] = useState(
    GlobalConst.utils.poolsFilter.all,
  );

  const myPoolsFilter = useMemo(() => {
    const filters: any[] = [];
    // all tab
    filters.push({
      id: GlobalConst.utils.poolsFilter.all,
      text: (
        <Box className='flex items-center'>
          <small>All</small>
          <Box
            ml='6px'
            className={`myV3PoolCountWrapper ${
              poolFilter === GlobalConst.utils.poolsFilter.all
                ? 'activeMyV3PoolCountWrapper'
                : ''
            }`}
          >
            {(quickPoolsTotalCount ?? 0) + steerPoolsCount}
          </Box>
        </Box>
      ),
    });

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
    return filters;
  }, [poolFilter, quickPoolsTotalCount, steerPoolsCount, quickPoolsCount]);

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
      {!!account && counterLoading ? (
        <Box py={5} className='flex items-center justify-center'>
          <Loader stroke='white' size={'2rem'} />
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
            {((!!account && counterLoading) || (account && poolLoading)) && (
              <Box py={5} className='flex items-center justify-center'>
                <Loader size='40px' />
              </Box>
            )}
            {!counterLoading && (
              <>
                {poolFilter === GlobalConst.utils.poolsFilter.all && (
                  <>
                    {(quickPoolsCount ?? 0) > 0 && (
                      <MyQuickswapPoolsV3
                        userHideClosedPositions={userHideQuickClosedPositions}
                        isForAll={true}
                        setIsLoading={setQuickswapPoolsLoading}
                      />
                    )}
                    {steerPoolsCount > 0 && <MySteerPoolsV3 isForAll={true} />}
                  </>
                )}
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
                      userHideClosedPositions={userHideQuickClosedPositions}
                    />
                  </>
                )}
                {poolFilter === GlobalConst.utils.poolsFilter.steer && (
                  <MySteerPoolsV3 />
                )}
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
