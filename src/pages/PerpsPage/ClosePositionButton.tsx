import React, { useMemo, useState } from 'react';
import { useOrderEntry } from '@orderly.network/hooks';
import { Box, Button, Popover } from '@material-ui/core';
import { API, OrderSide, OrderType } from '@orderly.network/types';
import { useQuery } from '@tanstack/react-query';
import { CustomTooltip } from 'components';
import { Close } from '@material-ui/icons';
import { formatNumber, getPerpsSymbol } from 'utils';

export const ClosePositionButton: React.FC<{
  position: API.PositionExt;
  quantity: number;
  price?: number;
  afterClose?: () => void;
}> = ({ position, quantity, price, afterClose }) => {
  const order = {
    order_quantity: quantity,
    order_type: price ? OrderType.LIMIT : OrderType.MARKET,
    reduce_only: true,
    side: position.position_qty < 0 ? OrderSide.BUY : OrderSide.SELL,
    symbol: position.symbol,
    order_price: price,
  };
  const [loading, setLoading] = useState(false);
  const { onSubmit, helper } = useOrderEntry(order, { watchOrderbook: true });

  const { data: orderValidation } = useQuery({
    queryKey: ['orderly-order-validation', order],
    queryFn: async () => {
      const validation = await helper.validator(order);
      return validation;
    },
  });

  const disabledContent = useMemo(() => {
    if (orderValidation && Object.values(orderValidation).length > 0) {
      const validationErrors: any[] = Object.values(orderValidation);
      return validationErrors[0].message as string;
    }
    return;
  }, [orderValidation]);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  const token = position.symbol.split('_')?.[2];

  return disabledContent ? (
    <CustomTooltip
      title={
        disabledContent.substring(0, 1).toUpperCase() +
        disabledContent.substring(1)
      }
    >
      <Box className='orderTableActionButton' style={{ opacity: 0.6 }}>
        <span>Close</span>
      </Box>
    </CustomTooltip>
  ) : (
    <>
      <Button className='orderTableActionButton' onClick={handleClick}>
        Close
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box padding={2} maxWidth={360}>
          <Box
            className='flex items-center justify-between border-bottom'
            pb={1}
          >
            <h6>Market Close</h6>
            <Close
              className='cursor-pointer text-secondary'
              onClick={handleClose}
            />
          </Box>
          <Box pt={2}>
            <p className='font-bold'>
              You agree closing {formatNumber(quantity)}{' '}
              {position.symbol?.split('_')?.[1]} at {price ? 'limit' : 'market'}{' '}
              price
            </p>
            {price && (
              <Box className='border-top' mt={2} py={2} gridGap={12}>
                <p>{getPerpsSymbol(position.symbol)}</p>
                <Box className='flex' mt='12px' gridGap={32}>
                  <Box className='flex flex-col' gridGap={8}>
                    <p
                      className={
                        order.side === OrderSide.SELL
                          ? 'text-error'
                          : 'text-success'
                      }
                    >
                      {order.order_type} {order.side}
                    </p>
                  </Box>
                  <Box flex={1} className='flex flex-col' gridGap={8}>
                    <Box className='flex justify-between'>
                      <p>Qty.</p>
                      <p
                        className={
                          order.side === OrderSide.SELL
                            ? 'text-error'
                            : 'text-success'
                        }
                      >
                        {formatNumber(order.order_quantity)}
                      </p>
                    </Box>
                    <Box className='flex justify-between'>
                      <p>Price</p>
                      <p>
                        {formatNumber(order.order_price)} {token}
                      </p>
                    </Box>
                    <Box className='flex justify-between'>
                      <p>Total</p>
                      <p>
                        {formatNumber(
                          (order.order_price ?? 0) * order.order_quantity,
                        )}{' '}
                        {token}
                      </p>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
            <Box mt={2} className='flex' gridGap={12}>
              <Button
                className='perpsConfirmButton'
                disabled={loading}
                onClick={async () => {
                  try {
                    setLoading(true);
                    await onSubmit(order);
                    setLoading(false);
                    handleClose();
                    if (afterClose) {
                      afterClose();
                    }
                  } catch {
                    setLoading(false);
                  }
                }}
              >
                {loading ? 'Closing Position' : 'Confirm'}
              </Button>
              <Button className='perpsCancelButton' onClick={handleClose}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
};
