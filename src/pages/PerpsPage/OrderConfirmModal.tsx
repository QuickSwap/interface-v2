import React, { useState } from 'react';
import { CustomModal } from 'components';
import { Box, Button } from '@material-ui/core';
import { OrderEntity, OrderSide } from '@orderly.network/types';
import { Close } from '@material-ui/icons';
import { formatNumber, getPerpsSymbol } from 'utils';
import './Layout.scss';
import { useTranslation } from 'react-i18next';

interface OrderConfirmModalProps {
  open: boolean;
  onClose: () => void;
  order: OrderEntity;
  orderValue: number;
  tokenSymbol?: string;
  onSubmit: (order: OrderEntity) => Promise<any>;
}
const OrderConfirmModal: React.FC<OrderConfirmModalProps> = ({
  open,
  onClose,
  order,
  orderValue,
  tokenSymbol,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 assetModalWrapper'
    >
      <Box padding={2}>
        <Box className='flex items-center justify-between border-bottom' pb={2}>
          <h6>Confirm Order</h6>
          <Close className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box py={2}>
          <h6>{getPerpsSymbol(order.symbol)}</h6>
          <Box mt={2} className='flex'>
            <Box width='45%'>
              <p
                className={
                  order.side === OrderSide.BUY ? 'text-success' : 'text-error'
                }
              >
                {order.order_type} {order.side}
              </p>
            </Box>
            <Box width='55%'>
              <Box className='flex items-center justify-between' mb={1}>
                <p className='text-secondary'>Qty.</p>
                <p
                  className={
                    order.side === OrderSide.BUY ? 'text-success' : 'text-error'
                  }
                >
                  {formatNumber(order.order_quantity)}
                </p>
              </Box>
              {order.trigger_price && (
                <Box className='flex items-center justify-between' mb={1}>
                  <p className='text-secondary'>Trigger</p>
                  <p>
                    {formatNumber(order.trigger_price)}{' '}
                    <span className='p text-secondary'>{tokenSymbol}</span>
                  </p>
                </Box>
              )}
              <Box className='flex items-center justify-between' mb={1}>
                <p className='text-secondary'>Price</p>
                <p>
                  {order.order_price
                    ? formatNumber(order.order_price)
                    : 'Market'}{' '}
                  {order.order_price && (
                    <span className='p text-secondary'>{tokenSymbol}</span>
                  )}
                </p>
              </Box>
              <Box className='flex items-center justify-between' mb={1}>
                <p className='text-secondary'>Est. Total</p>
                <p>
                  {formatNumber(orderValue)}{' '}
                  <span className='p text-secondary'>{tokenSymbol}</span>
                </p>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box className='flex items-center' gridGap={12}>
          <Button
            className='perpsConfirmButton'
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                await onSubmit(order);
                setLoading(false);
                onClose();
              } catch {
                setLoading(false);
              }
            }}
          >
            {loading ? t('creatingOrder') : t('confirm')}
          </Button>
          <Button className='perpsCancelButton' onClick={onClose}>
            {t('cancel')}
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};
export default OrderConfirmModal;
