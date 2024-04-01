import React from 'react';
import { CustomModal } from 'components';
import { Box, Button } from '@material-ui/core';
import { OrderEntity, OrderSide } from '@orderly.network/types';
import { Close } from '@material-ui/icons';
import { formatNumber } from 'utils';
import './Layout.scss';

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
          <h6>{order.symbol}</h6>
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
              <Box className='flex items-center justify-between' mb={1}>
                <p className='text-secondary'>Price</p>
                <p>
                  {formatNumber(order.order_price)}{' '}
                  <span className='p text-secondary'>{tokenSymbol}</span>
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
            className='orderConfirmButton'
            onClick={async () => {
              await onSubmit(order);
            }}
          >
            Confirm
          </Button>
          <Button className='orderConfirmCancelButton' onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </CustomModal>
  );
};
export default OrderConfirmModal;
