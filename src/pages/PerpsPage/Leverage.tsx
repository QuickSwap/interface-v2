import React, { useEffect, useMemo, useState } from 'react';
import Arrow from '../../assets/images/downward.svg';
import { CropSquareOutlined } from '@material-ui/icons';
import { useActiveWeb3React } from '../../hooks';
import {
  useAccount,
  useChains,
  useCollateral,
  useDeposit,
  useOrderEntry,
} from '@orderly.network/hooks';
import AssetModal from '../../components/AssetModal';
import {
  AccountStatusEnum,
  OrderSide,
  OrderStatus,
  OrderType,
} from '@orderly.network/types';
import AccountModal from '../../components/AccountModal';
import { Simulate } from 'react-dom/test-utils';
import submit = Simulate.submit;
import { Box, Button, Switch } from '@material-ui/core';

export const Leverage: React.FC<{ perpToken: string; orderQuantity: any }> = ({
  perpToken,
  orderQuantity,
}) => {
  const [orderType, setOrderType] = useState<string | undefined>('limit');
  const { account: quickSwapAccount, library, chainId } = useActiveWeb3React();
  const [chains, { findByChainId }] = useChains('mainnet');

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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  const { onSubmit } = useOrderEntry(perpToken, OrderSide.BUY, false);
  const [modalOpen, setModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const collateral = useCollateral();
  const [order, setOrder] = useState<any>({
    order_price: '',
    order_quantity: '',
    order_type: 'LIMIT',
    side: 'BUY',
    order_symbol: perpToken,
  });
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
  return (
    <Box>
      <Box
        style={{
          width: 'fit-content',
          height: 'max-content',
          backgroundColor: '#12131a',
          border: '1px solid  #1b1e29',
        }}
      >
        {windowWidth > 768 && (
          <Box>
            <Box style={{ margin: '10px 15px' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  color: '#61657a',
                }}
              >
                Balance
              </p>
              <p
                style={{
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  color: '#61657a',
                }}
              >
                {deposit?.balance} {token?.symbol}
              </p>
            </Box>
            <Box style={{ marginRight: '15px' }}>
              <Button
                style={{
                  color: '#448aff',
                  borderColor: '#448aff',
                  cursor: 'pointer',
                }}
                disabled={!quickSwapAccount}
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                Manage
              </Button>
              <img
                src={Arrow}
                width='16'
                height='16'
                style={{ margin: '5px 0 5px 16px' }}
              />
            </Box>
          </Box>
        )}
        {windowWidth > 768 && (
          <div>
            <Box
              style={{
                width: 220,
                height: 0.5,
                backgroundColor: '#696C80',
                margin: '10px 15px',
              }}
            />

            <Box
              style={{
                width: 220,
                height: 8,
                borderRadius: '8px',
                backgroundImage:
                  'linear-gradient(to right, #24403a, #3f3c2f 48%, #402230)',
                margin: '0px 15px',
              }}
            />
            <Box>
              <Box style={{ margin: '10px 15px' }}>
                <p
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    fontWeight: '500',
                    color: '#61657a',
                  }}
                >
                  Account Leverage
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    fontWeight: '500',
                    color: '#61657a',
                  }}
                >
                  0.00x/-x
                </p>
              </Box>
              <Box style={{ margin: '10px 15px' }}>
                <p
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    fontWeight: '500',
                    color: '#61657a',
                  }}
                >
                  Margin Ratio
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    fontWeight: '500',
                    color: '#61657a',
                  }}
                >
                  100%
                </p>
              </Box>
            </Box>
            <Box
              style={{
                width: 220,
                height: 0.5,
                backgroundColor: '#696C80',
                margin: '10px 15px',
              }}
            />
          </div>
        )}
        <Box style={{ cursor: 'pointer' }}>
          <Box
            style={{
              width: 100,
              height: 36,
              padding: '0 43px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff',
              fontFamily: 'Inter',
              backgroundColor:
                order.side === 'BUY' ? 'rgb(4, 109, 4)' : '#1b1e29',
              fontWeight: 500,
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={() => setOrder({ ...order, side: 'BUY' })}
          >
            Buy/Long
          </Box>
          <Box
            style={{
              width: 100,
              height: 36,
              padding: '0 43px',
              borderRadius: '8px',
              backgroundColor: order.side === 'SELL' ? 'red' : '#1b1e29',
              fontSize: '12px',
              fontWeight: 500,
              color: '#fff',
              fontFamily: 'Inter',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={() => setOrder({ ...order, side: 'SELL' })}
          >
            Sell/Short
          </Box>
        </Box>
        <Box
          style={{
            margin: '16px 15px',
            fontWeight: 500,
            fontFamily: 'Inter',
            fontSize: '12px',
          }}
        >
          <p style={{ color: ' #61657a' }}>
            Available {collateral.availableBalance} USDC
          </p>
          <p
            style={{ color: '#448aff', cursor: 'pointer' }}
            onClick={() => quickSwapAccount && setModalOpen(true)}
          >
            Deposit
          </p>
        </Box>
        <Box
          style={{
            margin: '16px 15px',
            fontWeight: 500,
            fontFamily: 'Inter',
            fontSize: '12px',
          }}
        >
          <p
            onClick={() => setOrder({ ...order, order_type: 'LIMIT' })}
            style={{
              cursor: 'pointer',
              color: order.order_type === 'LIMIT' ? '#fff' : '#61657a',
            }}
          >
            Limit
          </p>
          <p
            onClick={() => setOrder({ ...order, order_type: 'MARKET' })}
            style={{
              color: order.order_type === 'MARKET' ? '#fff' : '#61657a',
              cursor: 'pointer',
            }}
          >
            Market
          </p>
        </Box>
        <Box
          style={{
            width: 220,
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
          <p>Price</p>
          <div>
            {order.order_type === 'LIMIT' ? (
              <input
                min={0}
                disabled={state.status !== AccountStatusEnum.EnableTrading}
                value={order.order_price}
                onChange={(e) =>
                  setOrder({ ...order, order_price: e.target.value })
                }
                style={{
                  width: 30,
                  marginRight: '2px',
                  color: '#696c80',
                  border: 'none',
                  outline: 'none',
                  appearance: 'none',
                  backgroundColor: 'transparent',
                }}
              />
            ) : (
              <p>Market</p>
            )}
            <p> USDC</p>
          </div>
        </Box>
        <Box
          style={{
            width: 220,
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
          <p>Quantity</p>
          <div>
            <input
              min={0}
              value={order.order_quantity}
              onChange={(e) =>
                setOrder({ ...order, order_quantity: e.target.value })
              }
              disabled={state.status !== AccountStatusEnum.EnableTrading}
              style={{
                width: 30,
                marginRight: '2px',
                color: '#696c80',
                border: 'none',
                outline: 'none',
                appearance: 'none',
                backgroundColor: 'transparent',
              }}
            />
            <p>{perpToken.split('_')[1] || 'ETH'}</p>
          </div>
        </Box>
        <Box style={{ margin: '10px 15px' }}>
          <p
            style={{
              fontSize: '12px',
              fontFamily: 'Inter',
              fontWeight: '500',
              color: '#61657a',
            }}
          >
            0%
          </p>
          <p
            style={{
              fontSize: '12px',
              fontFamily: 'Inter',
              fontWeight: '500',
              color: '#61657a',
            }}
          >
            Max buy 0.000
          </p>
        </Box>
        <Box
          style={{
            margin: '15px 15px',
            cursor: 'pointer',
          }}
        >
          <CropSquareOutlined
            fontSize='small'
            style={{ transform: 'rotate(45deg)' }}
          />
          <Box
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
          <Box
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
          <Box
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
          <Box
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
        </Box>
        <Box
          style={{
            width: 220,
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
          <p>Total</p>
          <p>USDC</p>
        </Box>
        <Box
          style={{
            width: 220,
            height: 0.5,
            backgroundColor: '#696C80',
            margin: '10px 15px',
          }}
        />
        <Box
          style={{
            margin: '10px 15px',
            fontWeight: 500,
            fontFamily: 'Inter',
            fontSize: '12px',
            borderRadius: '8px',
            color: '#61657a',
          }}
        >
          <p>
            <Box>
              <Switch defaultChecked /> Reduce Only
            </Box>
          </p>
          <img src={Arrow} width='16' height='16' />
        </Box>
        {state.status !== AccountStatusEnum.EnableTrading ? (
          <Button
            style={{
              width: 220,
              height: 40,
              margin: '16px 15px',
              padding: '11px 50px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgb(4, 109, 4)',
              cursor: 'pointer',
            }}
            onClick={() => {
              setAccountModalOpen(true);
            }}
          >
            Sign In
          </Button>
        ) : (
          <Button
            style={{
              width: 220,
              height: 40,
              margin: '16px 15px',
              padding: '11px 50px 12px',
              borderRadius: '8px',
              backgroundColor: order.side === 'SELL' ? 'red' : 'rgb(4, 109, 4)',
              cursor: 'pointer',
            }}
            onClick={async () => {
              console.log(order);
              await submit(order);
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
    </Box>
  );
};
