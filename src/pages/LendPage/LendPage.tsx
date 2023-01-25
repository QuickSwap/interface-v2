import React, { useMemo, useState } from 'react';
import { Box, Grid, Skeleton } from 'theme/components';
import { SearchInput, CustomMenu, CurrencyLogo } from 'components';
import { useHistory } from 'react-router-dom';
import { useActiveWeb3React } from 'hooks';
import { midUsdFormatter } from 'utils/bigUtils';
import { PoolData, USDPricedPoolAsset } from 'utils/marketxyz/fetchPoolData';
import { useTranslation } from 'react-i18next';
import 'pages/styles/lend.scss';
import { getPoolAssetToken } from 'utils/marketxyz';
import { Token } from '@uniswap/sdk';
import { GlobalValue } from 'constants/index';
import LendAlertBox from './LendAlertBox';
import { usePoolsData } from 'hooks/marketxyz/usePoolData';
import AdsSlider from 'components/AdsSlider';
import { useIsXS } from 'hooks/useMediaQuery';

const LendPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { chainId } = useActiveWeb3React();
  const isMobile = useIsXS();

  const [lendSortBy, setLendSortBy] = useState('');
  const lendSortItems = [t('highestSupply'), t('highestBorrow')];
  const [isMyPools, setIsMyPools] = useState(false);

  const pools = usePoolsData(
    GlobalValue.marketSDK.QS_Pools,
    GlobalValue.marketSDK.QS_PoolDirectory,
  );

  const totalSupply = useMemo(() => {
    if (!pools) return undefined;
    return pools
      .map((poolData) => poolData?.totalSuppliedUSD ?? 0)
      .reduce((total, val) => total + val, 0);
  }, [pools]);

  const totalBorrow = useMemo(() => {
    if (!pools) return undefined;
    return pools
      .map((poolData) => poolData?.totalBorrowedUSD ?? 0)
      .reduce((total, val) => total + val, 0);
  }, [pools]);

  const totalLiquidity = useMemo(() => {
    if (!pools) return undefined;
    return pools
      .map((poolData) => poolData?.totalLiquidityUSD ?? 0)
      .reduce((total, val) => total + val, 0);
  }, [pools]);

  const [searchInput, setSearchInput] = useState('');
  const lendDataArr = [
    {
      label: t('totalSupply'),
      data:
        totalSupply !== undefined ? midUsdFormatter(totalSupply) : undefined,
    },
    {
      label: t('totalBorrowed'),
      data:
        totalBorrow !== undefined ? midUsdFormatter(totalBorrow) : undefined,
    },
    {
      label: t('liquidity'),
      data:
        totalLiquidity !== undefined
          ? midUsdFormatter(totalLiquidity)
          : undefined,
    },
    { label: t('markets'), data: pools?.filter((pool) => !!pool).length },
  ];

  const filteredPools = pools
    ? pools
        .filter(
          (pool: PoolData | undefined) =>
            pool &&
            (pool.assets.filter(
              (asset: USDPricedPoolAsset) =>
                asset.underlyingSymbol
                  .toLowerCase()
                  .includes(searchInput.toLowerCase()) ||
                asset.underlyingName
                  .toLowerCase()
                  .includes(searchInput.toLowerCase()),
            ).length > 0 ||
              pool.pool.name
                .toLowerCase()
                .includes(searchInput.toLowerCase())) &&
            (isMyPools
              ? pool.totalSuppliedUSD > 0 || pool.totalBorrowedUSD > 0
              : true),
        )
        .sort((poolA: PoolData | undefined, poolB: PoolData | undefined) => {
          const totalSuppliedUSDA = poolA?.totalSuppliedUSD ?? 0;
          const totalSuppliedUSDB = poolB?.totalSuppliedUSD ?? 0;
          const totalBorrowedUSDA = poolA?.totalBorrowedUSD ?? 0;
          const totalBorrowedUSDB = poolB?.totalBorrowedUSD ?? 0;
          if (lendSortBy === t('highestSupply')) {
            return totalSuppliedUSDA > totalSuppliedUSDB ? -1 : 1;
          } else if (lendSortBy === t('highestBorrow')) {
            return totalBorrowedUSDA > totalBorrowedUSDB ? -1 : 1;
          }
          return 0;
        })
    : undefined;

  return (
    <Box width={'100%'}>
      <Box
        margin={'0 0 40px'}
        // sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}
      >
        <h4 className='text-bold'>{t('lend')}</h4>
      </Box>
      <LendAlertBox />
      <Box maxWidth={isMobile ? '320px' : '1136px'} margin='16px auto 24px'>
        <AdsSlider sort='lend' />
      </Box>
      <Box margin='0 0 24px' textAlign='center'>
        <h4 className='text-bold'>{t('lendPageTitle')}</h4>
        <Box margin={'16px auto 0'} maxWidth={'520px'}>
          <p>{t('lendPageSubTitle')}</p>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {lendDataArr.map((item) => (
          <Grid key={item.label} item xs={12} sm={6} md={3}>
            <Box className='lendPageData'>
              <small className='text-secondary'>{item.label}</small>
              {item.data ? (
                <h4>{item.data}</h4>
              ) : (
                <Skeleton variant='rect' height='40px' />
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box
        margin='32px 0'
        className='flex items-center flex-wrap'
        // sx={{
        //   justifyContent: { xs: 'center', sm: 'center', md: 'space-between' },
        // }}
        // gridGap={'24px'}
      >
        <Box
          className='flex'
          // gridGap={'24px'}
        >
          <h6
            className={`text-bold ${
              isMyPools ? 'text-secondary' : 'text-primary'
            } cursor-pointer`}
            onClick={() => setIsMyPools(false)}
          >
            {t('allPools')}
          </h6>
          <h6
            className={`text-bold ${
              isMyPools ? 'text-primary' : 'text-secondary'
            } cursor-pointer`}
            onClick={() => setIsMyPools(true)}
          >
            {t('myPools')}
          </h6>
        </Box>
        <Box
          className={'flex'}
          // sx={{
          //   flexDirection: { xs: 'column', sm: 'row' },
          //   width: { xs: '100%', sm: 'unset' },
          // }}
          // gridGap={'16px'}
        >
          <SearchInput
            placeholder={t('search')}
            value={searchInput}
            setValue={setSearchInput}
          />
          <Box
            // sx={{ minWidth: { xs: '100%', sm: '230px' } }
            height='40px'
          >
            <CustomMenu
              title={`${t('sortBy')}: `}
              menuItems={lendSortItems.map((item) => {
                return { text: item, onClick: () => setLendSortBy(item) };
              })}
            />
          </Box>
        </Box>
      </Box>
      {filteredPools ? (
        <>
          {filteredPools.length > 0 ? (
            <Grid container spacing={3}>
              {filteredPools.map((poolData, index: number) => {
                if (!poolData) return <></>;
                const {
                  assets,
                  pool,
                  poolId,
                  totalSuppliedUSD,
                  totalBorrowedUSD,
                } = poolData;
                const poolTokens = assets.map((asset: USDPricedPoolAsset) =>
                  getPoolAssetToken(asset, chainId),
                );
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={index}
                    onClick={() => {
                      history.push('/lend/detail?poolId=' + poolId);
                    }}
                  >
                    <Box className='lendCard'>
                      <Box className='lendCardTop'>
                        <h5>{pool.name}</h5>
                        <Box
                          margin={'14px 0 0'}
                          className={'flex'}
                          // gridGap={'4px'}
                        >
                          {poolTokens.map((token: Token) => (
                            <CurrencyLogo
                              key={token.address}
                              currency={token}
                              withoutBg={Boolean(
                                (token.name && token.name.includes('LP')) ||
                                  (token.symbol &&
                                    (token.symbol.includes('am') ||
                                      token.symbol.includes('moo'))),
                              )}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box className='lendCardContent'>
                        <Box>
                          <small className='text-secondary'>
                            {t('totalSupply')}
                          </small>
                          <p>{midUsdFormatter(totalSuppliedUSD)}</p>
                        </Box>
                        <Box>
                          <small className='text-secondary'>
                            {t('totalBorrowed')}
                          </small>
                          <p>{midUsdFormatter(totalBorrowedUSD)}</p>
                        </Box>
                      </Box>
                      <Box padding='22px 0' textAlign={'center'}>
                        <p>{t('viewDetails')}</p>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Box margin='64px 0 32px' textAlign='center'>
              <h3>{t('nopoolFound')}</h3>
            </Box>
          )}
        </>
      ) : (
        <Skeleton width='100%' height='200px' />
      )}
    </Box>
  );
};

export default LendPage;
