import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'config/index';
import { GlobalConst, DRAGON_EGGS_SHOW } from 'constants/index';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { Eggs } from 'components';

import { useV3Positions } from 'hooks/v3/useV3Positions';
import MyQuickswapPoolsV3 from '../MyQuickswapPoolsV3';
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

  const filters = [
    {
      title: t('closed'),
      method: setUserHideQuickClosedPositions,
      checkValue: userHideQuickClosedPositions,
    },
    // {
    //   title: t('farming'),
    //   method: setHideQuickFarmingPositions,
    //   checkValue: hideQuickFarmingPositions,
    // },
  ];

  const { count: quickPoolsCount } = useV3Positions(
    account,
    userHideQuickClosedPositions,
    false,
    true,
  );

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
    return filters;
  }, [poolFilter, quickPoolsCount]);

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
              userHideClosedPositions={userHideQuickClosedPositions}
            />
          </>
        )}
      </Box>
    </Box>
  );
}
