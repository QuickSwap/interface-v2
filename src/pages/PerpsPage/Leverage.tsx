import React, { FC, useMemo, useState, useEffect } from 'react';
import { Box, Button, Flex, Text, Container, Switch } from '@radix-ui/themes';
import Arrow from '../../assets/images/downward.svg';
import { CropSquareOutlined } from '@material-ui/icons';
import { useActiveWeb3React } from 'hooks';
import AssetModal from '../../components/AssetModal';
import AccountModal from '../../components/AccountModal';
import { AccountStatusEnum } from '@orderly.network/types';
import {
  useAccount,
  useChains,
  useCollateral,
  useDeposit,
  useWithdraw,
} from '@orderly.network/hooks';
export const Leverage: React.FC = () => {
  enum ModalType {
    Deposit = 'deposit',
    Withdraw = 'withdraw',
  }
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(ModalType.Deposit);
  const openModal = (type: ModalType) => {
    setModalType(type);
    setAssetModalOpen(true);
  };
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const openAccountModal = () => {
    setAccountModalOpen(true);
  };
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

  const collateral = useCollateral();
  const [chains, { findByChainId }] = useChains('mainnet');
  const token = useMemo(() => {
    return Array.isArray(chains) ? chains[0].token_infos[0] : undefined;
  }, [chains]);
  const [amount, setAmount] = useState<string | undefined>();
  const {
    dst,
    balance,
    allowance,
    approve,
    deposit,
    isNativeToken,
    balanceRevalidating,
    fetchBalance,
  } = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(chainId),
  });
  const showConnectWalletButton = () => {
    return (
      state.status === AccountStatusEnum.NotSignedIn ||
      state.status === AccountStatusEnum.DisabledTrading
    );
  };
  console.log('address', token?.address);
  console.log('decimals', token?.decimals);
  console.log('srcToken', token?.symbol);

  return (
    <Flex direction='column' align='center' justify='center'>
      <Box
        style={{
          width: 330,
          height: 600,
          backgroundColor: '#12131a',
          border: '1px solid  #1b1e29',
        }}
      >
        <Flex direction='row' justify='between'>
          <Flex
            direction={'column'}
            align={'start'}
            gap='3'
            style={{ margin: '10px 15px' }}
          >
            <Text
              style={{
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '500',
                color: '#61657a',
              }}
            >
              Balance
            </Text>
            <Text
              style={{
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '500',
                color: '#61657a',
              }}
            >
              {balance} USDC
            </Text>
          </Flex>
          <Flex direction='row' align='center' style={{ marginRight: '15px' }}>
            <Button
              variant='outline'
              style={{ color: '#448aff', borderColor: '#448aff' }}
              onClick={() => openModal(ModalType.Deposit)}
            >
              Manage
            </Button>
            <img
              src={Arrow}
              width='16'
              height='16'
              style={{ margin: '5px 0 5px 16px' }}
            />
          </Flex>
        </Flex>
        <Container
          style={{
            width: 300,
            height: 0.5,
            backgroundColor: '#696C80',
            margin: '10px 15px',
          }}
        />
        <Container
          style={{
            width: 300,
            height: 8,
            borderRadius: '8px',
            backgroundImage:
              'linear-gradient(to right, #24403a, #3f3c2f 48%, #402230)',
            margin: '0px 15px',
          }}
        />
        <Flex direction='row' justify='between'>
          <Flex
            direction={'column'}
            align={'start'}
            gap='3'
            style={{ margin: '10px 15px' }}
          >
            <Text
              style={{
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '500',
                color: '#61657a',
              }}
            >
              Account Leverage
            </Text>
            <Text
              style={{
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '500',
                color: '#61657a',
              }}
            >
              0.00x/-x
            </Text>
          </Flex>
          <Flex
            direction={'column'}
            align={'end'}
            gap='3'
            style={{ margin: '10px 15px' }}
          >
            <Text
              style={{
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '500',
                color: '#61657a',
              }}
            >
              Margin Ratio
            </Text>
            <Text
              style={{
                fontSize: '12px',
                fontFamily: 'Inter',
                fontWeight: '500',
                color: '#61657a',
              }}
            >
              100%
            </Text>
          </Flex>
        </Flex>
        <Container
          style={{
            width: 300,
            height: 0.5,
            backgroundColor: '#696C80',
            margin: '10px 15px',
          }}
        />
        <Flex
          direction='row'
          justify='center'
          gap='1'
          align='center'
          style={{ cursor: 'pointer' }}
        >
          <button
            style={{
              width: 149,
              height: 36,
              padding: '0 43px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#61657a',
              fontFamily: 'Inter',
              backgroundColor: '#1b1e29',
              fontWeight: 500,
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={async () => {
              if (amount == null) return;
              if (Number(allowance) < Number(amount)) {
                await approve(amount.toString());
              } else {
                await deposit();
              }
            }}
          >
            Buy/Long
          </button>
          <button
            style={{
              width: 149,
              height: 36,
              padding: '0 43px',
              borderRadius: '8px',
              backgroundColor: '#1b1e29',
              fontSize: '12px',
              fontWeight: 500,
              color: '#61657a',
              fontFamily: 'Inter',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Sell/Short
          </button>
        </Flex>
        <Flex
          direction='row'
          justify='between'
          align='center'
          style={{
            margin: '16px 15px',
            fontWeight: 500,
            fontFamily: 'Inter',
            fontSize: '12px',
          }}
        >
          <Text style={{ color: ' #61657a' }}>
            Available {collateral.availableBalance} USDC
          </Text>
          <Text style={{ color: '#448aff' }}>Deposit</Text>
        </Flex>
        <Flex
          direction='row'
          align='start'
          justify='start'
          gap='3'
          style={{
            margin: '16px 15px',
            fontWeight: 500,
            fontFamily: 'Inter',
            fontSize: '12px',
          }}
        >
          <Text style={{ color: ' #61657a' }}>Limit</Text>
          <Text>Market</Text>
        </Flex>
        <Flex
          direction='row'
          justify='between'
          align='center'
          style={{
            width: 300,
            height: 36,
            backgroundColor: '#1b1e29',
            margin: '16px 15px',
            fontWeight: 500,
            fontFamily: 'Inter',
            cursor: 'pointer',
            fontSize: '12px',
            borderRadius: '8px',
            color: '#61657a',
            padding: '10px 12px 11px',
          }}
        >
          <input
            type='text'
            placeholder='Quantity'
            onChange={(e) => setAmount(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              outline: 'none',
              width: '100%',
              fontFamily: 'Inter',
              fontSize: '12px',
            }}
          />
          <Text>ETH</Text>
        </Flex>
        <Flex
          direction={'row'}
          align={'center'}
          justify={'between'}
          gap='3'
          style={{ margin: '10px 15px' }}
        >
          <Text
            style={{
              fontSize: '12px',
              fontFamily: 'Inter',
              fontWeight: '500',
              color: '#61657a',
            }}
          >
            0%
          </Text>
          <Text
            style={{
              fontSize: '12px',
              fontFamily: 'Inter',
              fontWeight: '500',
              color: '#61657a',
            }}
          >
            Max buy 0.000
          </Text>
        </Flex>
        <Flex
          direction={'row'}
          align={'center'}
          justify={'between'}
          style={{
            margin: '15px 15px',
            cursor: 'pointer',
          }}
        >
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
          />
          <Container
            style={{
              width: 30,
              height: 0.5,
              backgroundColor: '#696C80',
            }}
          />
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
          />
          <Container
            style={{
              width: 30,
              height: 0.5,
              backgroundColor: '#696C80',
            }}
          />
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
          />
          <Container
            style={{
              width: 30,
              height: 0.5,
              backgroundColor: '#696C80',
            }}
          />
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
          />
          <Container
            style={{
              width: 30,
              height: 0.5,
              backgroundColor: '#696C80',
            }}
          />
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
          />
        </Flex>
        <Flex
          direction='row'
          justify='between'
          align='center'
          style={{
            width: 300,
            height: 36,
            backgroundColor: '#1b1e29',
            margin: '16px 15px',
            fontWeight: 500,
            fontFamily: 'Inter',
            fontSize: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            padding: '10px 12px 11px',
            color: '#61657a',
          }}
        >
          <Text>Total</Text>
          <Text>USDC</Text>
        </Flex>
        <Container
          style={{
            width: 300,
            height: 0.5,
            backgroundColor: '#696C80',
            margin: '10px 15px',
          }}
        />
        <Flex
          direction='row'
          justify='between'
          align='center'
          style={{
            margin: '10px 15px',
            fontWeight: 500,
            fontFamily: 'Inter',
            fontSize: '12px',
            borderRadius: '8px',
            color: '#61657a',
          }}
        >
          <Text as='label'>
            <Flex gap='2'>
              <Switch defaultChecked size='1' color='gray' /> Reduce Only
            </Flex>
          </Text>
          <img src={Arrow} width='16' height='16' />
        </Flex>
        {showConnectWalletButton() && (
          <Button
            onClick={() => openAccountModal()}
            style={{
              width: 300,
              height: 40,
              margin: '16px 15px',
              padding: '11px 10px 12px',
              borderRadius: '8px',
              backgroundColor: '#448aff',
              cursor: 'pointer',
            }}
          >
            Connect Wallet
          </Button>
        )}
      </Box>
      <AssetModal
        open={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        modalType={modalType}
      />
      <AccountModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />
    </Flex>
  );
};
