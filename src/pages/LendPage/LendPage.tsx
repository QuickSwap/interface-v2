import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Box, Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { SearchInput, CustomMenu, CurrencyLogo } from 'components';
import { useHistory } from 'react-router-dom';
import { useActiveWeb3React } from 'hooks';
import { MarketSDK, PoolDirectoryV1 } from 'market-sdk';
import { midUsdFormatter } from 'utils/bigUtils';
import {
  fetchPoolData,
  USDPricedPoolAsset,
} from 'utils/marketxyz/fetchPoolData';
import { useTranslation } from 'react-i18next';
import 'pages/styles/lend.scss';
import { getPoolAssetToken } from 'utils/marketxyz';
import { Token } from '@uniswap/sdk';
import { GlobalValue } from 'constants/index';

const LendPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { chainId, account } = useActiveWeb3React();
  const web3 = new Web3('https://polygon-rpc.com');

  const [totalSupply, setTotalSupply] = useState('');
  const [totalBorrow, setTotalBorrow] = useState('');
  const [totalLiquidity, setTotalLiquidity] = useState('');
  const [lendSortBy, setLendSortBy] = useState('');
  const lendSortItems = [t('highestSupply'), t('highestBorrow')];
  const [isMyPools, setIsMyPools] = useState(false);

  const [pools, setPools] = useState<any[]>([]);
  useEffect(() => {
    const getPools = async () => {
      const sdk = await MarketSDK.init(web3);
      const directory = new PoolDirectoryV1(
        sdk,
        GlobalValue.marketSDK.QS_PoolDirectory,
      );

      const allPools = await directory.getAllPools();
      const poolsData = [];

      let _totalBorrowUSD = 0;
      let _totalSupplyUSD = 0;
      let _totalLiquidityUSD = 0;

      for (const comptrollerAddress of GlobalValue.marketSDK.QS_Pools) {
        const poolId = allPools
          .findIndex((p) => {
            return p.comptroller.address === comptrollerAddress;
          })
          .toString();
        const poolData = await fetchPoolData(
          poolId,
          account ?? undefined,
          directory,
        );

        _totalSupplyUSD += poolData?.totalSuppliedUSD ?? 0;
        _totalBorrowUSD += poolData?.totalBorrowedUSD ?? 0;
        _totalLiquidityUSD += poolData?.totalLiquidityUSD ?? 0;

        poolsData.push(poolData);
      }

      setTotalSupply(_totalSupplyUSD.toString());
      setTotalBorrow(_totalBorrowUSD.toString());
      setTotalLiquidity(_totalLiquidityUSD.toString());
      setPools(poolsData);
    };
    getPools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const [searchInput, setSearchInput] = useState('');
  const lendDataArr = [
    {
      label: t('totalSupply'),
      data: totalSupply ? midUsdFormatter(Number(totalSupply)) : undefined,
    },
    {
      label: t('totalBorrowed'),
      data: totalBorrow ? midUsdFormatter(Number(totalBorrow)) : undefined,
    },
    {
      label: t('liquidity'),
      data: totalLiquidity
        ? midUsdFormatter(Number(totalLiquidity))
        : undefined,
    },
    { label: t('markets'), data: pools.length },
  ];

  const filteredPools = pools
    .filter(
      (pool: any) =>
        pool.pool.name.toLowerCase().includes(searchInput.toLowerCase()) &&
        (isMyPools
          ? pool.totalSuppliedUSD > 0 || pool.totalBorrowedUSD > 0
          : true),
    )
    .sort((poolA: any, poolB: any) => {
      if (lendSortBy === t('highestSupply')) {
        return poolA.totalSuppliedUSD > poolB.totalSuppliedUSD ? -1 : 1;
      } else if (lendSortBy === t('highestBorrow')) {
        return poolA.totalBorrowedUSD > poolB.totalBorrowedUSD ? -1 : 1;
      }
      return 0;
    });

  return (
    <Box width={'100%'}>
      <Box
        mb={'40px'}
        sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}
      >
        <h4 className='text-bold'>{t('lend')}</h4>
      </Box>
      <AlertBox />
      <Box mb={3} textAlign='center'>
        <h4 className='text-bold'>{t('lendPageTitle')}</h4>
        <Box mt={'16px'} maxWidth={'520px'} marginX='auto'>
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
                <Skeleton variant='rect' height={40} />
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box
        my={'32px'}
        display={'flex'}
        alignItems={'center'}
        sx={{
          justifyContent: { xs: 'center', sm: 'center', md: 'space-between' },
        }}
        gridGap={'24px'}
        flexWrap={'wrap'}
      >
        <Box display={'flex'} gridGap={'24px'}>
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
          display={'flex'}
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'unset' },
          }}
          gridGap={'16px'}
        >
          <SearchInput
            placeholder={t('search')}
            value={searchInput}
            setValue={setSearchInput}
          />
          <Box sx={{ minWidth: { xs: '100%', sm: '230px' } }} height={40}>
            <CustomMenu
              title={`${t('sortBy')}: `}
              menuItems={lendSortItems.map((item) => {
                return { text: item, onClick: () => setLendSortBy(item) };
              })}
            />
          </Box>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {filteredPools.map(
          (
            { assets, pool, poolId, totalSuppliedUSD, totalBorrowedUSD },
            index: number,
          ) => {
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
                    <Box mt={'14px'} display={'flex'} gridGap={'4px'}>
                      {poolTokens.map((token: Token) => (
                        <CurrencyLogo key={token.address} currency={token} />
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
                  <Box py={'22px'} textAlign={'center'}>
                    <p>{t('viewDetails')}</p>
                  </Box>
                </Box>
              </Grid>
            );
          },
        )}
      </Grid>
    </Box>
  );
};

const AlertBox: React.FC = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);
  return (
    <>
      {visible ? (
        <Box className='lendAlertWrapper'>
          <Box className='lendAlertBox'>
            <svg width={'24px'} height={'24px'} viewBox='0 0 24 24'>
              <path
                d='M12 5.99 19.53 19H4.47L12 5.99M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z'
                fill='currentColor'
              ></path>
            </svg>
          </Box>
          <p>{t('lendAlertDesc')}</p>
          <Box
            className='lendAlertClose'
            onClick={() => {
              setVisible(false);
            }}
          >
            &times;
          </Box>
        </Box>
      ) : (
        ''
      )}
    </>
  );
};

export default LendPage;
