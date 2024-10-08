import { Box, Typography } from '@material-ui/core';
import React, { useCallback } from 'react';
import { useGrouppedTwapOrders } from '../hooks';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { Card } from '../components';
import { useTwapOrdersContext } from './context';
import { useTwapState } from 'state/swap/twap/hooks';

export const ShowOrdersButton = () => {
  const grouped = useGrouppedTwapOrders();
  const { updatingOrders } = useTwapState();
  const { onOpen } = useTwapOrdersContext();

  const isLoading = updatingOrders || !grouped;

  const onClick = useCallback(() => {
    if (isLoading) return;
    onOpen();
  }, [isLoading, onOpen]);

  return (
    <Card onClick={onClick} className='TwapShowOrdersButton'>

        {isLoading ? (
          <Typography>Loading orders...</Typography>
        ) : (
          <Typography>{grouped?.open?.length || 0} Open Orders</Typography>
        )}{' '}
        <ArrowForwardIcon />
    </Card>
  );
};
