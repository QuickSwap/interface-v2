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
import { FC, useEffect } from 'react';
import { useActiveWeb3React } from 'hooks';
import '../styles/AccountModal.scss';
import num1 from '../../assets/images/num1.svg';
import num2 from '../../assets/images/num2.svg';
import success from '../../assets/images/success.svg';
import { useAccount } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}
const AccountModal: React.FC<AccountModalProps> = ({ open, onClose }) => {
  const { account, state } = useAccount();
  const { account: quickSwapAccount, library, chainId } = useActiveWeb3React();

  useEffect(() => {
    if (!library || !quickSwapAccount) return;
    account.setAddress(quickSwapAccount, {
      provider: library.provider,
      chain: {
        id: chainId,
      },
    });
    console.log('Account is', account);
    console.log('library is', library);
    console.log('chainId is', chainId);
    console.log('state.status is', state.status);
    console.log(
      '[Account] AccountStatusEnum.NotSignedIn',
      AccountStatusEnum.NotSignedIn,
    );
    console.log(
      '[Account] AccountStatusEnum.DisabledTrading',
      AccountStatusEnum.DisabledTrading,
    );
    console.log(
      '[Account] AccountStatusEnum.NotConnected',
      AccountStatusEnum.NotConnected,
    );
  }, [library, account, quickSwapAccount, chainId]);

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
            borderRadius: 16,
            boxShadow: '0 0 32px 0 rgba(46, 48, 60, 0.12)',
            backgroundColor: '#1b1e29',
          }}
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
                Sign two request to verify ownership of your wallet and enable
                trading. Signing is free.
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
              direction={'column'}
              style={{
                width: '400px',
                borderRadius: '8px',
                margin: '8px 0 0',
                padding: '16px 16px 16px',
                backgroundColor: '#282d3d',
                opacity: '0.6',
              }}
            >
              <Flex
                style={{
                  flexDirection: 'row',
                  padding: '10px 15px',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                {state.status === AccountStatusEnum.NotSignedIn ? (
                  <img src={num1} width={32} height={32} />
                ) : (
                  <img src={success} width={32} height={32} />
                )}
                {/* Text Container */}
                <Flex
                  style={{ flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  {/* Heading */}
                  <Text size='3' style={{ color: 'white' }}>
                    Sign in
                  </Text>
                  {/* Text */}
                  <Text size='1' style={{ color: 'grey' }}>
                    Confirm you own this wallet
                  </Text>
                </Flex>
              </Flex>

              <Flex
                style={{
                  flexDirection: 'row',
                  padding: '10px 15px',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                {state.status > AccountStatusEnum.DisabledTrading ||
                state.status === AccountStatusEnum.NotConnected ? (
                  <img src={success} width={32} height={32} />
                ) : (
                  <img src={num2} width={32} height={32} />
                )}
                {/* Text Container */}
                <Flex
                  style={{ flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  {/* Heading */}
                  <Text size='3' style={{ color: 'white' }}>
                    Enable Trading
                  </Text>
                  {/* Text */}
                  <Text size='1' style={{ color: 'grey' }}>
                    Enable ensures access to our API for lightning-fast trading.
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          <Container style={{ marginTop: '20px' }}>
            {state.status === AccountStatusEnum.NotSignedIn ? (
              <Button
                onClick={() => {
                  account.createAccount();
                }}
                style={{
                  width: '400px',
                  height: '48px',
                  padding: '15px 14px 15px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  backgroundColor: '#448aff',
                  color: '#fff',
                }}
              >
                Sign in
              </Button>
            ) : state.status > AccountStatusEnum.DisabledTrading ||
              state.status === AccountStatusEnum.NotConnected ? null : (
              <Button
                onClick={() => {
                  account.createOrderlyKey(30);
                }}
                style={{
                  width: '400px',
                  height: '48px',
                  padding: '15px 14px 15px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  backgroundColor: '#448aff',
                  color: '#fff',
                }}
              >
                Enable Trading
              </Button>
            )}
          </Container>
        </Box>
      </Flex>
    </CustomModal>
  );
};
export default AccountModal;
