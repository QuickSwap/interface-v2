import React from 'react';
import { CustomModal } from 'components';
import {
  Button,
  Flex,
  Grid,
  Heading,
  Table,
  TextField,
  Container,
  Box,
  Text,
} from '@radix-ui/themes';
import { FC, useMemo, useState } from 'react';
import { useActiveWeb3React, useGetConnection } from 'hooks';
import 'components/styles/AssetModal.scss';
import ArrowDownward from '../../assets/images/downward-arrow.svg';
import { useSelectedWallet } from '../../state/user/hooks';
import { getConnections } from '../../connectors';
import {
  useAccount,
  useChains,
  useCollateral,
  useDeposit,
  useWithdraw,
} from '@orderly.network/hooks';
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
  const [chains, { findByChainId }] = useChains('testnet');
  const connections = getConnection(selectedWallet);
  const { account, state } = useAccount();
  const collateral = useCollateral();
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
    depositorAddress: quickSwapAccount,
  });
  const { withdraw } = useWithdraw();
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 assetModalWrapper'
    >
      <Flex
        style={{ margin: '1.5rem' }}
        gap='3'
        align='center'
        justify='center'
        direction='column'
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
          <Flex align='start' justify='between' direction='row' gap='2'>
            <Container style={{ cursor: 'pointer' }}>
              <Text
                size='5'
                weight='medium'
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
              </Text>
              <Text
                size='5'
                weight='medium'
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
              </Text>
            </Container>
          </Flex>
          <Flex
            direction={selectedTab === 'deposit' ? 'column' : 'column-reverse'}
          >
            <Flex direction='column'>
              <Flex
                align='start'
                justify='between'
                direction='row'
                style={{ marginTop: '20px' }}
              >
                <Text
                  size='2'
                  style={{
                    color: '#ebecef',
                    fontFamily: 'Inter',
                    fontWeight: '500',
                  }}
                >
                  Your web3 wallet
                </Text>
                {connections && (
                  <img src={connections.iconName} width='16' height='16' />
                )}
              </Flex>
              <Flex
                align={'center'}
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
              </Flex>
              <Flex
                justify={'between'}
                direction={'row'}
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
                <Flex justify={'start'} direction={'column'}>
                  <Text
                    style={{
                      fontSize: '14px',
                      fontFamily: 'Inter',
                    }}
                  >
                    {selectedTab === 'deposit' ? 'Quantity' : 'Receive'}
                  </Text>
                  <input
                    type='number'
                    value={
                      selectedTab === 'deposit' ? depositAmount : withdrawAmount
                    }
                    step='0.01'
                    min='0'
                    onChange={(event) => {
                      selectedTab === 'deposit'
                        ? setDepositAmount(event.target.value)
                        : setWithdrawAmount(event.target.value);
                    }}
                    style={{
                      width: '60px',
                      height: '17px',
                      margin: '8px 200px 2px 0',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#696c80',
                      border: 'none',
                      outline: 'none',
                      appearance: 'none',
                      backgroundColor: 'transparent',
                    }}
                    placeholder='$0.00'
                  />
                </Flex>
                <Flex
                  align={'end'}
                  direction={'column'}
                  style={{ marginLeft: '20px' }}
                >
                  <Text
                    size={'2'}
                    style={{ marginBottom: '10px', fontSize: '12px' }}
                  >
                    {token?.symbol}
                  </Text>
                  <Text
                    style={{
                      color: '#ccced9',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Available:{' '}
                    <span style={{ fontSize: '14px', marginLeft: '4px' }}>
                      {deposit.balance}
                    </span>
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              direction={'row'}
              align={'center'}
              justify={'center'}
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
            </Flex>
            <Flex direction='column'>
              <Flex
                align='start'
                justify='between'
                direction='row'
                style={{ marginTop: '20px' }}
              >
                <Text
                  size='2'
                  style={{
                    color: '#ebecef',
                    fontFamily: 'Inter',
                    fontWeight: '500',
                  }}
                >
                  Your QuickPerps account
                </Text>
                <Text
                  size='2'
                  style={{
                    color: '#ebecef',
                    fontFamily: 'Inter',
                    fontWeight: '500',
                  }}
                ></Text>
              </Flex>
              <Flex
                justify={'between'}
                direction={'row'}
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
                <Flex justify={'start'} direction={'column'}>
                  <Text
                    style={{
                      fontSize: '14px',
                      fontFamily: 'Inter',
                    }}
                  >
                    {selectedTab === 'deposit' ? 'Receive' : 'Quantity'}
                  </Text>
                  <input
                    type='number'
                    value={
                      selectedTab === 'deposit' ? depositAmount : withdrawAmount
                    }
                    step='0.01'
                    min='0'
                    onChange={(event) => {
                      selectedTab === 'deposit'
                        ? setDepositAmount(event.target.value)
                        : setWithdrawAmount(event.target.value);
                    }}
                    style={{
                      width: '60px',
                      height: '17px',
                      margin: '8px 200px 2px 0',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#696c80',
                      border: 'none',
                      outline: 'none',
                      appearance: 'none',
                      backgroundColor: 'transparent',
                    }}
                    placeholder='$0.00'
                  />
                </Flex>
                <Flex
                  align={'end'}
                  direction={'column'}
                  style={{ marginLeft: '20px' }}
                >
                  <Text
                    size={'2'}
                    style={{ marginBottom: '10px', fontSize: '12px' }}
                  >
                    USDC
                  </Text>
                  <Text
                    style={{
                      color: '#ccced9',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Available:{' '}
                    <span style={{ fontSize: '14px', marginLeft: '4px' }}>
                      {collateral.availableBalance}
                    </span>
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex
            justify={'between'}
            direction={'row'}
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
            <Flex justify={'start'} direction={'column'} gap={'1'}>
              {selectedTab !== 'withdraw' && <Text>1 USDC = 1 USD</Text>}
              <Text>Fee = $0</Text>
            </Flex>
            <Flex align={'end'} direction={'column'}>
              {selectedTab !== 'withdraw' && (
                <Text size={'2'}>Slippage: 1%</Text>
              )}
            </Flex>
          </Flex>

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
          <Container style={{ marginTop: '20px' }}>
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
                    await deposit.deposit(depositAmount);
                  }
                }}
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
          </Container>
        </Box>
      </Flex>
    </CustomModal>
  );
};
export default AssetModal;
