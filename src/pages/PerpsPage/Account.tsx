import React from 'react';
import { useAccount } from '@orderly.network/hooks';
import { AccountStatusEnum } from '@orderly.network/types';
import { Button, Card, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { FC, useEffect, useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import AccountModal from '../../components/AccountModal';

export const Account: FC = () => {
  const { account, state } = useAccount();
  const { account: quickSwapAccount, library, chainId } = useActiveWeb3React();

  useEffect(() => {
    if (!library || !quickSwapAccount) return;
    account.setAddress(quickSwapAccount, {
      provider: library,
      chain: {
        id: chainId,
      },
    });
  }, [library, account]);

  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => {
    setModalOpen(true);
  };
  return (
    <Flex
      style={{ margin: '1.5rem' }}
      gap='3'
      align='center'
      justify='center'
      direction='column'
    >
      <Heading>Account</Heading>

      <Card style={{ maxWidth: 240 }}>
        {state.accountId ? (
          <>
            <Flex gap='2' direction='column'>
              <Container>
                <Text as='div' size='2' weight='bold'>
                  Orderly Account ID:
                </Text>
                <Text as='div' size='2'>
                  {state.accountId}
                </Text>
              </Container>
              <Container>
                <Text as='div' size='2' weight='bold'>
                  Address:
                </Text>
                <Text as='div' size='2'>
                  {state.address}
                </Text>
              </Container>
              <Container>
                <Text as='div' size='2' weight='bold'>
                  User ID:
                </Text>
                <Text as='div' size='2'>
                  {state.userId}
                </Text>
              </Container>
            </Flex>
          </>
        ) : (
          <Text as='div' size='3' weight='bold' color='red'>
            Not connected!
          </Text>
        )}
      </Card>

      <Button
        disabled={state.status !== AccountStatusEnum.NotSignedIn}
        onClick={() => {
          account.createAccount();
        }}
        style={{ color: 'white' }}
      >
        Create Account
      </Button>

      <Button
        disabled={
          state.status > AccountStatusEnum.DisabledTrading ||
          state.status === AccountStatusEnum.NotConnected
        }
        onClick={() => {
          account.createOrderlyKey(30);
        }}
        style={{ color: 'white' }}
      >
        Create Orderly Key
      </Button>

      <Button onClick={() => openModal()} style={{ color: 'white' }}>
        Show Modal
      </Button>
      <AccountModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Flex>
  );
};
