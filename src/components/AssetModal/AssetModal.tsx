import React from 'react';
import { CustomModal } from 'components';
import { FC, useMemo, useState } from 'react';
import { useActiveWeb3React, useGetConnection } from 'hooks';
import 'components/styles/AssetModal.scss';
import ArrowDownward from '../../assets/images/downward-arrow.svg';
import { useSelectedWallet } from '../../state/user/hooks';
import { getConnections } from '../../connectors';
import NotifyModal from '../NotifyModal';
import {
  useAccount,
  useChains,
  useCollateral,
  useDeposit,
  useWithdraw,
} from '@orderly.network/hooks';
import { Box, Button } from '@material-ui/core';
interface AssetModalProps {
  open: boolean;
  onClose: () => void;
  modalType: string;
}
const AssetModal: React.FC<AssetModalProps> = ({
  open,
  onClose,
  modalType,
}) => {
  const [selectedTab, setSelectedTab] = useState(modalType);
  const { account: quickSwapAccount, library, chainId } = useActiveWeb3React();
  const { selectedWallet } = useSelectedWallet();
  const getConnection = useGetConnection();
  const [chains, { findByChainId }] = useChains('mainnet');
  const connections = selectedWallet
    ? getConnection(selectedWallet)
    : undefined;
  const { account, state } = useAccount();
  const collateral = useCollateral();
  const [notifications, setNotifications] = useState(false);
  const token = useMemo(() => {
    return Array.isArray(chains) ? chains[0].token_infos[0] : undefined;
  }, [chains]);
  const [depositAmount, setDepositAmount] = useState<string | undefined>();
  const [withdrawAmount, setWithdrawAmount] = useState<string | undefined>();
  const deposit = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(chainId),
  });
  const { withdraw } = useWithdraw();
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 assetModalWrapper'
    >
      <Box
        className='flex items-center justify-center flex-col'
        style={{ margin: '1.5rem' }}
        gridGap='3'
      >
        <Box
          style={{
            padding: '10px 15px',
            width: 432,
            height: 550,
            borderRadius: 16,
            boxShadow: '0 0 32px 0 rgba(46, 48, 60, 0.12)',
            backgroundColor: '#1b1e29',
          }}
        >
          <Box className='flex items-start justify-between' gridGap='2'>
            <Box style={{ cursor: 'pointer' }}>
              <h2
                style={{
                  color: selectedTab === 'deposit' ? '#ebecf2' : '#61657a',
                  fontFamily: 'Inter',
                  margin: '0 5px',
                  fontSize: '16px',
                  borderBottom:
                    selectedTab === 'deposit' ? '2px solid #fff' : 'none',
                }}
                onClick={() => setSelectedTab('deposit')}
              >
                Deposit
              </h2>
              <h5
                style={{
                  color: selectedTab === 'withdraw' ? '#ebecf2' : '#61657a',
                  fontFamily: 'Inter',
                  margin: '0 5px',
                  fontSize: '16px',
                  borderBottom:
                    selectedTab === 'withdraw' ? '2px solid #fff' : 'none',
                }}
                onClick={() => setSelectedTab('withdraw')}
              >
                Withdraw
              </h5>
            </Box>
          </Box>
          <Box
            className={`flex ${
              selectedTab === 'deposit' ? 'flex-col' : 'flex-col-reverse'
            }`}
          >
            <Box className='flex flex-col'>
              <Box
                className='flex justify-between items-start'
                style={{ marginTop: '20px' }}
              >
                <h2
                  style={{
                    color: '#ebecef',
                    fontFamily: 'Inter',
                    fontWeight: '500',
                  }}
                >
                  Your web3 wallet
                </h2>
                {connections && (
                  <img src={connections.iconName} width='16' height='16' />
                )}
              </Box>
              <Box
                className='flex items-center'
                style={{ width: 'full', margin: '10px 0 16px 0' }}
              >
                <Box
                  style={{
                    width: '196px',
                    height: '40px',
                    backgroundColor: '#282d3d',
                    color: '#ccced9',
                    opacity: '0.6',
                    borderRadius: '8px',
                    margin: '0 8px 0 0',
                    padding: '10px 99px 13px 16px',
                  }}
                >
                  {quickSwapAccount
                    ? quickSwapAccount.substring(0, 6) +
                      '...' +
                      quickSwapAccount.substring(quickSwapAccount.length - 4)
                    : 'Connect Wallet'}
                </Box>
                <Box
                  style={{
                    width: '196px',
                    height: '40px',
                    backgroundColor: '#282d3d',
                    color: '#ccced9',
                    opacity: '0.6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'start',
                    padding: '10px 16px',
                  }}
                >
                  {chains[0].network_infos.name}
                </Box>
              </Box>
              <Box
                className='flex justify-between'
                style={{
                  width: '400px',
                  height: '70px',
                  borderRadius: '8px',
                  margin: '8px 0 0',
                  padding: '11px 16px 15px',
                  backgroundColor: '#282d3d',
                  opacity: '0.6',
                }}
              >
                <Box className='flex flex-col justify-start'>
                  <small
                    style={{
                      fontSize: '14px',
                      fontFamily: 'Inter',
                    }}
                  >
                    {selectedTab === 'deposit' ? 'Quantity' : 'Receive'}
                  </small>
                  <input
                    value={
                      selectedTab === 'deposit' ? depositAmount : withdrawAmount
                    }
                    type='number'
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/, '');
                      selectedTab === 'deposit'
                        ? setDepositAmount(value)
                        : setWithdrawAmount(value);
                    }}
                    style={{
                      width: 69,
                      height: '17px',
                      margin: '8px 200px 2px 0',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#fff',
                      border: 'none',
                      outline: 'none',
                      appearance: 'none',
                      backgroundColor: 'transparent',
                    }}
                    placeholder='$0.00'
                  />
                </Box>
                <Box style={{ marginLeft: '20px' }}>
                  <h2 style={{ marginBottom: '10px', fontSize: '12px' }}>
                    {token?.symbol}
                  </h2>
                  <p
                    style={{
                      color: '#ccced9',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Available:{' '}
                    <span style={{ fontSize: '14px', marginLeft: '4px' }}>
                      {parseFloat(deposit.balance).toFixed(2)}
                    </span>
                  </p>
                </Box>
              </Box>
            </Box>
            <Box
              style={{
                height: '32px',
                width: '400px',
                background: 'transparent',
                margin: '8px 0',
              }}
            >
              <div
                style={{
                  width: '400px',
                  height: '1px',
                  margin: '16px 0 15px',
                  backgroundColor: '#696c80',
                  opacity: '0.12',
                }}
              />
              <img src={ArrowDownward} width={32} height={32} />
              <div
                style={{
                  width: '400px',
                  height: '1px',
                  margin: '16px 0 15px',
                  backgroundColor: '#696c80',
                  opacity: '0.12',
                }}
              />
            </Box>
            <Box>
              <Box style={{ marginTop: '20px' }}>
                <p
                  style={{
                    color: '#ebecef',
                    fontFamily: 'Inter',
                    fontWeight: '500',
                  }}
                >
                  Your QuickPerps account
                </p>
              </Box>
              <Box
                style={{
                  width: '400px',
                  height: '70px',
                  borderRadius: '8px',
                  margin: '8px 0 0',
                  padding: '11px 16px 15px',
                  backgroundColor: '#282d3d',
                  opacity: '0.6',
                }}
              >
                <Box>
                  <small>
                    {selectedTab === 'deposit' ? 'Receive' : 'Quantity'}
                  </small>
                  <input
                    type='text'
                    value={
                      selectedTab === 'deposit' ? depositAmount : withdrawAmount
                    }
                    onChange={(event) => {
                      selectedTab === 'deposit'
                        ? setDepositAmount(event.target.value)
                        : setWithdrawAmount(event.target.value);
                    }}
                    style={{
                      width: '69px',
                      height: '17px',
                      margin: '8px 200px 2px 0',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#fff',
                      border: 'none',
                      outline: 'none',
                      appearance: 'none',
                      backgroundColor: 'transparent',
                    }}
                    placeholder='$0.00'
                  />
                </Box>
                <Box style={{ marginLeft: '20px' }}>
                  <h1 style={{ marginBottom: '10px', fontSize: '12px' }}>
                    USDC
                  </h1>
                  <span
                    style={{
                      color: '#ccced9',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Available:{' '}
                    <span style={{ fontSize: '14px', marginLeft: '4px' }}>
                      {collateral.availableBalance?.toFixed(2)}
                    </span>
                  </span>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            style={{
              width: '400px',
              height: '55px',
              margin: '10px 0 0',
              fontSize: '12px',
              padding: '0 5px',
              fontFamily: 'Inter',
              color: '#696c80',
              fontWeight: 500,
            }}
          >
            <Box gridGap={'1'}>
              {selectedTab !== 'withdraw' && <p>1 USDC = 1 USD</p>}
              <p>Fee = $0</p>
            </Box>
            <Box>{selectedTab !== 'withdraw' && <h5>Slippage: 1%</h5>}</Box>
          </Box>

          <Box
            style={{
              margin: '0 36px',
              fontSize: '12px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: 500,
              color: '#ccced9',
            }}
          >
            Cross-chain transaction fees will be charged. To avoid fees, use our
            supported Bridgeless networks.
          </Box>
          <Box style={{ marginTop: '20px' }}>
            {selectedTab === 'deposit' ? (
              <Button
                style={{
                  width: '400px',
                  height: '48px',
                  padding: '13px 143px 15px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  backgroundColor: '#448aff',
                  color: '#fff',
                }}
                disabled={depositAmount == null}
                onClick={async () => {
                  if (depositAmount == null) return;
                  if (Number(deposit.allowance) < Number(depositAmount)) {
                    await deposit.approve(depositAmount.toString());
                  } else {
                    deposit.setQuantity(depositAmount.toString());
                    const tx = await deposit.deposit();
                    setNotifications(true);
                  }
                }}
                // onClick={() => {
                //   console.log('Deposit Working');
                // }}
              >
                {Number(deposit.allowance) < Number(depositAmount)
                  ? 'Approve'
                  : 'Deposit'}
              </Button>
            ) : (
              <Button
                style={{
                  width: '400px',
                  height: '48px',
                  padding: '13px 143px 15px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  backgroundColor: '#448aff',
                  color: '#fff',
                }}
                disabled={withdrawAmount == null}
                onClick={async () => {
                  if (withdrawAmount == null) return;
                  await withdraw({
                    chainId: Number(chainId),
                    amount: withdrawAmount,
                    token: 'USDC',
                    allowCrossChainWithdraw: false,
                  });
                }}
              >
                {/*{Number(deposit.allowance) < Number(amount) ? 'Approve' : 'Deposit'}*/}
                Withdraw
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      <NotifyModal
        open={notifications}
        onClose={() => setNotifications(false)}
      />
    </CustomModal>
  );
};
export default AssetModal;
