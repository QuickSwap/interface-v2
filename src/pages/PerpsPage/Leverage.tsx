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
import {
  AccountStatusEnum,
  OrderEntity,
  OrderSide,
  OrderType,
} from '@orderly.network/types';
import AccountModal from '../../components/AccountModal';
import { Box, Button, useMediaQuery, useTheme } from '@material-ui/core';
import { ToggleSwitch } from 'components';
import { useTranslation } from 'react-i18next';
import { useWalletModalToggle } from 'state/application/hooks';
import { formatNumber } from 'utils';
import { formatDecimalInput } from 'utils/numbers';

type Inputs = {
  side: 'BUY' | 'SELL';
  order_type: 'MARKET' | 'LIMIT';
  order_price: string;
  order_quantity: string;
  order_symbol: string;
};

function getInput(data: Inputs): OrderEntity {
  return {
    symbol: data.order_symbol,
    side: data.side === 'BUY' ? OrderSide.BUY : OrderSide.SELL,
    order_type:
      data.order_type === 'MARKET' ? OrderType.MARKET : OrderType.LIMIT,
    order_price: data.order_price,
    order_quantity: data.order_quantity,
  };
}

export const Leverage: React.FC<{ perpToken: string; orderQuantity: any }> = ({
  perpToken,
  orderQuantity,
}) => {
  const { t } = useTranslation();
  const [data] = usePositionStream(perpToken);

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const [reducedOnly, setReducedOnly] = useState(false);
  const { account: quickSwapAccount, library, chainId } = useActiveWeb3React();
  const [chains, { findByChainId }] = useChains('mainnet');
  const [orderValidation, setOrderValidation] = useState<any>({});

  const { account, state } = useAccount();
  const token = useMemo(() => {
    return Array.isArray(chains) ? chains[0].token_infos[0] : undefined;
  }, [chains]);
  const quoteToken = perpToken.split('_')[1] ?? 'ETH';
  const [orderFilterLoading, setOrderFilterLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<any>(undefined);

  const deposit = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcToken: token?.symbol,
    srcChainId: Number(chainId),
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const collateral = useCollateral();
  const [order, setOrder] = useState<Inputs>({
    order_price: '0',
    order_quantity: '0',
    order_type: 'LIMIT',
    side: 'BUY',
    order_symbol: perpToken,
  });

  const { onSubmit, helper, maxQty, markPrice } = useOrderEntry(
    {
      symbol: perpToken,
      side: order.side as OrderSide,
      order_type: order.order_type as OrderType,
      order_price: order.order_price,
      order_quantity: order.order_quantity,
    },
    { watchOrderbook: true },
  );

  useEffect(() => {
    if (!process.env.REACT_APP_ORDERLY_API_URL) return;
    (async () => {
      try {
        setOrderFilterLoading(true);
        const res = await fetch(
          `${process.env.REACT_APP_ORDERLY_API_URL}/v1/public/info/${perpToken}`,
        );
        const data = await res.json();
        setOrderFilter(data.data);
        setOrderFilterLoading(false);
      } catch {
        setOrderFilterLoading(false);
      }
    })();
  }, [perpToken]);

  useEffect(() => {
    (async () => {
      const validation = await helper.validator(getInput(order));
      setOrderValidation(validation);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

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
    const value = formatDecimalInput(
      ((maxQty / 4) * index).toString(),
      Math.log10(1 / Number(orderFilter.base_tick)),
    );
    if (value !== null) {
      setOrder({ ...order, order_quantity: value });
    }
  };

  const orderValue =
    (order.order_type === 'LIMIT' ? Number(order.order_price) : markPrice) *
    Number(order.order_quantity);

  const buttonDisabled =
    state.status === AccountStatusEnum.EnableTrading &&
    (orderFilterLoading ||
      Object.values(orderValidation).length > 0 ||
      orderValue < 10);

  const buttonText = useMemo(() => {
    if (!quickSwapAccount) return t('connectWallet');
    if (state.status === AccountStatusEnum.EnableTrading) {
      if (Object.values(orderValidation).length > 0) {
        const validationErrors: any[] = Object.values(orderValidation);
        return validationErrors[0].message;
      } else if (orderValue < 10) {
        return 'The order value should be greater or equal to 10';
      }
      return t('createOrder');
    }
    return t('signIn');
  }, [orderValidation, orderValue, quickSwapAccount, state.status, t]);

  const toggleWalletModal = useWalletModalToggle();

  const quantityPercent = (Number(order.order_quantity) / maxQty) * 100;

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
              <p className='span text-secondary'>{t('totalBalance')}</p>
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
                {t('manage')}
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
                placeholder='0'
                disabled={state.status !== AccountStatusEnum.EnableTrading}
                value={order.order_price}
                onChange={(e) => {
                  const value = formatDecimalInput(
                    e.target.value,
                    orderFilter && orderFilter.quote_tick > 0
                      ? Math.log10(1 / Number(orderFilter.quote_tick))
                      : undefined,
                  );
                  if (value !== null) {
                    setOrder({
                      ...order,
                      order_price: value,
                    });
                  }
                }}
              />
              <span className='text-secondary'>{token?.symbol}</span>
            </Box>
          </Box>
        )}
        <Box className='leverageInputWrapper' mt={2}>
          <span className='text-secondary'>{t('quantity')}</span>
          <Box gridGap={5}>
            <input
              placeholder='0'
              value={order.order_quantity}
              onChange={(e) => {
                const value = formatDecimalInput(
                  e.target.value,
                  orderFilter && orderFilter.quote_tick > 0
                    ? Math.log10(1 / Number(orderFilter.base_tick))
                    : undefined,
                );
                if (value !== null) {
                  setOrder({
                    ...order,
                    order_quantity: value,
                  });
                }
              }}
              disabled={state.status !== AccountStatusEnum.EnableTrading}
            />
            <span className='text-secondary'>{quoteToken}</span>
          </Box>
        </Box>
        <Box className='leverageSquareWrapper' margin='16px 4px 16px 12px'>
          {[0, 1, 2, 3, 4].map((item) => (
            <Box
              key={item}
              className={`leverageSquare
                  ${quantityPercent > item * 25 ? ' filledSquare' : ''}`}
              onClick={() => handleClick(item)}
              left={`calc(${(item / 4) * 100}% - 8px)`}
            />
          ))}
          <Box
            className='leverageActiveWrapper'
            width={`${Math.min(quantityPercent, 100)}%`}
          >
            <Box />
          </Box>
        </Box>
        <Box className='flex justify-between'>
          <p
            className={`span ${
              order.side === 'BUY' ? 'text-success' : 'text-error'
            }`}
          >
            {formatNumber(quantityPercent)}%
          </p>
          <p
            className='span text-secondary cursor-pointer'
            onClick={() => {
              const value = formatDecimalInput(
                maxQty.toString(),
                Math.log10(1 / Number(orderFilter.base_tick)),
              );
              if (value !== null) {
                setOrder({
                  ...order,
                  order_quantity: value,
                });
              }
            }}
          >
            {order.side === 'BUY' ? t('maxBuy') : t('maxSell')}{' '}
            <span
              className={order.side === 'BUY' ? 'text-success' : 'text-error'}
            >
              {' '}
              {formatNumber(maxQty)}
            </span>
          </p>
        </Box>
        <Box className='leverageInputWrapper flex justify-between' my={2}>
          <span className='text-secondary'>{t('total')}</span>
          <span className='text-secondary'>
            {formatNumber(orderValue)} {token?.symbol}
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
          disabled={buttonDisabled}
          onClick={async () => {
            if (!quickSwapAccount) {
              toggleWalletModal();
            } else if (state.status === AccountStatusEnum.EnableTrading) {
              await onSubmit(getInput(order));
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
