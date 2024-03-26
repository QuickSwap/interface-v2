import React, { useEffect, useMemo, useState } from 'react';
import Arrow from 'assets/images/downward.svg';
import { CropSquareOutlined } from '@material-ui/icons';
import { useActiveWeb3React } from 'hooks';
import {
  useAccount,
  useChains,
  useCollateral,
  useDeposit,
  useOrderEntry,
  usePositionStream,
} from '@orderly.network/hooks';
import AssetModal from '../../components/AssetModal';
import { AccountStatusEnum } from '@orderly.network/types';
import AccountModal from '../../components/AccountModal';
import { Simulate } from 'react-dom/test-utils';
import submit = Simulate.submit;
import { Box, Button, Switch } from '@material-ui/core';
import { pointer } from 'd3';

export const Leverage: React.FC<{ perpToken: string; orderQuantity: any }> = ({
  perpToken,
  orderQuantity,
}) => {
  const [x, positionInfo] = usePositionStream(perpToken);

  const [orderType, setOrderType] = useState<string | undefined>('limit');
  const { account: quickSwapAccount, library, chainId } = useActiveWeb3React();
  const [chains, { findByChainId }] = useChains('mainnet');
  const [clickedIndex, setClickedIndex] = useState<number>(0);

  const { account, state } = useAccount();
  const token = useMemo(() => {
    return Array.isArray(chains) ? chains[0].token_infos[0] : undefined;
  }, [chains]);
  const deposit = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(chainId),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const collateral = useCollateral();
  const [order, setOrder] = useState<any>({
    order_price: 0,
    order_quantity: 0,
    order_type: 'LIMIT',
    side: 'BUY',
    order_symbol: perpToken,
  });
  const { onSubmit, submit } = useOrderEntry(
    {
      symbol: perpToken,
      side: order.side,
      order_type: order.order_type,
      order_price: order.order_price,
      order_quantity: order.order_quantity,
    },
    { watchOrderbook: true },
  );
  useEffect(() => {
    if (!library || !quickSwapAccount) return;
    account.setAddress(quickSwapAccount, {
      provider: library.provider,
      chain: {
        id: chainId,
      },
    });
  }, [library, account]);

  useEffect(() => {
    if (state.status === AccountStatusEnum.EnableTrading) {
      setAccountModalOpen(false);
    }
  }, [state.status]);

  const handleClick = (index: number) => {
    setClickedIndex(index);
    const percentage = index * 25;
    console.log(`Clicked box ${index + 1}, percentage: ${percentage}%`);
  };

  return (
    <>
      <Box padding='15px 10px'>
        <Box className='flex items-center justify-between' gridGap={8}>
          <Box>
            <p className='span text-secondary'>Total Balance</p>
            <p className='span'>
              {deposit?.balance}{' '}
              <span className='text-secondary'>{token?.symbol}</span>
            </p>
          </Box>
          <Box className='flex items-center' gridGap={8}>
            <Button
              className='leverageManageButton'
              disabled={!quickSwapAccount}
              onClick={() => {
                setModalOpen(true);
              }}
            >
              Manage
            </Button>
            <img src={Arrow} width='16' height='16' />
          </Box>
        </Box>
        <Box
          padding='15px 0'
          margin='15px 0'
          className='border-top border-bottom flex flex-col'
          gridGap={12}
        >
          <Box className='leverageGradient' />
          <Box className='flex justify-between' gridGap={8}>
            <Box>
              <p className='span text-secondary'>Account Leverage</p>
              <p className='span'>0.00x/-x</p>
            </Box>
            <Box textAlign='right'>
              <p className='span text-secondary'>Margin Ratio</p>
              <p className='span'>100%</p>
            </Box>
          </Box>
        </Box>
        <Box className='leverageTypesWrapper' gridGap={2}>
          <Box onClick={() => setOrder({ ...order, side: 'BUY' })}>
            <span className='text-secondary'>Buy/Long</span>
          </Box>
          <Box onClick={() => setOrder({ ...order, side: 'SELL' })}>
            <span className='text-secondary'>Sell/Short</span>
          </Box>
        </Box>
        <Box className='flex justify-between' mt={2}>
          <p className='span text-secondary'>
            Available{' '}
            <span className='text-primaryText'>
              {collateral.availableBalance}
            </span>{' '}
            USDC
          </p>
          <p
            className='span text-primary cursor-pointer'
            onClick={() => quickSwapAccount && setModalOpen(true)}
          >
            Deposit
          </p>
        </Box>
        <Box className='flex' gridGap={16} mt={2}>
          <p
            className={`span cursor-pointer ${
              order.order_type === 'LIMIT' ? '' : 'text-secondary'
            }`}
            onClick={() => setOrder({ ...order, order_type: 'LIMIT' })}
          >
            Limit
          </p>
          <p
            className={`span cursor-pointer ${
              order.order_type === 'MARKET' ? '' : 'text-secondary'
            }`}
            onClick={() => setOrder({ ...order, order_type: 'MARKET' })}
          >
            Market
          </p>
        </Box>
        {order.order_type === 'LIMIT' && (
          <Box className='leverageInputWrapper' mt={2}>
            <span className='text-secondary'>Price</span>
            <Box gridGap={5}>
              <input
                min={0}
                disabled={state.status !== AccountStatusEnum.EnableTrading}
                value={order.order_price}
                onChange={(e) =>
                  setOrder({ ...order, order_price: e.target.value })
                }
              />
              <span className='text-secondary'>USDC</span>
            </Box>
          </Box>
        )}
        <Box className='leverageInputWrapper' mt={2}>
          <span className='text-secondary'>Quantity</span>
          <Box gridGap={5}>
            <input
              min={0}
              value={order.order_quantity}
              onChange={(e) =>
                setOrder({ ...order, order_quantity: e.target.value })
              }
              disabled={state.status !== AccountStatusEnum.EnableTrading}
            />
            <span className='text-secondary'>
              {perpToken.split('_')[1] || 'ETH'}
            </span>
          </Box>
        </Box>
        <Box
          className='leverageSquareWrapper'
          style={{ cursor: 'pointer' }}
          my={2}
        >
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
            onClick={() => handleClick(0)}
          />
          <Box />
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
            onClick={() => handleClick(1)}
          />
          <Box />
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
            onClick={() => handleClick(2)}
          />
          <Box />
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
            onClick={() => handleClick(3)}
          />
          <Box />
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
            onClick={() => handleClick(4)}
          />
        </Box>
        <Box className='flex justify-between'>
          <p className='span text-success'>{clickedIndex * 25}%</p>
          <p className='span text-secondary'>
            Max buy{' '}
            <span className='text-success'>
              {' '}
              {(collateral.availableBalance * (clickedIndex * 25)) / 100}
            </span>
          </p>
        </Box>
        <Box className='leverageInputWrapper flex justify-between' my={2}>
          <span className='text-secondary'>Total</span>
          <span className='text-secondary'>
            {order.order_price * order.order_quantity} USDC
          </span>
        </Box>
        <Box className='border-top flex justify-between items-center'>
          <Box>
            <Switch defaultChecked /> Reduce Only
          </Box>
          <img src={Arrow} width='16' height='16' />
        </Box>
        {state.status !== AccountStatusEnum.EnableTrading ? (
          <Button
            onClick={() => {
              setAccountModalOpen(true);
            }}
            style={{
              width: 267,
              height: 40,
              margin: '16px 15px',
              padding: '11px 50px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Sign In
          </Button>
        ) : (
          <Button
            style={{
              width: 267,
              height: 40,
              margin: '16px 15px',
              padding: '11px 50px 12px',
              borderRadius: '8px',
              backgroundColor: order.side === 'SELL' ? 'red' : 'rgb(4, 109, 4)',
              cursor: 'pointer',
            }}
            onClick={async () => {
              const order1 = await submit();
              console.log(order1);
              await onSubmit(order1);
            }}
          >
            Create Order
          </Button>
        )}
      </Box>
      <AssetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        modalType={'deposit'}
      />
      <AccountModal
        open={accountModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};
