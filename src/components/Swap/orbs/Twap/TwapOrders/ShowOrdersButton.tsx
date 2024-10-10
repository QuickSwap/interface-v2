import { Box, Typography } from '@material-ui/core';
import React, { useCallback } from 'react';
import { useGrouppedTwapOrders } from '../hooks';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { Card } from '../Components/Components';
import { useTwapOrdersContext } from './context';
import { useTwapState } from 'state/swap/twap/hooks';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';

export const ShowOrdersButton = () => {
  const { account } = useActiveWeb3React();
  const grouped = useGrouppedTwapOrders();
  const { updatingOrders } = useTwapState();
  const { onOpen } = useTwapOrdersContext();
  const { t } = useTranslation();

  const isLoading = updatingOrders || !grouped;

  const onClick = useCallback(() => {
    if (isLoading) return;
    onOpen();
  }, [isLoading, onOpen]);

  if (!account) return null;

  return (
    <Card onClick={onClick} className='TwapShowOrdersButton'>
      {isLoading ? (
        <span>
          {t('loading')} {t('orders')}...
        </span>
      ) : (
        <span>
          {grouped?.open?.length || 0} {t('open')} {t('orders')}
        </span>
      )}{' '}
      <ArrowForwardIcon />
    </Card>
  );
};
