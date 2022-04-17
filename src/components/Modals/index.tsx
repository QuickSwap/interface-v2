/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Input, ModalProps, withStyles } from '@material-ui/core';
import styled, { keyframes } from 'styled-components';
import AntSwitch from 'components/AntSwitch';
import { ArrowForward } from '@material-ui/icons';
import { USDPricedPoolAsset } from 'utils/marketxyz/fetchPoolData';
import { midUsdFormatter } from 'utils/bigUtils';

import * as MarketUtils from 'utils/marketxyz';
import { convertMantissaToAPR, convertMantissaToAPY } from 'utils/marketxyz';

import { getEthPrice } from 'utils';
import { useActiveWeb3React } from 'hooks';

interface ModalParentProps {
  notitle?: boolean;
  notoolbar?: boolean;
  setOpenModalType?: any;
}
const ModalParent: React.FC<ModalParentProps> = ({
  notitle,
  notoolbar,
  children,
  setOpenModalType,
}) => {
  const [visible, setVisible] = useState(true);
  const childrenWithProps = React.Children.map(children, (child) => {
    // Checking isValidElement is the safe way and avoids a typescript
    // error too.
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { setOpenModalType });
    }
    return child;
  });

  const modalContentBox = useRef<any>(null);
  const modalBackBox = useRef<any>(null);

  useEffect(() => {
    const handle = (event: any) => {
      if (
        event.target === modalBackBox.current
        // modalContentBox?.current &&
        // !modalContentBox.current.contains(event.target)
      ) {
        setOpenModalType(false);
      }
    };
    window.addEventListener('click', handle);
    return () => {
      window.removeEventListener('click', handle);
    };
  }, []);

  return (
    <ModalBack ref={modalBackBox}>
      <ModalBox ref={modalContentBox}>
        <Box width={'100%'} display={'flex'} flexDirection={'column'}>
          {!notoolbar && (
            <Box display={'flex'} justifyContent={'space-between'}>
              {!notitle && (
                <Box
                  fontSize={'20px'}
                  display={'flex'}
                  alignItems={'center'}
                  gridGap={'12px'}
                >
                  <LogoIcon size={'32px'} />
                  Quick
                </Box>
              )}
              <Box
                ml={'auto'}
                fontSize={'26px'}
                lineHeight={'32px'}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setOpenModalType(false);
                }}
              >
                &times;
              </Box>
            </Box>
          )}
          {childrenWithProps}
        </Box>
      </ModalBox>
    </ModalBack>
  );
};
const ModalBack = styled(Box)`
  position: fixed;
  top: 0px;
  left: 0px;
  background: #12131a06;
  -webkit-backdrop-filter: blur(9.9px);
  backdrop-filter: blur(9.9px);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100000200;
`;
const ModalBox = styled(Box)`
  margin: auto;
  background-color: #1b1e29;
  padding: 28px 24px;
  border-radius: 20px;
  border: solid 1px #3e4252;
`;

interface ModalContentProps {
  modalSetting: {
    setModalNotoolbar: { value: any; set: any };
    setModalNotitle: { value: any; set: any };
    setModalType: { value: any; set: any };
    setModalIsBorrow: { value: any; set: any };
    setModalIsConfirm: { value: any; set: any };
  };
}

interface QuickModalContentProps extends ModalContentProps {
  confirm?: boolean;
  withdraw?: boolean;
  borrow?: boolean;
  asset: USDPricedPoolAsset;
  borrowLimit: number;
}
export const QuickModalContent: React.FC<QuickModalContentProps> = ({
  modalSetting,
  confirm,
  withdraw,
  borrow,
  asset,
  borrowLimit,
}) => {
  const { account } = useActiveWeb3React();

  const [isRepay, setisRepay] = useState(confirm ? true : false);
  const [isWithdraw, setIsWithdraw] = useState(withdraw ? true : false);
  const [value, setValue] = useState<any>(0);
  const [enableAsCollateral, setEnableAsCollateral] = useState<boolean>(
    modalSetting.setModalIsConfirm.value,
  );

  const [ethPrice, setEthPrice] = useState<number>();

  useEffect(() => {
    getEthPrice().then(([price]) => setEthPrice(price));
  }, []);

  return (
    <Box display={'flex'} flexDirection={'column'} width={'480px'}>
      {!borrow ? (
        <Box
          p={'6px'}
          mt={'24px'}
          display={'flex'}
          borderRadius={'8px'}
          border={'solid 1px #282d3d'}
        >
          <Box
            flex={1}
            margin={'0 6px 0 0'}
            paddingY={'12px'}
            borderRadius={'6px'}
            bgcolor={!isWithdraw ? '#282d3d' : 'unset'}
            color={!isWithdraw ? '#696c80' : 'white'}
            fontSize={'16px'}
            fontWeight={'500'}
            textAlign={'center'}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setIsWithdraw(false);
            }}
          >
            Supply
          </Box>
          <Box
            flex={1}
            margin={'0 6px 0 0'}
            paddingY={'12px'}
            borderRadius={'6px'}
            bgcolor={isWithdraw ? '#282d3d' : 'unset'}
            color={isWithdraw ? '#696c80' : 'white'}
            fontSize={'16px'}
            fontWeight={'500'}
            textAlign={'center'}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setIsWithdraw(true);
            }}
          >
            Withdraw
          </Box>
        </Box>
      ) : (
        <Box
          p={'6px'}
          mt={'24px'}
          display={'flex'}
          borderRadius={'8px'}
          border={'solid 1px #282d3d'}
        >
          <Box
            flex={1}
            margin={'0 6px 0 0'}
            paddingY={'12px'}
            borderRadius={'6px'}
            bgcolor={!isRepay ? '#282d3d' : 'unset'}
            color={!isRepay ? '#696c80' : 'white'}
            fontSize={'16px'}
            fontWeight={'500'}
            textAlign={'center'}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setisRepay(false);
            }}
          >
            Borrow
          </Box>
          <Box
            flex={1}
            margin={'0 6px 0 0'}
            paddingY={'12px'}
            borderRadius={'6px'}
            bgcolor={isRepay ? '#282d3d' : 'unset'}
            color={isRepay ? '#696c80' : 'white'}
            fontSize={'16px'}
            fontWeight={'500'}
            textAlign={'center'}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setisRepay(true);
            }}
          >
            Repay
          </Box>
        </Box>
      )}
      <Box
        mt={'24px'}
        paddingX={'16px'}
        color={'#696c80'}
        fontSize={'12px'}
        fontWeight={'500'}
        display={'flex'}
        justifyContent={'space-between'}
      >
        {!borrow ? <Box>SUPPLY AMOUNT</Box> : <Box>BORROW AMOUNT</Box>}
        {!borrow && (
          <Box>
            Balance:{' '}
            {(
              Number(asset.underlyingBalance.toString()) /
              10 ** Number(asset.underlyinDecimals.toString())
            ).toFixed(3)}{' '}
            {asset.underlyingSymbol}
          </Box>
        )}
      </Box>
      <Box
        mt={'16px'}
        bgcolor={'#12131a'}
        padding={'15px 24px'}
        borderRadius={'10px'}
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        border={modalSetting.setModalIsConfirm.value && 'solid 1px #448aff'}
      >
        <Box display={'flex'} flexDirection={'column'} gridGap={'6px'}>
          <MuiInput
            type={'text'}
            disableUnderline={true}
            placeholder={'0.00'}
            value={value}
            onChange={(e) => {
              setValue(e.currentTarget.value);
            }}
          />
          <Box fontSize={'12px'} fontWeight={'500'} color={'#696c80'}>
            (
            {ethPrice
              ? midUsdFormatter(
                  ((Number(asset.underlyingPrice.toString()) /
                    10 ** Number(asset.underlyinDecimals.toString()) /
                    10 ** 17) *
                    Number(value)) /
                    ethPrice,
                )
              : '?'}
            )
          </Box>
        </Box>
        <Box>
          <Box
            sx={{
              bgcolor: '#1b2c48',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#448aff',
            }}
            onClick={() => {
              setValue(
                (
                  Number(asset.underlyingBalance.toString()) /
                  10 ** asset.underlyinDecimals.toNumber()
                ).toFixed(3),
              );
            }}
          >
            MAX
          </Box>
        </Box>
      </Box>
      {!borrow ? (
        <Box
          mt={'24px'}
          padding={'20px 24px'}
          borderRadius={'10px'}
          border={'solid 1px #282d3d'}
          fontSize={'15px'}
          display={'flex'}
          flexDirection={'column'}
          gridGap={'12px'}
        >
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box color={'#c7cad9'}>Supplied balance:</Box>
            <Box display={'flex'} alignItems={'center'} gridGap={'10px'}>
              {!modalSetting.setModalIsConfirm.value ? (
                (
                  Number(asset.supplyBalance.toString()) /
                  10 ** Number(asset.underlyinDecimals.toString())
                ).toFixed(3) +
                ' ' +
                asset.underlyingSymbol
              ) : (
                <>
                  {asset.supplyBalanceUSD.toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol}
                  <ArrowForward fontSize='small' />
                  {(asset.supplyBalanceUSD + Number(value)).toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol}
                </>
              )}
            </Box>
          </Box>
          <Box bgcolor={'#282d3d'} height={'1px'} />
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box color={'#c7cad9'}>Supply APY:</Box>
            <Box color={'#0fc679'}>
              {convertMantissaToAPY(asset.supplyRatePerBlock, 365)}%
            </Box>
          </Box>
          <Box bgcolor={'#282d3d'} height={'1px'} />
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box color={'#c7cad9'}>Borrow Limit:</Box>
            <Box>
              {!modalSetting.setModalIsConfirm.value ? (
                midUsdFormatter(borrowLimit)
              ) : (
                <>
                  {midUsdFormatter(borrowLimit)}
                  <ArrowForward fontSize='small' />
                  {midUsdFormatter(borrowLimit - value)}
                </>
              )}
            </Box>
          </Box>
          <Box bgcolor={'#282d3d'} height={'1px'} />
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box color={'#c7cad9'}>Total Debt balance:</Box>
            <Box>{midUsdFormatter(asset.borrowBalanceUSD)}</Box>
          </Box>
        </Box>
      ) : (
        <Box
          mt={'24px'}
          padding={'20px 24px'}
          borderRadius={'10px'}
          border={'solid 1px #282d3d'}
          fontSize={'15px'}
          display={'flex'}
          flexDirection={'column'}
          gridGap={'12px'}
        >
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box color={'#c7cad9'}>Borrowed balance:</Box>
            <Box display={'flex'} alignItems={'center'} gridGap={'10px'}>
              {!modalSetting.setModalIsConfirm.value ? (
                asset.borrowBalanceUSD.toFixed(3) + ' ' + asset.underlyingSymbol
              ) : (
                <>
                  {asset.borrowBalanceUSD.toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol}
                  <ArrowForward fontSize='small' />
                  {(asset.borrowBalanceUSD + Number(value)).toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol}
                </>
              )}
            </Box>
          </Box>
          <Box bgcolor={'#282d3d'} height={'1px'} />
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box color={'#c7cad9'}>Supplied balance:</Box>
            <Box display={'flex'} alignItems={'center'} gridGap={'10px'}>
              {!modalSetting.setModalIsConfirm.value ? (
                asset.supplyBalanceUSD.toFixed(3) + ' ' + asset.underlyingSymbol
              ) : (
                <>
                  {asset.supplyBalanceUSD.toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol}
                  <ArrowForward fontSize='small' />
                  {(asset.supplyBalanceUSD + Number(value)).toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol}
                </>
              )}
            </Box>
          </Box>
          <Box bgcolor={'#282d3d'} height={'1px'} />
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box color={'#c7cad9'}>Borrow APR:</Box>
            <Box color={'#0fc679'}>
              {convertMantissaToAPR(asset.borrowRatePerBlock)}%
            </Box>
          </Box>
          <Box bgcolor={'#282d3d'} height={'1px'} />
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box color={'#c7cad9'}>Borrow Limit:</Box>
            <Box>{midUsdFormatter(borrowLimit)}</Box>
          </Box>
          <Box bgcolor={'#282d3d'} height={'1px'} />
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box color={'#c7cad9'}>Total Debt balance:</Box>
            <Box>
              {!modalSetting.setModalIsConfirm.value ? (
                asset.borrowBalanceUSD.toFixed(3) + ' ' + asset.underlyingSymbol
              ) : (
                <>
                  {asset.borrowBalanceUSD.toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol}
                  <ArrowForward fontSize='small' />
                  {(asset.borrowBalanceUSD + Number(value)).toFixed(3) +
                    ' ' +
                    asset.underlyingSymbol}
                </>
              )}
            </Box>
          </Box>
        </Box>
      )}
      {!borrow && !isWithdraw && (
        <Box
          mt={'24px'}
          padding={'22px 24px'}
          borderRadius={'10px'}
          border={'solid 1px #282d3d'}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Box>Enable as collateral</Box>
          <AntSwitch
            inputProps={{ 'aria-label': 'ant design' }}
            defaultChecked={enableAsCollateral}
            onChange={() => {
              setEnableAsCollateral(
                (enableAsCollateral) => !enableAsCollateral,
              );
            }}
          />
        </Box>
      )}
      <Box mt={'24px'} display={'flex'}>
        {value > 0 ? (
          <MuiButton
            fullWidth
            style={{
              cursor: 'pointer',
            }}
            // sx={{
            //   color: '#696c80',
            //   borderRadius: '10px',
            //   bgcolor: '#3e4252',
            //   textAlign: 'center',
            //   fontSize: '16px',
            //   fontWeight: '600',
            // }}
            onClick={() => {
              modalSetting.setModalType.set('state');
              modalSetting.setModalNotoolbar.set(true);

              if (!account) {
                throw new Error('Wallet not connected');
              }

              if (borrow) {
                if (isRepay) {
                  MarketUtils.repayBorrow(asset, value, account);
                } else {
                  MarketUtils.borrow(asset, value, account);
                }
              } else {
                if (isWithdraw) {
                  MarketUtils.withdraw(asset, value, account);
                } else {
                  MarketUtils.supply(asset, value, account, enableAsCollateral);
                }
              }
            }}
          >
            Confirm
            {/* {!modalSetting.setModalIsConfirm.value ? 'Enter amount' : 'Confirm'} */}
          </MuiButton>
        ) : (
          <Box
            width={'100%'}
            py={'16px'}
            borderRadius={'10px'}
            bgcolor={'#3e4252'}
            textAlign={'center'}
            fontSize={'16px'}
            fontWeight={'600'}
            color={'#696c80'}
          >
            Enter amount
          </Box>
        )}
      </Box>
    </Box>
  );
};
interface StateModalContentProps extends ModalContentProps {
  loading?: boolean;
  setOpenModalType?: any;
}
export const StateModalContent: React.FC<StateModalContentProps> = ({
  modalSetting,
  loading,
  setOpenModalType,
}) => {
  const [isLoading, setIsLoading] = useState(loading ? true : false);
  useEffect(() => {
    window.setTimeout(() => {
      isLoading && setIsLoading(false);
    }, 3000);
  }, [isLoading]);
  return (
    <>
      {isLoading ? (
        <Box position={'relative'} width={'369px'}>
          <img
            src={
              require('../../assets/images/resource/loadingmodalback.svg')
                .default
            }
          />
          <Box
            position={'absolute'}
            top={'0px'}
            left={'0px'}
            width={'100%'}
            height={'100%'}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
            gridGap={'32px'}
          >
            <Spinner>
              <img
                src={
                  require('../../assets/images/resource/spinner.svg').default
                }
              />
            </Spinner>
            <Box fontSize={'18px'} fontWeight={'500'} color={'#c7cad9'}>
              Confirm transaction in your wallet
            </Box>
          </Box>
        </Box>
      ) : (
        <Box width={'480px'} display={'flex'} flexDirection={'column'}>
          <Box
            mt={'60px'}
            marginX={'auto'}
            position={'relative'}
            width={'369px'}
          >
            <img
              src={
                require('../../assets/images/resource/loadingmodalback.svg')
                  .default
              }
            />
            <Box
              position={'absolute'}
              top={'0px'}
              left={'0px'}
              width={'100%'}
              height={'100%'}
              display={'flex'}
              flexDirection={'column'}
              alignItems={'center'}
              justifyContent={'center'}
              gridGap={'23px'}
            >
              <Box>
                <img
                  src={
                    require('../../assets/images/resource/success.svg').default
                  }
                />
              </Box>
              <Box fontSize={'18px'} fontWeight={'500'} color={'#c7cad9'}>
                Transaction Submitted
              </Box>
            </Box>
          </Box>
          <Box p={'6px'} mt={'100px'} display={'flex'} borderRadius={'8px'}>
            <Box
              flex={1}
              margin={'0 6px 0 0'}
              paddingY={'12px'}
              borderRadius={'6px'}
              bgcolor={'#282d3d'}
              color={'#696c80'}
              fontSize={'16px'}
              fontWeight={'500'}
              textAlign={'center'}
              style={{ cursor: 'pointer' }}
            >
              View transaction
            </Box>
            <Box
              flex={1}
              margin={'0 6px 0 0'}
              paddingY={'12px'}
              borderRadius={'6px'}
              bgcolor={'#282d3d'}
              color={'#696c80'}
              fontSize={'16px'}
              fontWeight={'500'}
              textAlign={'center'}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setOpenModalType(false);
              }}
            >
              Close
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

const Spinner = styled.div`
  display: flex;
  animation: ${keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `} 1s infinite linear;
`;

interface IconProps {
  size?: any;
  color?: any;
}
const LogoIcon: React.FC<IconProps> = ({
  size = '1em',
  color = 'currentColor',
}) => {
  return (
    <svg
      data-name='Group 20365'
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 32 32'
    >
      <defs>
        <linearGradient
          id='vv1wd4liga'
          x1='.5'
          x2='.5'
          y2='1'
          gradientUnits='objectBoundingBox'
        >
          <stop offset='0' stopColor='#2464f4' />
          <stop offset='1' stopColor='#1db2d5' />
        </linearGradient>
      </defs>
      <circle data-name='Ellipse 528' cx='16' cy='16' r='16' fill='#fff' />
      <path
        data-name='Path 11312'
        d='M766.127 725.606z'
        transform='translate(-749.447 -720.376)'
        fill='url(#vv1wd4liga)'
        opacity='0.3'
      />
      <path
        data-name='Path 11314'
        d='M765.979 725.607z'
        transform='translate(-749.318 -720.376)'
        opacity='0.4'
        fill='url(#vv1wd4liga)'
      />
      <g data-name='Group 15189'>
        <path
          data-name='Path 11311'
          d='M592.8 579.893a13.021 13.021 0 0 0-3.863-2.694 3.639 3.639 0 0 0 .364-1.257l-.063-.027a10.232 10.232 0 0 1-.685 1.126 14.023 14.023 0 0 1-.9 1.164l.741.008c-.939 1.966-3.607 2.826-3.607 2.826-.007.608-.935 1.683-.935 1.683a9.782 9.782 0 0 0 2.97-1.446c6.388.294 7.947 4.035 8.384 4.741.062.1.013.194 0 .179-1.434-2.208-3.5-2.936-3.636-2.807l.676.833a15.161 15.161 0 0 0-5.379-1.451s4.436.772 6.864 3.951a12.082 12.082 0 0 1 2.356 5.392c.015.106.024.19.028.249a13.022 13.022 0 0 0 .437-3.275 12.864 12.864 0 0 0-3.752-9.195zm-6.932-3.646-.185-.032-.16-.026h-.023l-.285-.04h-.019l-.158-.019q-.154-.017-.308-.031h-.037l-.117-.009q-.183-.014-.367-.024a8.606 8.606 0 0 0-.321-.012h-.51c-.165 0-.33.007-.494.016l-.163.009a13.009 13.009 0 0 0-11.733 9.578 13.145 13.145 0 0 0-.433 3.38 4.881 4.881 0 0 0 .04.749 2.232 2.232 0 0 0 .075.326c0 .012.007.024.01.036a8.95 8.95 0 0 0 .881 1.884 10.086 10.086 0 0 0 .736 1.114 5.147 5.147 0 0 0 .361.442l.039.043.047.052c.045.049.091.1.137.146l.03.031a8.32 8.32 0 0 0 2.284 1.626 11 11 0 0 0 4.158 1.084 10.028 10.028 0 0 0 1.506-.011h.075a6.185 6.185 0 0 0 1.587-.334 3.789 3.789 0 0 0 1.192-.62 4.634 4.634 0 0 0 1.142-1.216 4.343 4.343 0 0 0 .72-2.288c.023-1.892-1.869-4.023-4.6-4.271a5.7 5.7 0 0 0-.265-.018h-.508l-.147.007-.126.009-.111.01a4.2 4.2 0 0 0-.222.027q-.284.038-.574.1c-1.78.408-1.161 1.835-1.141 1.882a5.805 5.805 0 0 1-1.237-.25l-.018-.006-.079-.027a3.38 3.38 0 0 1-1.162-.685h-.005l-.032-.031a3.172 3.172 0 0 1-.557-.735h-.005a8.372 8.372 0 0 0-.712.5 9.3 9.3 0 0 1-.106-2.769c.216-1.046 1.881-2.3 1.881-2.3s-.208 1.074.747 1.084 2.068-1.491 2.111-1.361.913.142.913.142-.392 0-.732-.7.718-1.729 2.468-2.36a8.988 8.988 0 0 0 3.12-2.135c.435.049.552 1.266.552 1.266a13.444 13.444 0 0 0 3.084-2.59 12.871 12.871 0 0 0-2.247-.643zm-4.523 5.52c-.89.346-.778.96-.778.96a2.4 2.4 0 0 0 1.453-.289 2.782 2.782 0 0 0 1.092-1.5 16.74 16.74 0 0 1-1.77.83zm1.126 3.247zm-6.843.157c-.267-.09-.616.224-.779.7a1.375 1.375 0 0 0-.073.631 1.551 1.551 0 0 1 .068-.28c.163-.479.512-.793.779-.7a.457.457 0 0 1 .26.4c.051-.366-.045-.678-.258-.75zm5.717-3.4c-.89.346-.778.96-.778.96a2.4 2.4 0 0 0 1.453-.289 2.782 2.782 0 0 0 1.092-1.5 16.74 16.74 0 0 1-1.77.826zm-5.717 3.4c-.267-.09-.616.224-.779.7a1.375 1.375 0 0 0-.073.631 1.551 1.551 0 0 1 .068-.28c.163-.479.512-.793.779-.7a.457.457 0 0 1 .26.4c.051-.366-.045-.678-.258-.75zm5.717-3.4c-.89.346-.778.96-.778.96a2.4 2.4 0 0 0 1.453-.289 2.782 2.782 0 0 0 1.092-1.5 16.74 16.74 0 0 1-1.77.826zm1.126 3.247zm-6.843.157c-.267-.09-.616.224-.779.7a1.375 1.375 0 0 0-.073.631 1.551 1.551 0 0 1 .068-.28c.163-.479.512-.793.779-.7a.457.457 0 0 1 .26.4c.051-.37-.045-.682-.258-.754z'
          transform='translate(-567.551 -572.915)'
          fill='#448aff'
        />
        <g data-name='Group 15188'>
          <path
            data-name='Path 11313'
            d='M592.055 738.968a8.074 8.074 0 0 1-4.692 2.987q-.492.1-.991.166l-.133.016-.127.014h-.039a15.133 15.133 0 0 1-6.821-.945 11.207 11.207 0 0 1-2.163-1.116 13.212 13.212 0 0 1-2.011-1.666 14.45 14.45 0 0 1-3.717-8.348 2.358 2.358 0 0 0 .075.327 8.807 8.807 0 0 0 .892 1.92 10.2 10.2 0 0 0 .735 1.114 5.3 5.3 0 0 0 .361.441l.039.043.048.053q.067.074.137.146l.03.031a8.309 8.309 0 0 0 2.284 1.626 11 11 0 0 0 4.158 1.085 10.06 10.06 0 0 0 1.506-.011h.075a6.205 6.205 0 0 0 1.587-.335 3.765 3.765 0 0 0 1.192-.62 4.639 4.639 0 0 0 1.141-1.216 4.351 4.351 0 0 0 .721-2.289c.024-2.026-2.146-4.326-5.191-4.3-.069 0-.138 0-.207.006h-.146l-.142.011a4.727 4.727 0 0 0-.236.026h-.018c-.2.027-.4.063-.6.109-1.04.238-1.261.825-1.261 1.281a1.609 1.609 0 0 0 .121.6h-.009a5.86 5.86 0 0 1-1.237-.25l-.019-.006-.079-.027a3.368 3.368 0 0 1-1.162-.686h-.006l-.031-.03a2.975 2.975 0 0 1-.32-.366 3.613 3.613 0 0 1-.238-.37 10.944 10.944 0 0 1 5.433-1.679l.2-.008q.406-.012.815 0 .643.02 1.289.1a10.733 10.733 0 0 1 1.923.4h.007v-.005h.005a4.452 4.452 0 0 0-.557-.782c-.265-.308-.959-1.117-1.42-1.11l.135-.008q.423-.021.852 0a9.788 9.788 0 0 1 7.234 3.506l.035.037.042.055a10.341 10.341 0 0 1 1.269 2.192 12.4 12.4 0 0 1 .643 2.866 6.954 6.954 0 0 1-1.411 5.015z'
            transform='translate(-568.31 -713.223)'
            fill='#303f9f'
          />
          <path
            data-name='Path 11315'
            d='M656.577 738.968a8.073 8.073 0 0 1-4.692 2.987q-.492.1-.991.166l-.133.016-.127.014h-.039c-.09.009-.179.017-.27.024a14.48 14.48 0 0 1-2.651-.036 11.46 11.46 0 0 1-3.9-.932l-.1-.053c.166-.008.337 0 .505 0a9.02 9.02 0 0 0 6-2.371 8.142 8.142 0 0 0 2.856-5.93c0-.231-.011-.466-.032-.7l-.01-.107-.044.1a4.563 4.563 0 0 1-2.81 2.525l-.029.009a4.014 4.014 0 0 0 .56-1.181 4.329 4.329 0 0 0 .18-1.116c.023-1.933-1.954-4.116-4.78-4.286h-.038l-.151-.006h-.567l-.143.011a4.86 4.86 0 0 0-.236.026h-.018c-.2.026-.406.063-.614.11-1.779.407-1.161 1.835-1.139 1.882a3.524 3.524 0 0 1-3.1-1.741 10.946 10.946 0 0 1 5.442-1.679l.2-.008q.406-.012.815 0 .639.021 1.281.1a10.526 10.526 0 0 1 1.93.4h.006a4.536 4.536 0 0 0-.557-.782c-.263-.306-.952-1.107-1.412-1.11h-.012c.048 0 .1-.006.145-.008q.424-.021.852 0a9.789 9.789 0 0 1 7.226 3.506l.035.037.051.055a6.478 6.478 0 0 1 1.269 2.192 12.406 12.406 0 0 1 .643 2.866 6.953 6.953 0 0 1-1.401 5.02z'
            transform='translate(-632.832 -713.223)'
            fill='#1a237e'
            opacity='0.7'
          />
        </g>
      </g>
    </svg>
  );
};

const MuiButton = withStyles({
  root: {
    paddingTop: '16px',
    paddingBottom: '16px',
  },
})(Button);
const MuiInput = withStyles({
  root: {
    fontSize: '20px',
    fontWeight: 'bolder',
    color: '#c7cad9',
  },
})(Input);

export default ModalParent;
