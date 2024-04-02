import React, { useMemo } from 'react';
import { useOrderEntry } from '@orderly.network/hooks';
import { Box, Button } from '@material-ui/core';
import { API, OrderSide, OrderType } from '@orderly.network/types';
import { useQuery } from '@tanstack/react-query';
import { CustomTooltip } from 'components';

export const ClosePositionButton: React.FC<{
  position: API.PositionExt;
  quantity: number;
  price?: number;
}> = ({ position, quantity, price }) => {
  const order = {
    order_quantity: quantity,
    order_type: price ? OrderType.LIMIT : OrderType.MARKET,
    reduce_only: true,
    side: position.position_qty < 0 ? OrderSide.BUY : OrderSide.SELL,
    symbol: position.symbol,
    order_price: price,
  };
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
    <Button
      className='orderTableActionButton'
      onClick={() => {
        onSubmit(order);
      }}
    >
      Close
    </Button>
  );
};
