import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { SearchInput, CustomMenu } from 'components';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useActiveWeb3React } from 'hooks';
import { MarketSDK, Comptroller, Pool, PoolDirectoryV1 } from 'market-sdk';
import { midUsdFormatter } from 'utils/bigUtils';

import { usePoolData } from 'hooks/marketxyz/usePoolData';
import {
  fetchPoolData,
  getPoolIdFromComptroller,
} from 'utils/marketxyz/fetchPoolData';
import { useTranslation } from 'react-i18next';
import 'pages/styles/lend.scss';

const QS_PoolDirectory = '0x9180296118C8Deb7c5547eF5c1E798DC0405f350';
const QS_Pools = ['0x772EdfEDee10029E98AF15359595bB398950416B'];
// const QS_Pool_Comptroller = '0x772EdfEDee10029E98AF15359595bB398950416B';
// const QS_Pool_admin = '0x03c91dEc8Ca1c7932305B4B0c15AB3A1F13f2eE6';
// const fQSUSDC = '0xE6538102EDE880BdDbEe50C2f763Be02DE164010';

const LendPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { account } = useActiveWeb3React();
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
        <Box
          className='lendPageData'
          flex={'1'}
          bgcolor={'#232734'}
          p={'24px'}
          borderRadius={'12px'}
          sx={{ minWidth: { xs: '35%', sm: '35%', md: '20%' } }}
        >
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
            { pool, poolId, totalSuppliedUSD, totalBorrowedUSD },
            index: any,
          ) => (
            <Card
              flex={'1'}
              key={`${index}`}
              borderRadius={'20px'}
              bgcolor={'#232734'}
              display={'flex'}
              flexDirection={'column'}
              sx={{ minWidth: { xs: '55%', sm: '25%' }, maxWidth: '31.6%' }}
              onClick={() => {
                history.push('/lend/detail?poolId=' + poolId);
              }}
            >
              <Box
                py={'28px'}
                display={'flex'}
                flexDirection={'column'}
                alignItems={'center'}
              >
                <h5>{pool.name}</h5>
                <Box mt={'14px'} display={'flex'} gridGap={'4px'}>
                  <USDTIcon size={'22px'} />
                  <USDTIcon size={'22px'} />
                  <USDTIcon size={'22px'} />
                  <USDTIcon size={'22px'} />
                  <USDTIcon size={'22px'} />
                </Box>
              </Box>
              <Box
                display={'flex'}
                borderTop={'1px solid #30374a'}
                borderBottom={'1px solid #30374a'}
              >
                <Box
                  flex={'1'}
                  textAlign={'center'}
                  borderRight={'1px solid #30374a'}
                  pt={'18px'}
                  pb={'24px'}
                >
                  <small className='text-secondary'>{t('totalSupply')}</small>
                  <Box mt={'10px'}>
                    <p>{midUsdFormatter(totalSuppliedUSD)}</p>
                  </Box>
                </Box>
                <Box flex={'1'} textAlign={'center'} pt={'18px'} pb={'24px'}>
                  <small className='text-secondary'>{t('totalBorrowed')}</small>
                  <Box mt={'10px'}>
                    <p>{midUsdFormatter(totalBorrowedUSD)}</p>
                  </Box>
                </Box>
              </Box>
              <Box py={'22px'} textAlign={'center'}>
                <p>{t('viewDetails')}</p>
              </Box>
            </Card>
          ),
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

interface IconProps {
  size?: any;
  color?: any;
}
const USDTIcon: React.FC<IconProps> = ({
  size = '1em',
  color = 'currentColor',
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 32 32'
    >
      <path
        data-name='Path 5433'
        d='M16 32A16 16 0 1 0 0 16a16 16 0 0 0 16 16z'
        fill='#2775c9'
      />
      <path
        data-name='Path 5434'
        d='M15.75 27.5a11.75 11.75 0 1 1 8.309-3.442A11.749 11.749 0 0 1 15.75 27.5zm-.7-16.11a2.58 2.58 0 0 0-2.45 2.47c0 1.21.74 2 2.31 2.33l1.1.26c1.07.25 1.51.61 1.51 1.22s-.77 1.21-1.77 1.21a1.9 1.9 0 0 1-1.8-.91.68.68 0 0 0-.61-.39h-.59a.35.35 0 0 0-.28.41 2.73 2.73 0 0 0 2.61 2.08v.84a.705.705 0 0 0 1.41 0v-.85a2.62 2.62 0 0 0 2.59-2.58c0-1.27-.73-2-2.46-2.37l-1-.22c-1-.25-1.47-.58-1.47-1.14s.6-1.18 1.6-1.18a1.64 1.64 0 0 1 1.59.81.8.8 0 0 0 .72.46h.47a.42.42 0 0 0 .31-.5 2.65 2.65 0 0 0-2.38-2v-.69a.7.7 0 0 0-1.41 0zm-8.11 4.36a8.79 8.79 0 0 0 6 8.33h.14a.45.45 0 0 0 .45-.45v-.21a.94.94 0 0 0-.58-.87 7.36 7.36 0 0 1 0-13.65.93.93 0 0 0 .58-.86v-.23a.42.42 0 0 0-.56-.4 8.79 8.79 0 0 0-6.03 8.34zm17.62 0a8.79 8.79 0 0 0-6-8.32h-.15a.47.47 0 0 0-.47.47v.15a1 1 0 0 0 .61.9 7.36 7.36 0 0 1 0 13.64 1 1 0 0 0-.6.89v.17a.47.47 0 0 0 .62.44 8.79 8.79 0 0 0 5.99-8.34z'
        fill='#fff'
      />
    </svg>
  );
};

const Card = styled(Box)`
  cursor: pointer;
  border: 1px solid transparent;
  transition: 500ms;
  & > div:last-child {
    transition: 500ms;
  }
  &:hover {
    border-color: #448aff;
    & > div:last-child {
      color: #448aff;
    }
  }
`;

export default LendPage;
