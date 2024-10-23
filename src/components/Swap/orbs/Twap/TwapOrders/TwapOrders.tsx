import { TwapOrdersList } from './TwapOrdersList';
import { TwapSelectedOrder } from './TwapSelectedOrder';
import { Box } from '@material-ui/core';
import React, { useCallback, useState } from 'react';
import { useGrouppedTwapOrders } from '../hooks';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { Card } from '../Components/Components';
import { useTwapState } from 'state/swap/twap/hooks';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import SpinnerImage from 'assets/images/spinner.svg';
import CustomModal from 'components/CustomModal';

export const ShowOrdersButton = ({ onOpen }: { onOpen: () => void }) => {
  const { account } = useActiveWeb3React();
  const grouped = useGrouppedTwapOrders();
  const { updatingOrders } = useTwapState();
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
      {isLoading ? (
        <Box className='flex justify-center spinner'>
          <img
            src={SpinnerImage}
            alt='Spinner'
            style={{ width: 20, height: 20 }}
          />
        </Box>
      ) : (
        <ArrowForwardIcon />
      )}
    </Card>
  );
};

export function TwapOrders() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(
    undefined,
  );

  const onOpen = useCallback(() => {
    setIsOpen(true);
    setSelectedOrderId(undefined);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onOrderSelect = useCallback((orderId: number) => {
    setSelectedOrderId(orderId);
  }, []);

  const onResetSelectedOrder = useCallback(() => {
    setSelectedOrderId(undefined);
  }, []);

  return (
    <>
      <CustomModal
        open={isOpen}
        onClose={onClose}
        modalWrapper={'TwapOrdersModalWrapper'}
        hideBackdrop={true}
      >
        <TwapSelectedOrder
          selectedOrderId={selectedOrderId}
          onClose={onResetSelectedOrder}
        />
        <TwapOrdersList
          onClose={onClose}
          hide={!!selectedOrderId}
          onOrderSelect={onOrderSelect}
        />
      </CustomModal>

      <ShowOrdersButton onOpen={onOpen} />
    </>
  );
}
