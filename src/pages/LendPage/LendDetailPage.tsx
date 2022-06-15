import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  withStyles,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Snackbar,
} from '@material-ui/core';
import { Skeleton, Alert } from '@material-ui/lab';

import { CustomSelect, SmOption } from 'components/CustomSelect';
import ReactApexChart from 'react-apexcharts';
import { _100 } from '@uniswap/sdk/dist/constants';
import { useHistory, useLocation } from 'react-router-dom';
import ToggleSwitch from 'components/ToggleSwitch';

import ModalParent, {
  QuickModalContent,
  StateModalContent,
} from 'components/Modals';

import { usePoolData } from 'hooks/marketxyz/usePoolData';
import { midUsdFormatter, shortUsdFormatter } from 'utils/bigUtils';
import { shortenAddress } from 'utils';
import { useExtraPoolData } from 'hooks/marketxyz/useExtraPoolData';
import { useActiveWeb3React } from 'hooks';
import { useMarket } from 'hooks/marketxyz/useMarket';
import { useTokensData } from 'hooks/marketxyz/useTokenData';
import { PoolData, USDPricedPoolAsset } from 'utils/marketxyz/fetchPoolData';
import JumpRateModel from '../../utils/marketxyz/interestRateModel';

import {
  toggleCollateral,
  convertMantissaToAPY,
  convertMantissaToAPR,
} from 'utils/marketxyz';
import { useBorrowLimit } from 'hooks/marketxyz/useBorrowLimit';
import { useTranslation } from 'react-i18next';
import { QuestionHelper, CopyHelper } from 'components';

const QS_PoolDirectory = '0x9180296118C8Deb7c5547eF5c1E798DC0405f350';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  hideCell: {
    display: 'reverse',
    [breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

const LendDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  const { account } = useActiveWeb3React();
  const [supplyToggled, setSupplyToggled] = useState(false);

  const [modalNotoolbar, setModalNotoolbar] = useState<boolean>(false);
  const [modalNotitle, setModalNotitle] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'state' | 'quick' | null>(null);
  const [modalIsBorrow, setModalIsBorrow] = useState<boolean>(false);
  const [modalIsConfirm, setModalIsConfirm] = useState<boolean>(false);
  const [alertShow, setAlertShow] = useState({
    open: false,
    msg: '',
    status: 'success',
  });

  const [openModalType, setOpenModalType] = useState<{
    back: {
      notoolbar: boolean;
      notitle: boolean;
    };
    content: {
      type: 'state' | 'quick';
      borrow: boolean;
      confirm: boolean;
    };
  } | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<USDPricedPoolAsset>();

  const { sdk } = useMarket();
  const poolId = location && new URLSearchParams(location.search).get('poolId');
  const poolData = usePoolData(poolId ?? undefined, QS_PoolDirectory);

  const tokensData = useTokensData(
    poolData?.assets.map((asset) => asset.underlyingToken) || [],
  ) || ['0x0'];

  const extraPoolData = useExtraPoolData(
    poolData?.pool.comptroller,
    account ?? undefined,
  );

  const borrowLimit = useBorrowLimit(poolData?.assets || []);
  const handleAlertShowClose = () => {
    setAlertShow({
      open: false,
      msg: '',
      status: 'error',
    });
  };

  return (
    <>
      <Box width={'100%'}>
        <Box
          display={'flex'}
          justifyContent={'flex-start'}
          alignItems={'center'}
          gridGap={'20px'}
          flexWrap={'wrap'}
        >
          <Box
            onClick={() => {
              history.push('../lend');
            }}
            display={'flex'}
            alignItems={'center'}
            style={{ cursor: 'pointer' }}
          >
            <svg
              data-name='Layer 2'
              xmlns='http://www.w3.org/2000/svg'
              width='28'
              height='28'
              viewBox='0 0 28 28'
            >
              <g data-name='invisible box'>
                <path
                  data-name='Rectangle 20001'
                  fill='none'
                  d='M0 0h28v28H0z'
                />
              </g>
              <g data-name='Q3 icons'>
                <path
                  data-name='Path 11780'
                  d='m16.285 10.35-6.942 7a1.108 1.108 0 0 0 0 1.633l6.942 7a1.225 1.225 0 0 0 1.575.117 1.108 1.108 0 0 0 .117-1.75l-5.017-5.016h12.367a1.167 1.167 0 1 0 0-2.333H12.96l5.017-5.017a1.108 1.108 0 0 0-.117-1.75 1.225 1.225 0 0 0-1.575.117z'
                  transform='translate(-3.744 -4.167)'
                  fill='#448aff'
                />
              </g>
            </svg>
          </Box>
          <Box fontSize={'24px'} fontWeight={'bold'} color={'white'}>
            {poolData?.pool.name}
          </Box>
          <Box display={'flex'} gridGap={'2px'}>
            {poolData?.assets.map((asset, i) => (
              <USDTIcon key={i} size={'24px'} />
            ))}
            {/* <Box
              bgcolor={'#32394c'}
              width={'24px'}
              height={'24px'}
              borderRadius={'100%'}
              display={'flex'}
              alignItems={'center'}
            >
              <Box ml={'1px'} mt={'-5px'} display={'flex'}>
                <USDTIcon size={'13px'} />
              </Box>
              <Box ml={'-4px'} mt={'5px'} display={'flex'}>
                <USDTIcon size={'13px'} />
              </Box>
            </Box> */}
          </Box>
        </Box>
        <Box
          mt={'40px'}
          fontSize={'20px'}
          fontWeight={'700'}
          textAlign={'left'}
          color={'#ebecf2'}
        >
          {t('lendPageTitle')}
        </Box>
        <Box mt={'23px'} display={'flex'} gridGap={'24px'} flexWrap={'wrap'}>
          <Box
            flex={'1'}
            sx={{ minWidth: { xs: '55%', sm: '35%', md: '20%' } }}
            bgcolor={'#232734'}
            p={'24px'}
            borderRadius={'12px'}
          >
            <Box color={'#696c80'} fontSize={'14px'}>
              {t('totalSupply')}
            </Box>
            {poolData?.totalSuppliedUSD ? (
              <Box fontSize={'24px'} color={'white'}>
                {poolData && midUsdFormatter(poolData.totalSuppliedUSD)}
              </Box>
            ) : (
              <Skeleton variant='rect' height={40} />
            )}
          </Box>
          <Box
            flex={'1'}
            sx={{ minWidth: { xs: '55%', sm: '35%', md: '20%' } }}
            bgcolor={'#232734'}
            p={'24px'}
            borderRadius={'12px'}
          >
            <Box color={'#696c80'} fontSize={'14px'}>
              {t('totalBorrowed')}
            </Box>
            {poolData?.totalBorrowedUSD ? (
              <Box fontSize={'24px'} color={'white'}>
                {poolData && midUsdFormatter(poolData.totalBorrowedUSD)}
              </Box>
            ) : (
              <Skeleton variant='rect' height={40} />
            )}
          </Box>
          <Box
            flex={'1'}
            sx={{ minWidth: { xs: '55%', sm: '35%', md: '20%' } }}
            bgcolor={'#232734'}
            p={'24px'}
            borderRadius={'12px'}
          >
            <Box color={'#696c80'} fontSize={'14px'}>
              {t('liquidity')}
            </Box>
            {poolData?.totalLiquidityUSD ? (
              <Box fontSize={'24px'} color={'white'}>
                {poolData && midUsdFormatter(poolData.totalLiquidityUSD)}
              </Box>
            ) : (
              <Skeleton variant='rect' height={40} />
            )}
          </Box>
          <Box
            flex={'1'}
            sx={{ minWidth: { xs: '55%', sm: '35%', md: '20%' } }}
            bgcolor={'#232734'}
            p={'24px'}
            borderRadius={'12px'}
          >
            <Box color={'#696c80'} fontSize={'14px'}>
              {t('poolUtilization')}
            </Box>
            {poolData?.totalBorrowBalanceUSD ? (
              <Box fontSize={'24px'} color={'white'}>
                {poolData && midUsdFormatter(poolData.totalBorrowBalanceUSD)}
              </Box>
            ) : (
              <Skeleton variant='rect' height={40} />
            )}
          </Box>
        </Box>
        <Box
          mt={'24px'}
          flex={'1'}
          bgcolor={'#232734'}
          borderRadius={'8px'}
          display={'flex'}
          sx={{
            height: { xs: 'auto', sm: 'auto', md: '40px' },
            paddingY: { xs: '10px', sm: '10px', md: '0px' },
            flexDirection: { xs: 'column', sm: 'column', md: 'row' },
            alignItems: { xs: 'unset', sm: 'unset', md: 'center' },
          }}
          flexWrap={'wrap'}
          gridRowGap={'4px'}
        >
          <Box
            height={'100%'}
            paddingX={'25px'}
            display={'flex'}
            alignItems={'center'}
            sx={{
              borderRight: { xs: 'none', sm: 'none', md: '1px solid #323548' },
            }}
          >
            <Box>{t('borrowLimit')}</Box>
            <Box ml={'8px'}>
              <QuestionHelper text={t('borrowLimitHelper')} />
            </Box>
          </Box>
          <Box
            flexGrow={'1'}
            paddingX={'30px'}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            gridGap={'4px 24px'}
            flexWrap={'wrap'}
          >
            <Box sx={{ order: { xs: 2, sm: 2, md: 1 } }}>$0</Box>
            <Box
              sx={{
                order: { xs: 1, sm: 1, md: 2 },
                minWidth: { xs: '100%', sm: '100%', md: 'unset' },
              }}
              flexGrow={'1'}
              position={'relative'}
              bgcolor={'#323548'}
              height={'5px'}
              borderRadius={'100px'}
              overflow={'hidden'}
            >
              <Box
                position={'absolute'}
                top={'0px'}
                left={'0px'}
                bgcolor={'#0fc679'}
                width={'35%'}
                height={'100%'}
              />
              <Box
                position={'absolute'}
                top={'0px'}
                left={'50%'}
                bgcolor={'#ebecf2'}
                width={'8px'}
                height={'100%'}
              />
              <Box
                position={'absolute'}
                top={'0px'}
                left={'60%'}
                bgcolor={'#fc615a'}
                width={'8px'}
                height={'100%'}
              />
            </Box>
            {borrowLimit ? (
              <Box sx={{ order: { xs: 3, sm: 3, md: 3 } }}>
                {midUsdFormatter(borrowLimit)}
              </Box>
            ) : (
              <Box sx={{ order: { xs: 3, sm: 3, md: 3 } }}>
                <Skeleton variant='rect' width={60} height={20} />
              </Box>
            )}
          </Box>
        </Box>
        <Box
          mt={'24px'}
          display={'flex'}
          gridGap={'32px'}
          flexWrap={'wrap'}
          sx={{ flexDirection: { sm: 'column', md: 'row' } }}
        >
          <Box
            flex={'1'}
            borderRadius={'20px'}
            bgcolor={'#232734'}
            display={'flex'}
            flexDirection={'column'}
            sx={{ minWidth: { xs: '55%', sm: '35%' } }}
          >
            <Box
              height={'70px'}
              borderBottom={'solid 1px #32394d'}
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Box
                px={'30px'}
                fontSize={'18px'}
                fontWeight={'500'}
                borderLeft={'4px solid #448aff'}
                lineHeight={'1'}
              >
                {t('supply')}
              </Box>
              <Box mr={'30px'} display={'flex'} fontSize={'14px'}>
                <Box color={'#c7cad9'}>{t('yoursupplybalance')}:&nbsp;</Box>
                {poolData ? (
                  <Box color={'white'}>
                    {midUsdFormatter(poolData.totalSupplyBalanceUSD)}
                  </Box>
                ) : (
                  <Skeleton variant='rect' width={40} height={23} />
                )}
              </Box>
            </Box>
            <Box display={'flex'} paddingX={'24px'}>
              <Table>
                <TableHead>
                  <TableRow>
                    <MuiTableCell>
                      <Box paddingY={'20px'}>
                        {t('asset')} / {t('ltv')}
                      </Box>
                    </MuiTableCell>
                    <MuiTableCell className={classes.hideCell}>
                      <Box
                        paddingY={'20px'}
                        display={'flex'}
                        justifyContent={'flex-end'}
                      >
                        {t('supplyapy')}
                      </Box>
                    </MuiTableCell>
                    <MuiTableCell>
                      <Box
                        paddingY={'20px'}
                        display={'flex'}
                        justifyContent={'flex-end'}
                      >
                        {t('deposited')}
                      </Box>
                    </MuiTableCell>
                    <MuiTableCell>
                      <Box
                        paddingY={'20px'}
                        display={'flex'}
                        justifyContent={'flex-end'}
                      >
                        {t('collateral')}
                      </Box>
                    </MuiTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {poolData?.assets.map((asset, i) => (
                    <TableRow key={asset.cToken.address}>
                      <ItemTableCell
                        onClick={() => {
                          setSelectedAsset(asset);
                          setModalType('quick');
                          setModalIsBorrow(false);
                        }}
                      >
                        <Box
                          paddingY={'20px'}
                          display={'flex'}
                          alignItems={'center'}
                          gridGap={'16px'}
                        >
                          <Box display={'flex'} alignItems={'center'}>
                            <USDTIcon size={'36px'} />
                          </Box>
                          <Box
                            display={'flex'}
                            flexDirection={'column'}
                            gridGap={'4px'}
                          >
                            <Box
                              fontSize={'14px'}
                              color={'#ebecf2'}
                              textAlign={'right'}
                            >
                              {asset.underlyingName}
                            </Box>
                            <Box
                              fontSize={'13px'}
                              color={'#696c80'}
                              textAlign={'right'}
                            >
                              {t('ltv')}:{' '}
                              {sdk &&
                                asset.collateralFactor
                                  .div(sdk.web3.utils.toBN(1e16))
                                  .toNumber()}
                              %
                            </Box>
                          </Box>
                        </Box>
                      </ItemTableCell>
                      <ItemTableCell
                        onClick={() => {
                          setSelectedAsset(asset);
                          setModalType('quick');
                          setModalIsBorrow(false);
                        }}
                      >
                        <Box
                          paddingY={'20px'}
                          display={'flex'}
                          justifyContent={'flex-end'}
                        >
                          <Box
                            ml={'auto'}
                            display={'inline-flex'}
                            flexDirection={'column'}
                            gridGap={'4px'}
                            color={'#ebecf2'}
                          >
                            <Box fontSize={'14px'} textAlign={'right'}>
                              {convertMantissaToAPY(
                                asset.supplyRatePerBlock,
                                365,
                              ).toFixed(2)}
                              %
                            </Box>
                            <Box fontSize={'13px'} textAlign={'right'}>
                              {convertMantissaToAPY(
                                asset.supplyRatePerBlock,
                                365,
                              ).toFixed(2)}
                              %
                              <USDTIcon size={'12px'} />
                            </Box>
                          </Box>
                        </Box>
                      </ItemTableCell>
                      <ItemTableCell
                        onClick={() => {
                          setSelectedAsset(asset);
                          setModalType('quick');
                          setModalIsBorrow(false);
                        }}
                      >
                        <Box
                          paddingY={'20px'}
                          display={'flex'}
                          justifyContent={'flex-end'}
                        >
                          <Box
                            display={'inline-flex'}
                            flexDirection={'column'}
                            gridGap={'4px'}
                          >
                            <Box
                              fontSize={'14px'}
                              color={'#ebecf2'}
                              textAlign={'right'}
                            >
                              {midUsdFormatter(asset.supplyBalanceUSD)}
                            </Box>
                            <Box
                              fontSize={'13px'}
                              color={'#696c80'}
                              textAlign={'right'}
                            >
                              {sdk
                                ? asset.supplyBalance
                                    .div(
                                      sdk.web3.utils
                                        .toBN(10)
                                        .pow(
                                          sdk.web3.utils.toBN(
                                            asset.underlyingDecimals.toString(),
                                          ),
                                        ),
                                    )
                                    .toNumber()
                                : '?'}{' '}
                              {asset.underlyingSymbol}
                            </Box>
                          </Box>
                        </Box>
                      </ItemTableCell>
                      <MuiTableCell>
                        <Box
                          paddingY={'20px'}
                          display={'flex'}
                          justifyContent={'flex-end'}
                        >
                          <ToggleSwitch
                            // defaultChecked={asset.membership}
                            toggled={asset.membership}
                            onToggle={() => {
                              if (!supplyToggled) {
                                setSupplyToggled(true);
                                toggleCollateral(
                                  asset,
                                  poolData.pool.comptroller,
                                  account ?? '',
                                )
                                  .catch((er) => {
                                    setAlertShow({
                                      open: true,
                                      msg: er.message,
                                      status: 'error',
                                    });
                                  })
                                  .finally(() => setSupplyToggled(false));
                              }
                            }}
                          />
                          <Snackbar
                            open={alertShow.open}
                            autoHideDuration={6000}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'left',
                            }}
                            onClose={handleAlertShowClose}
                          >
                            <Alert
                              onClose={handleAlertShowClose}
                              severity={alertShow.status as any}
                            >
                              {alertShow.msg}
                            </Alert>
                          </Snackbar>
                        </Box>
                      </MuiTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
          <Box
            flex={'1'}
            borderRadius={'20px'}
            bgcolor={'#232734'}
            display={'flex'}
            flexDirection={'column'}
            sx={{ minWidth: { xs: '55%', sm: '35%' } }}
          >
            <Box
              height={'70px'}
              borderBottom={'solid 1px #32394d'}
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Box
                px={'30px'}
                fontSize={'18px'}
                fontWeight={'500'}
                borderLeft={'4px solid #fc6259'}
                lineHeight={'1'}
              >
                {t('borrow')}
              </Box>
              <Box mr={'30px'} display={'flex'} fontSize={'14px'}>
                <Box color={'#c7cad9'}>{t('yourborrowbalance')}:&nbsp;</Box>
                {poolData ? (
                  <Box color={'white'}>
                    {midUsdFormatter(poolData.totalBorrowBalanceUSD)}
                  </Box>
                ) : (
                  <Skeleton variant='rect' width={40} height={23} />
                )}
              </Box>
            </Box>
            <Box display={'flex'} paddingX={'24px'}>
              <Table>
                <TableHead>
                  <TableRow>
                    <MuiTableCell>
                      <Box paddingY={'20px'}>
                        {t('asset')} / {t('ltv')}
                      </Box>
                    </MuiTableCell>
                    <MuiTableCell className={classes.hideCell}>
                      <Box
                        paddingY={'20px'}
                        display={'flex'}
                        justifyContent={'flex-end'}
                      >
                        {t('apr')} / {t('tvl')}
                      </Box>
                    </MuiTableCell>
                    <MuiTableCell className={classes.hideCell}>
                      <Box
                        paddingY={'20px'}
                        display={'flex'}
                        justifyContent={'flex-end'}
                      >
                        {t('borrowed')}
                      </Box>
                    </MuiTableCell>
                    <MuiTableCell>
                      <Box
                        paddingY={'20px'}
                        display={'flex'}
                        justifyContent={'flex-end'}
                      >
                        {t('liquidity')}
                      </Box>
                    </MuiTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {poolData?.assets.map((asset) => {
                    if (asset.isPaused) {
                      return null;
                    }
                    return (
                      <ItemTableRow
                        key={asset.cToken.address}
                        onClick={() => {
                          setSelectedAsset(asset);
                          setModalType('quick');
                          setModalIsBorrow(true);
                        }}
                      >
                        <ItemTableCell>
                          <Box
                            paddingY={'20px'}
                            display={'flex'}
                            alignItems={'center'}
                            gridGap={'16px'}
                          >
                            <Box
                              display={'flex'}
                              alignItems={'center'}
                              gridGap={'16px'}
                            >
                              <USDTIcon size={'36px'} />
                              <Box
                                fontSize={'14px'}
                                color={'#ebecf2'}
                                textAlign={'right'}
                              >
                                {asset.underlyingName}
                              </Box>
                            </Box>
                          </Box>
                        </ItemTableCell>
                        <ItemTableCell className={classes.hideCell}>
                          <Box
                            paddingY={'20px'}
                            display={'flex'}
                            justifyContent={'flex-end'}
                          >
                            <Box fontSize={'13px'}>
                              {convertMantissaToAPR(
                                asset.borrowRatePerBlock,
                              ).toFixed(2)}
                              %
                            </Box>
                          </Box>
                        </ItemTableCell>
                        <ItemTableCell>
                          <Box
                            paddingY={'20px'}
                            display={'flex'}
                            justifyContent={'flex-end'}
                          >
                            <Box
                              display={'inline-flex'}
                              flexDirection={'column'}
                              gridGap={'4px'}
                            >
                              <Box
                                fontSize={'14px'}
                                color={'#ebecf2'}
                                textAlign={'right'}
                              >
                                {midUsdFormatter(asset.borrowBalanceUSD)}
                              </Box>
                              <Box
                                fontSize={'13px'}
                                color={'#696c80'}
                                textAlign={'right'}
                              >
                                {sdk
                                  ? asset.borrowBalance
                                      .div(
                                        sdk.web3.utils
                                          .toBN(10)
                                          .pow(
                                            sdk.web3.utils.toBN(
                                              asset.underlyingDecimals.toString(),
                                            ),
                                          ),
                                      )
                                      .toNumber()
                                  : '?'}{' '}
                                {asset.underlyingSymbol}
                              </Box>
                            </Box>
                          </Box>
                        </ItemTableCell>
                        <ItemTableCell>
                          <Box
                            paddingY={'20px'}
                            display={'flex'}
                            justifyContent={'flex-end'}
                          >
                            <Box
                              display={'inline-flex'}
                              flexDirection={'column'}
                              gridGap={'4px'}
                            >
                              <Box
                                fontSize={'14px'}
                                color={'#ebecf2'}
                                textAlign={'right'}
                              >
                                {midUsdFormatter(asset.liquidityUSD)}
                              </Box>
                              <Box
                                fontSize={'13px'}
                                color={'#696c80'}
                                textAlign={'right'}
                              >
                                {sdk
                                  ? asset.liquidity
                                      .div(
                                        sdk.web3.utils
                                          .toBN(10)
                                          .pow(
                                            sdk.web3.utils.toBN(
                                              asset.underlyingDecimals.toString(),
                                            ),
                                          ),
                                      )
                                      .toNumber()
                                  : '?'}{' '}
                                {asset.underlyingSymbol}
                              </Box>
                            </Box>
                          </Box>
                        </ItemTableCell>
                      </ItemTableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Box>
          <Box
            flex={'1'}
            borderRadius={'20px'}
            bgcolor={'#232734'}
            display={'flex'}
            flexDirection={'column'}
            sx={{ minWidth: { xs: '55%', sm: '35%' } }}
          >
            <Box
              height={'70px'}
              borderBottom={'solid 1px #32394d'}
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Box
                px={'30px'}
                fontSize={'18px'}
                fontWeight={'500'}
                lineHeight={'1'}
              >
                {t('poolInfo')}
              </Box>
            </Box>
            <Box display={'flex'} pb={'16px'} flexDirection={'column'}>
              <Box
                flex={1}
                display={'flex'}
                sx={{
                  flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                }}
              >
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <Box fontSize={'14px'} fontWeight={'500'} color={'#c7cad9'}>
                      {t('totalSupplied')}:
                    </Box>
                    {poolData ? (
                      <small className='text-gray29'>
                        {midUsdFormatter(poolData.totalSuppliedUSD)}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <Box fontSize={'14px'} fontWeight={'500'} color={'#c7cad9'}>
                      {t('totalBorrowed')}:
                    </Box>
                    {poolData ? (
                      <small className='text-gray29'>
                        {midUsdFormatter(poolData.totalBorrowedUSD)}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
              </Box>
              <Box
                flex={1}
                display={'flex'}
                sx={{
                  flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                }}
              >
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <Box fontSize={'14px'} fontWeight={'500'} color={'#c7cad9'}>
                      {t('availableLiquidity')}:
                    </Box>
                    {poolData ? (
                      <small className='text-gray29'>
                        {midUsdFormatter(poolData.totalLiquidityUSD)}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <Box fontSize={'14px'} fontWeight={'500'} color={'#c7cad9'}>
                      {t('poolUtilization')}:
                    </Box>
                    {poolData ? (
                      <small className='text-gray29'>
                        {poolData.totalSuppliedUSD.toString() === '0'
                          ? '0%'
                          : (
                              (poolData.totalBorrowedUSD /
                                poolData.totalSuppliedUSD) *
                              100
                            ).toFixed(2) + '%'}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
              </Box>
              <Box
                flex={1}
                display={'flex'}
                sx={{
                  flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                }}
              >
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <small>{t('upgradable')}:</small>
                    {extraPoolData ? (
                      <small className='text-gray29'>
                        {extraPoolData.upgradeable ? 'Yes' : 'No'}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <small>{t('admin')}:</small>
                    {extraPoolData && extraPoolData.admin ? (
                      <Box className='flex items-center'>
                        <small className='text-gray29'>
                          {shortenAddress(extraPoolData.admin)}
                        </small>
                        <Box ml={1}>
                          <CopyHelper toCopy={extraPoolData.admin} />
                        </Box>
                      </Box>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
              </Box>
              <Box
                flex={1}
                display={'flex'}
                sx={{
                  flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                }}
              >
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <small>{t('platformFee')}:</small>
                    {poolData ? (
                      <small className='text-gray29'>
                        {poolData.assets.length > 0
                          ? (
                              Number(poolData.assets[0].fuseFee.toString()) /
                              1e16
                            ).toPrecision(2) + '%'
                          : '10%'}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <Box fontSize={'14px'} fontWeight={'500'} color={'#c7cad9'}>
                      {t('averageAdminFee')}:
                    </Box>
                    {poolData ? (
                      <small className='text-gray29'>
                        {poolData.assets.reduce(
                          (a, b, _, { length }) =>
                            a + Number(b.adminFee.toString()) / 1e16 / length,
                          0,
                        )}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
              </Box>
              <Box
                flex={1}
                display={'flex'}
                sx={{
                  flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                }}
              >
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <Box fontSize={'14px'} fontWeight={'500'} color={'#c7cad9'}>
                      {t('closeFactor')}:
                    </Box>
                    {extraPoolData ? (
                      <small className='text-gray29'>
                        {extraPoolData.closeFactor / 1e16 + '%'}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <Box fontSize={'14px'} fontWeight={'500'} color={'#c7cad9'}>
                      {t('liquidationIncentive')}:
                    </Box>
                    {extraPoolData ? (
                      <small className='text-gray29'>
                        {extraPoolData.liquidationIncentive / 1e16 - 100 + '%'}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
              </Box>
              <Box
                flex={1}
                display={'flex'}
                sx={{
                  flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                }}
              >
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <Box fontSize={'14px'} fontWeight={'500'} color={'#c7cad9'}>
                      {t('oracle')}:
                    </Box>
                    {extraPoolData ? (
                      <small className='text-gray29'>
                        {shortenAddress(extraPoolData.oracle)}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
                <Box flex={1}>
                  <Box
                    padding={'20px'}
                    display={'flex'}
                    alignItems={'center'}
                    gridGap={'4px'}
                    borderBottom={'1px solid #32394d'}
                    sx={{
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'space-between',
                        md: 'flex-start',
                      },
                    }}
                  >
                    <Box fontSize={'14px'} fontWeight={'500'} color={'#c7cad9'}>
                      {t('whitelist')}:
                    </Box>
                    {extraPoolData ? (
                      <small className='text-gray29'>
                        {extraPoolData.enforceWhitelist ? 'Yes' : 'No'}
                      </small>
                    ) : (
                      <Skeleton variant='rect' width={40} height={23} />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {poolData && <AssetStats poolData={poolData} />}
        </Box>
      </Box>

      {modalType && selectedAsset && (
        <ModalParent
          notoolbar={modalNotoolbar}
          notitle={modalNotitle}
          setOpenModalType={setModalType}
        >
          {modalType === 'state' ? (
            <StateModalContent
              modalSetting={{
                setModalNotoolbar: {
                  value: modalNotoolbar,
                  set: setModalNotoolbar,
                },
                setModalNotitle: { value: modalNotitle, set: setModalNotitle },
                setModalType: { value: modalType, set: setModalType },
                setModalIsBorrow: {
                  value: modalIsBorrow,
                  set: setModalIsBorrow,
                },
                setModalIsConfirm: {
                  value: modalIsConfirm,
                  set: setModalIsConfirm,
                },
              }}
              loading
            />
          ) : (
            <QuickModalContent
              modalSetting={{
                setModalNotoolbar: {
                  value: modalNotoolbar,
                  set: setModalNotoolbar,
                },
                setModalNotitle: { value: modalNotitle, set: setModalNotitle },
                setModalType: { value: modalType, set: setModalType },
                setModalIsBorrow: {
                  value: modalIsBorrow,
                  set: setModalIsBorrow,
                },
                setModalIsConfirm: {
                  value: modalIsConfirm,
                  set: setModalIsConfirm,
                },
              }}
              borrow={modalIsBorrow}
              confirm={modalIsConfirm}
              asset={selectedAsset}
              borrowLimit={borrowLimit}
            />
          )}
        </ModalParent>
      )}
    </>
  );
};

const AssetStats = ({ poolData }: { poolData: PoolData }) => {
  const { t } = useTranslation();
  const asset = poolData.assets[0];
  const sdk = asset.cToken.sdk;
  const [jrm, setJrm] = useState<JumpRateModel>();

  const utilization =
    asset.totalSupply.toString() === '0'
      ? 0
      : parseFloat(
          // Use Max.min() to cap util at 100%
          Math.min(
            (Number(asset.totalBorrow.toString()) /
              Number(asset.totalSupply.toString())) *
              100,
            100,
          ).toFixed(0),
        );

  const [borrowerRates, setBorrowerRates] = useState<
    { x: number; y: number }[]
  >();
  const [supplierRates, setSupplyerRates] = useState<
    { x: number; y: number }[]
  >();

  useEffect(() => {
    const _jrm = new JumpRateModel(sdk, asset);

    _jrm.init().then(() => {
      setJrm(_jrm);
      const { borrowerRates, supplierRates } = _jrm.convertIRMtoCurve();

      setBorrowerRates(borrowerRates);
      setSupplyerRates(supplierRates);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      flex={'1'}
      borderRadius={'20px'}
      bgcolor={'#232734'}
      display={'flex'}
      flexDirection={'column'}
      sx={{ minWidth: { xs: '55%', sm: '35%' } }}
    >
      <Box
        height={'70px'}
        borderBottom={'solid 1px #32394d'}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Box px={'30px'} fontSize={'18px'} fontWeight={'500'} lineHeight={'1'}>
          {asset.underlyingName} {t('statistics')}
        </Box>
        <Box mr={'30px'} display={'flex'} fontSize={'14px'}>
          <CustomSelect arrowcolor={'#428afa'}>
            {poolData.assets.map((asset, i) => (
              <SmOption key={i} value={i}>
                {asset.underlyingName}
              </SmOption>
            ))}
          </CustomSelect>
        </Box>
      </Box>
      <Box flex={1} pb={'16px'} display={'flex'} flexDirection={'column'}>
        <Box flex={1} position={'relative'} pt={'10px'} paddingX={'30px'}>
          <Box
            ml={'-5px'}
            mr={'auto'}
            padding={'6px 7px'}
            fontSize={'10px'}
            borderRadius={'4px'}
            border={'solid 1px #3e4252'}
            display={'inline-block'}
          >
            {t('currentUtilization')}
          </Box>
          <Box mb={'20px'} borderLeft={'1px dashed #484c58'}>
            <ReactApexChart
              options={{
                chart: {
                  type: 'line',
                  zoom: {
                    enabled: false,
                  },
                  toolbar: {
                    show: false,
                  },
                },
                dataLabels: {
                  enabled: false,
                },
                colors: ['#4289ff', '#fa6358'],
                markers: {
                  size: [1, 1],
                  colors: undefined,
                  strokeColors: ['#4289ff', '#fa6358'],
                  discrete: [
                    {
                      seriesIndex: 0,
                      dataPointIndex: 0,
                      fillColor: '#4289ff',
                      strokeColor: '#fff',
                      size: 5,
                      shape: 'circle',
                    },
                    {
                      seriesIndex: 1,
                      dataPointIndex: 0,
                      fillColor: '#fa6358',
                      strokeColor: '#eee',
                      size: 5,
                      shape: 'circle',
                    },
                  ],
                },
                stroke: {
                  curve: 'smooth',
                },
                title: {
                  text: '',
                  align: 'left',
                },
                grid: {
                  show: false,
                  padding: {
                    top: 0,
                    right: 0,
                    bottom: -10,
                    left: 5,
                  },
                },
                xaxis: {
                  position: 'top',
                  axisBorder: {
                    show: false,
                  },
                  labels: {
                    show: false,
                  },
                  axisTicks: {
                    show: false,
                  },
                  categories: supplierRates?.map(({ x }) => x),
                },
                yaxis: {
                  show: false,
                },
                tooltip: {
                  enabled: false,
                },
                legend: {
                  show: false,
                },
              }}
              series={[
                {
                  name: t('supplierRates'),
                  data: supplierRates?.map(({ y }) => y),
                },
                {
                  name: t('borrowerRates'),
                  data: borrowerRates?.map(({ y }) => y),
                },
              ]}
              type='line'
              height={'100%'}
            />
          </Box>
        </Box>
        <Box
          display={'flex'}
          justifyContent={'space-around'}
          paddingY={'20px'}
          borderTop={'1px solid #32394d'}
        >
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            gridGap={'8px'}
          >
            <Box textAlign={'center'} fontSize={'14px'} color={'#c7cad9'}>
              {t('collateralFactor')}:
            </Box>
            <Box textAlign={'center'} fontSize={'14px'} color={'#ebecf2'}>
              {asset.collateralFactor.div(sdk.web3.utils.toBN(1e16)).toNumber()}
              %
            </Box>
          </Box>
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            gridGap={'8px'}
          >
            <Box textAlign={'center'} fontSize={'14px'} color={'#c7cad9'}>
              {t('reserveFactor')}:
            </Box>
            <Box textAlign={'center'} fontSize={'14px'} color={'#ebecf2'}>
              {asset.reserveFactor.div(sdk.web3.utils.toBN(1e16)).toNumber()}%
            </Box>
          </Box>
        </Box>
        <Box
          display={'flex'}
          justifyContent={'space-around'}
          paddingY={'20px'}
          borderTop={'1px solid #32394d'}
        >
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            gridGap={'8px'}
          >
            <Box textAlign={'center'} fontSize={'14px'} color={'#c7cad9'}>
              {t('totalSupplied')}:
            </Box>
            <Box textAlign={'center'} fontSize={'14px'} color={'#ebecf2'}>
              {shortUsdFormatter(asset.totalSupplyUSD)}
            </Box>
          </Box>
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            gridGap={'8px'}
          >
            <Box textAlign={'center'} fontSize={'14px'} color={'#c7cad9'}>
              {t('totalBorrowed')}:
            </Box>
            <Box textAlign={'center'} fontSize={'14px'} color={'#ebecf2'}>
              {shortUsdFormatter(asset.totalBorrowUSD)}
            </Box>
          </Box>
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            gridGap={'8px'}
          >
            <Box textAlign={'center'} fontSize={'14px'} color={'#c7cad9'}>
              {t('utilization')}:
            </Box>
            <Box textAlign={'center'} fontSize={'14px'} color={'#ebecf2'}>
              {asset.totalSupplyUSD.toString() === '0'
                ? '0%'
                : ((asset.totalBorrowUSD / asset.totalSupplyUSD) * 100).toFixed(
                    0,
                  ) + '%'}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const MuiTableCell = withStyles({
  root: {
    padding: '0px',
    borderBottom: 'none',
  },
})(TableCell);

const ItemTableCell = withStyles({
  root: {
    cursor: 'pointer',
  },
})(MuiTableCell);

const ItemTableRow = withStyles({
  root: {
    cursor: 'pointer',
  },
})(TableRow);

const MuiTableCell1Style = withStyles({
  root: {
    padding: '20px 24px',
    borderBottom: '1px solid #32394d',
  },
})(TableCell);

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

export default LendDetailPage;
