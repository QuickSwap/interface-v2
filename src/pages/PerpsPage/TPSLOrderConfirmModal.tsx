import React, { useState } from 'react';
import { CustomModal } from 'components';
import { Box, Button } from '@material-ui/core';
import { API, OrderEntity } from '@orderly.network/types';
import { Close } from '@material-ui/icons';
import { formatNumber } from 'utils';
import './Layout.scss';
import { useTranslation } from 'react-i18next';
import { OrderParams } from '@orderly.network/hooks';

interface TPSLOrderConfirmModalProps {
  open: boolean;
  onClose: () => void;
  tpOrder?: OrderParams;
  slOrder?: OrderParams;
  position: API.PositionExt;
  onTPSubmit: (order: OrderEntity) => Promise<any>;
  onSLSubmit: (order: OrderEntity) => Promise<any>;
}
const TPSLOrderConfirmModal: React.FC<TPSLOrderConfirmModalProps> = ({
  open,
  onClose,
  position,
  tpOrder,
  slOrder,
  onTPSubmit,
  onSLSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const orderQuantity = (tpOrder ?? slOrder)?.order_quantity;
  const quoteToken = position.symbol.split('_')?.[2];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (tpOrder) {
        await onTPSubmit(tpOrder);
      }
      if (slOrder) {
        await onSLSubmit(slOrder);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
    onClose();
  };

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
          <h6>{position.symbol}</h6>
          <Box mt={2} className='flex'>
            <Box width='45%'>
              <p>
                Position {tpOrder ? 'TP' : ''}
                {tpOrder && slOrder ? '/' : ''}
                {slOrder ? 'SL' : ''}
              </p>
            </Box>
            <Box width='55%'>
              <Box className='flex items-center justify-between' mb={1}>
                <p className='text-secondary'>Qty.</p>
                <p>{formatNumber(orderQuantity)}</p>
              </Box>
              {tpOrder && (
                <Box className='flex items-center justify-between' mb={1}>
                  <p className='text-secondary'>TP Price</p>
                  <p>
                    <span className='p text-success'>
                      {formatNumber(tpOrder.trigger_price)}
                    </span>{' '}
                    <span className='p text-secondary'>{quoteToken}</span>
                  </p>
                </Box>
              )}
              {slOrder && (
                <Box className='flex items-center justify-between' mb={1}>
                  <p className='text-secondary'>SL Price</p>
                  <p>
                    <span className='p text-error'>
                      {formatNumber(slOrder.trigger_price)}
                    </span>{' '}
                    <span className='p text-secondary'>{quoteToken}</span>
                  </p>
                </Box>
              )}
              <Box className='flex items-center justify-between' mb={1}>
                <p className='text-secondary'>Price</p>
                <p>Market</p>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box className='flex items-center' gridGap={12}>
          <Button
            className='perpsConfirmButton'
            disabled={loading}
            onClick={handleConfirm}
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
export default TPSLOrderConfirmModal;
