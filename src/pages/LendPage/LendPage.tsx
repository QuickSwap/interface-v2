import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Box } from '@material-ui/core';
import { SearchInput } from 'components';
import { CustomSelect, SmOption } from 'components/CustomSelect';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useActiveWeb3React } from 'hooks';
import Web3 from 'web3';
import { MarketSDK, Comptroller, CToken } from 'market-sdk';

const QS_Pool_Comptroller = '0x772EdfEDee10029E98AF15359595bB398950416B';
const QS_Pool_admin = '0x03c91dEc8Ca1c7932305B4B0c15AB3A1F13f2eE6';
const fQSUSDC = '0xE6538102EDE880BdDbEe50C2f763Be02DE164010';

const LendPage: React.FC = () => {
  const history = useHistory();
  const { account } = useActiveWeb3React();
  const web3 = new Web3('https://polygon-rpc.com');

  const [pools, setPools] = useState<any>([]);

  useMemo(() => {
    const getPools = async () => {
      const sdk = await MarketSDK.init(web3);
      const allPools = await sdk.poolDirectory.v1!.getAllPools();
      setPools(allPools);

      const comptroller = new Comptroller(sdk, QS_Pool_Comptroller);

      const cTokens = (await comptroller.getAllMarkets()).map(
        (address) => new CToken(sdk, address),
      );

      console.log('cTokens??', cTokens);

      const publicPoolData: any = await sdk.lens.v1?.getPublicPoolsWithData();

      // let i = 1;
      // for (const cToken of cTokens) {
      //   console.log(`cToken[${i}] address = `, cToken.address); /// 0x5a
      //   console.log(`cToken[${i}] name = `, await cToken.name()); /// Market Pool X USDC
      //   console.log(`cToken[${i}] symbol = `, await cToken.symbol()); /// mPXUSDC
      //   console.log(
      //     `cToken[${i}] LTV = `,
      //     (await comptroller.markets(cToken.address)).collateralFactorMantissa, /// 5e17
      //   );
      //   console.log(
      //     `cToken[${i}] reserve factor = `,
      //     await cToken.reserveFactorMantissa(), /// 5e16
      //   );

      //   ++i;
      // }
    };
    getPools();
  }, [web3]);

  // useEffect(() => {
  //   if (pools) pools.map((x: any, i: any) => console.log(x, i));
  // }, [pools]);

  const [searchInput, setSearchInput] = useState('');
  return (
    <Box width={'100%'}>
      <Box
        mb={'40px'}
        fontSize={'24px'}
        fontWeight={'700'}
        color={'white'}
        sx={{ display: { xs: 'block', sm: 'block', md: 'none' } }}
      >
        Lend
      </Box>
      <AlertBox />
      <Box
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        sx={{ textAlign: { xs: 'left', sm: 'center' } }}
      >
        <Box fontSize={'24px'} fontWeight={'700'}>
          Leverage assets you believe in
        </Box>
        <Box mt={'16px'} fontSize={'16px'} maxWidth={'520px'}>
          With Quickswap Lend, you can maximize your yield, contribute to risk
          management and create unparalleled opportunities to make the most of
          DeFi.
        </Box>
      </Box>
      <Box mt={'48px'} display={'flex'} gridGap={'24px'} flexWrap={'wrap'}>
        <Box
          flex={'1'}
          bgcolor={'#232734'}
          p={'24px'}
          borderRadius={'12px'}
          sx={{ minWidth: { xs: '35%', sm: '35%', md: '20%' } }}
        >
          <Box color={'#696c80'} fontSize={'14px'}>
            Total Supply
          </Box>
          <Box fontSize={'24px'} color={'white'}>
            $24.12M
          </Box>
        </Box>
        <Box
          flex={'1'}
          bgcolor={'#232734'}
          p={'24px'}
          borderRadius={'12px'}
          sx={{ minWidth: { xs: '35%', sm: '35%', md: '20%' } }}
        >
          <Box color={'#696c80'} fontSize={'14px'}>
            Total Borrowed
          </Box>
          <Box fontSize={'24px'} color={'white'}>
            $9.23M
          </Box>
        </Box>
        <Box
          flex={'1'}
          bgcolor={'#232734'}
          p={'24px'}
          borderRadius={'12px'}
          sx={{ minWidth: { xs: '35%', sm: '35%', md: '20%' } }}
        >
          <Box color={'#696c80'} fontSize={'14px'}>
            Liquidity
          </Box>
          <Box fontSize={'24px'} color={'white'}>
            $3.45M
          </Box>
        </Box>
        <Box
          flex={'1'}
          bgcolor={'#232734'}
          p={'24px'}
          borderRadius={'12px'}
          sx={{ minWidth: { xs: '35%', sm: '35%', md: '20%' } }}
        >
          <Box color={'#696c80'} fontSize={'14px'}>
            Markets
          </Box>
          <Box fontSize={'24px'} color={'white'}>
            5
          </Box>
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
          <Box fontSize={'18px'} fontWeight={'bold'} color={'#448aff'}>
            All Pools
          </Box>
          <Box fontSize={'18px'} fontWeight={'bold'} color={'#626680'}>
            My Pools
          </Box>
        </Box>
        <Box
          maxWidth={'100%'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          gridGap={'16px'}
        >
          <SearchInput
            width={'calc(50% - 8px)'}
            placeholder={
              // isMobile ? 'Search' : 'Search name, symbol or paste address'
              'Search'
            }
            value={searchInput}
            setValue={setSearchInput}
          />
          <CustomSelect before={'SortBy: '} width={'calc(50% - 8px)'}>
            <SmOption value={'Rewards'}>Rewards</SmOption>
            <SmOption value={'Quickswap'}>Quickswap</SmOption>
            <SmOption value={'PoolTitle'}>PoolTitle</SmOption>
          </CustomSelect>
        </Box>
      </Box>
      <Box display={'flex'} gridGap={'32px'} flexWrap={'wrap'}>
        {pools.map((pool: any, index: any) => (
          <Card
            flex={'1'}
            key={`${index}`}
            borderRadius={'20px'}
            bgcolor={'#232734'}
            display={'flex'}
            flexDirection={'column'}
            sx={{ minWidth: { xs: '55%', sm: '25%' } }}
            onClick={() => {
              history.push('lend/detail');
            }}
          >
            <Box
              py={'28px'}
              display={'flex'}
              flexDirection={'column'}
              alignItems={'center'}
            >
              <Box fontSize={'20px'}>{pool.name}</Box>
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
                <Box fontSize={'14px'} color={'#575b73'}>
                  Total Supply
                </Box>
                <Box fontSize={'16px'} mt={'10px'}>
                  {pool.blockPosted.toNumber()}
                </Box>
              </Box>
              <Box flex={'1'} textAlign={'center'} pt={'18px'} pb={'24px'}>
                <Box fontSize={'14px'} color={'#575b73'}>
                  Total Borrowed
                </Box>
                <Box fontSize={'16px'} mt={'10px'}>
                  $13,132,132
                </Box>
              </Box>
            </Box>
            <Box py={'22px'} textAlign={'center'} fontSize={'16px'}>
              View Details
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

const AlertBox: React.FC = () => {
  const [visible, setVisible] = useState(true);
  return (
    <>
      {visible ? (
        <Box
          mb={'40px'}
          fontSize={'16px'}
          bgcolor={'#4b3625'}
          p={'14px 28px'}
          borderRadius={'12px'}
          display={'flex'}
          justifyContent={'space-between'}
          gridGap={'22px'}
          zIndex={'100'}
          sx={{ flexWrap: { xs: 'wrap', sm: 'wrap', md: 'nowrap' } }}
        >
          <Box
            display={'flex'}
            alignItems={'center'}
            sx={{ order: { xs: 1, sm: 1, md: 'unset' } }}
          >
            <Box
              bgcolor={'#261d12'}
              width={'40px'}
              height={'40px'}
              borderRadius={'100%'}
              fontSize={'18px'}
              fontWeight={'bold'}
              color={'#e4c133'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
              gridGap={'16px'}
            >
              <svg width={'24px'} height={'24px'} viewBox='0 0 24 24'>
                <path
                  d='M12 5.99 19.53 19H4.47L12 5.99M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z'
                  fill='currentColor'
                ></path>
              </svg>
            </Box>
          </Box>
          <Box fontSize={'15px'} sx={{ order: { xs: 3, sm: 3, md: 'unset' } }}>
            By using this software, you understand, knowledge and accept that
            Quickswap and/or the underlying software are provided &quot;as
            is&quot; and &quot;as available&quot; basis and without warranties
            or representations of any kind either expressed or implied.
          </Box>
          <Box
            fontSize={'25px'}
            color={'white'}
            display={'flex'}
            alignItems={'center'}
            onClick={() => {
              setVisible(false);
            }}
            sx={{ order: { xs: 2, sm: 2, md: 'unset' } }}
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
