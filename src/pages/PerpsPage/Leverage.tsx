import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardArrowDown } from '@material-ui/icons';
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
import { AccountStatusEnum, OrderSide } from '@orderly.network/types';
import AccountModal from '../../components/AccountModal';
import { Box, Button, useMediaQuery, useTheme } from '@material-ui/core';
import { ToggleSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import { useWalletModalToggle } from 'state/application/hooks';

export const Leverage: React.FC<{ perpToken: string; orderQuantity: any }> = ({
  perpToken,
  orderQuantity,
}) => {
  const { t } = useTranslation();
  const [maxBuy, setMaxBuy] = useState<number>(0);
  const [data] = usePositionStream(perpToken);

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const [reducedOnly, setReducedOnly] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickSwapAccount, chainId]);

  useEffect(() => {
    if (state.status === AccountStatusEnum.EnableTrading) {
      setAccountModalOpen(false);
    }
  }, [state.status]);

  const handleClick = (index: number) => {
    setClickedIndex(index);
    setMaxBuy((collateral.availableBalance * (index * 25)) / 100);
  };

  const buttonDisabled = useMemo(() => {
    if (order.order_price * order.order_quantity > maxBuy) {
      return true;
    }
    return false;
  }, [maxBuy, order.order_price, order.order_quantity]);

  const buttonText = useMemo(() => {
    if (!quickSwapAccount) return t('connectWallet');
    if (state.status === AccountStatusEnum.EnableTrading)
      return t('createOrder');
    return t('signIn');
  }, [quickSwapAccount, state.status, t]);

  const toggleWalletModal = useWalletModalToggle();

  return (
    <>
      <Box padding='15px 10px'>
        {!isMobile && (
          <Box
            className='flex items-center justify-between border-bottom'
            gridGap={8}
            mb={2}
            pb={2}
          >
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
              <KeyboardArrowDown fontSize='small' className='text-secondary' />
            </Box>
          </Box>
        )}
        <Box pb={2} mb={2} className='border-bottom flex flex-col' gridGap={12}>
          <Box className='leverageGradient' />
          <Box className='flex justify-between' gridGap={8}>
            <Box>
              <p className='span text-secondary'>{t('accountLeverage')}</p>
              <p className='span'>
                {isNaN(state.leverage) ? 0 : state.leverage}
              </p>
            </Box>
            <Box textAlign='right'>
              <p className='span text-secondary'>{t('marginRatio')}</p>
              <p className='span'>{data.totalUnrealizedROI}%</p>
            </Box>
          </Box>
        </Box>
        <Box className='leverageTypesWrapper' gridGap={2}>
          <Box
            onClick={() => setOrder({ ...order, side: 'BUY' })}
            className={
              order.side === OrderSide.BUY ? 'bg-primary' : 'bg-palette'
            }
          >
            <span
              className={
                order.side === OrderSide.BUY ? 'text-white' : 'text-secondary'
              }
            >
              {t('buy')}/{t('long')}
            </span>
          </Box>
          <Box
            onClick={() => setOrder({ ...order, side: 'SELL' })}
            className={
              order.side === OrderSide.SELL ? 'bg-primary' : 'bg-palette'
            }
          >
            <span
              className={
                order.side === OrderSide.SELL ? 'text-white' : 'text-secondary'
              }
            >
              {t('sell')}/{t('short')}
            </span>
          </Box>
        </Box>
        <Box className='flex justify-between' mt={2}>
          <p className='span text-secondary'>
            {t('available')}{' '}
            <span className='text-primaryText'>
              {collateral.availableBalance}
            </span>{' '}
            {token?.symbol}
          </p>
          <p
            className='span text-primary cursor-pointer'
            onClick={() => quickSwapAccount && setModalOpen(true)}
          >
            {t('deposit')}
          </p>
        </Box>
        <Box className='flex' gridGap={16} mt={2}>
          <p
            className={`span cursor-pointer ${
              order.order_type === 'LIMIT' ? '' : 'text-secondary'
            }`}
            onClick={() => setOrder({ ...order, order_type: 'LIMIT' })}
          >
            {t('limit')}
          </p>
          <p
            className={`span cursor-pointer ${
              order.order_type === 'MARKET' ? '' : 'text-secondary'
            }`}
            onClick={() => setOrder({ ...order, order_type: 'MARKET' })}
          >
            {t('market')}
          </p>
        </Box>
        {order.order_type === 'LIMIT' && (
          <Box className='leverageInputWrapper' mt={2}>
            <span className='text-secondary'>{t('price')}</span>
            <Box gridGap={5}>
              <input
                min={0}
                disabled={state.status !== AccountStatusEnum.EnableTrading}
                value={order.order_price}
                onChange={(e) =>
                  setOrder({ ...order, order_price: e.target.value })
                }
              />
              <span className='text-secondary'>{token?.symbol}</span>
            </Box>
          </Box>
        )}
        <Box className='leverageInputWrapper' mt={2}>
          <span className='text-secondary'>{t('quantity')}</span>
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
        <Box className='leverageSquareWrapper' my={2}>
          {[0, 1, 2, 3, 4].map((item) => (
            <>
              <Box
                className={`leverageSquare
                  ${
                    clickedIndex > item
                      ? ' filledSquare'
                      : clickedIndex === item
                      ? ' activeSquare'
                      : ''
                  }`}
                onClick={() => handleClick(item)}
              />
              {item < 4 && (
                <Box
                  className={`leverageLine${
                    clickedIndex > item ? ' activeLine' : ''
                  }`}
                />
              )}
            </>
          ))}
        </Box>
        <Box className='flex justify-between'>
          <p className='span text-success'>{clickedIndex * 25}%</p>
          <p
            className='span text-secondary cursor-pointer'
            onClick={() => {
              setClickedIndex(4);
            }}
          >
            {t('maxBuy')} <span className='text-success'> {maxBuy}</span>
          </p>
        </Box>
        <Box className='leverageInputWrapper flex justify-between' my={2}>
          <span className='text-secondary'>{t('total')}</span>
          <span className='text-secondary'>
            {order.order_price * order.order_quantity} {token?.symbol}
          </span>
        </Box>
        <Box
          className='border-top flex justify-between items-center'
          pt={2}
          mb={2}
        >
          <Box className='flex items-center' gridGap={8}>
            <ToggleSwitch
              toggled={reducedOnly}
              onToggle={() => {
                setReducedOnly(!reducedOnly);
              }}
            />
            <span className='text-secondary'>{t('reduceOnly')}</span>
          </Box>
          <KeyboardArrowDown fontSize='small' className='text-secondary' />
        </Box>
        <Button
          className='leverageSubmitButton'
          disabled={buttonDisabled || collateral.availableBalance < 10}
          onClick={async () => {
            if (!quickSwapAccount) {
              toggleWalletModal();
            } else if (state.status === AccountStatusEnum.EnableTrading) {
              const order1 = await submit();
              console.log(order1);
              await onSubmit(order1);
            } else {
              setAccountModalOpen(true);
            }
          }}
        >
          {buttonText}
        </Button>
      </Box>
      <AssetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        modalType={'deposit'}
      />
      <AccountModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />
    </>
  );
};
