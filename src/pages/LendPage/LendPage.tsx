import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { SearchInput, CustomMenu, CurrencyLogo } from 'components';
import { useHistory } from 'react-router-dom';
import { useActiveWeb3React } from 'hooks';
import { MarketSDK, Comptroller, Pool, PoolDirectoryV1 } from 'market-sdk';
import { midUsdFormatter } from 'utils/bigUtils';
import {
  fetchPoolData,
  USDPricedPoolAsset,
} from 'utils/marketxyz/fetchPoolData';
import { useTranslation } from 'react-i18next';
import 'pages/styles/lend.scss';
import { getPoolAssetToken } from 'utils/marketxyz';
import { Token } from '@uniswap/sdk';

const QS_PoolDirectory = '0x9180296118C8Deb7c5547eF5c1E798DC0405f350';
const QS_Pools = ['0x772EdfEDee10029E98AF15359595bB398950416B'];
// const QS_Pool_Comptroller = '0x772EdfEDee10029E98AF15359595bB398950416B';
// const QS_Pool_admin = '0x03c91dEc8Ca1c7932305B4B0c15AB3A1F13f2eE6';
// const fQSUSDC = '0xE6538102EDE880BdDbEe50C2f763Be02DE164010';

const LendPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { chainId, account } = useActiveWeb3React();
  const web3 = new Web3('https://polygon-rpc.com');

  const [totalSupply, setTotalSupply] = useState<string>();
  const [totalBorrow, setTotalBorrow] = useState<string>();
  const [totalLiquidity, setTotalLiquidity] = useState<string>();
  const [lendSortBy, setLendSortBy] = useState<string>(t('rewards'));
  const lendSortItems = [t('rewards'), 'Quickswap', t('poolTitle')];

  const [pools, setPools] = useState<any[]>([]);
  useEffect(() => {
    const getPools = async () => {
      const sdk = await MarketSDK.init(web3);
      const directory = new PoolDirectoryV1(sdk, QS_PoolDirectory);

      const allPools = await directory.getAllPools();
      const poolsData = [];

      let _totalBorrowUSD = 0;
      let _totalSupplyUSD = 0;
      let _totalLiquidityUSD = 0;

      for (const comptrollerAddress of QS_Pools) {
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

  return (
    <Box width={'100%'}>
      <Box
        mb={'40px'}
        sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}
      >
        <h4 className='text-bold'>{t('lend')}</h4>
      </Box>
      <AlertBox />
      <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
        <h4 className='text-bold'>{t('lendPageTitle')}</h4>
        <Box mt={'16px'} maxWidth={'520px'} marginX='auto'>
          <p>{t('lendPageSubTitle')}</p>
        </Box>
      </Box>
      <Box mt={'48px'} display={'flex'} gridGap={'24px'} flexWrap={'wrap'}>
        <Box className='lendPageData'>
          <small className='text-secondary'>{t('totalSupply')}</small>
          {totalSupply ? (
            <h4>{midUsdFormatter(Number(totalSupply))}</h4>
          ) : (
            <Skeleton variant='rect' height={40} />
          )}
        </Box>
        <Box className='lendPageData'>
          <small className='text-secondary'>{t('totalBorrowed')}</small>
          {totalBorrow ? (
            <h4>{midUsdFormatter(Number(totalBorrow))}</h4>
          ) : (
            <Skeleton variant='rect' height={40} />
          )}
        </Box>
        <Box className='lendPageData'>
          <small className='text-secondary'>{t('liquidity')}</small>
          {totalLiquidity ? (
            <h4>{midUsdFormatter(Number(totalLiquidity))}</h4>
          ) : (
            <Skeleton variant='rect' height={40} />
          )}
        </Box>
        <Box className='lendPageData'>
          <small className='text-secondary'>{t('markets')}</small>
          {pools.length ? (
            <h4>{pools.length}</h4>
          ) : (
            <Skeleton variant='rect' height={40} />
          )}
        </Box>
      </Box>
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
          <h6 className='text-bold text-primary cursor-pointer'>
            {t('allPools')}
          </h6>
          <h6 className='text-bold text-secondary cursor-pointer'>
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
          <Box sx={{ minWidth: { xs: '100%', sm: '200px' } }} height={40}>
            <CustomMenu
              title={`${t('sortBy')}: `}
              menuItems={lendSortItems.map((item) => {
                return { text: item, onClick: () => setLendSortBy(item) };
              })}
            />
          </Box>
        </Box>
      </Box>
      <Box display={'flex'} gridGap={'32px'} flexWrap={'wrap'}>
        {pools.map(
          (
            { assets, pool, poolId, totalSuppliedUSD, totalBorrowedUSD },
            index: any,
          ) => {
            const poolTokens = assets.map((asset: USDPricedPoolAsset) =>
              getPoolAssetToken(asset, chainId),
            );
            return (
              <Box
                className='lendCard'
                key={index}
                onClick={() => {
                  history.push('/lend/detail?poolId=' + poolId);
                }}
              >
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
                    <small className='text-secondary'>{t('totalSupply')}</small>
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
            );
          },
        )}
      </Box>
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
