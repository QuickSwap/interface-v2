import React, { useState } from 'react';
import { CustomModal } from 'components';
import { Box, Button } from '@material-ui/core';
import { API } from '@orderly.network/types';
import { Close } from '@material-ui/icons';
import { formatNumber, getPerpsSymbol } from 'utils';
import './Layout.scss';
import { useTranslation } from 'react-i18next';

interface TPSLOrderConfirmModalProps {
  open: boolean;
  onClose: () => void;
  order: Partial<
    import('@orderly.network/types').Optional<
      import('@orderly.network/types').BaseAlgoOrderEntity<
        import('@orderly.network/types').AlgoOrderRootType.TP_SL & {
          tp_pnl: number;
          tp_offset: number;
          tp_offset_percentage: number;
          sl_pnl: number;
          sl_offset: number;
          sl_offset_percentage: number;
        }
      >,
      'type' | 'side' | 'order_type' | 'trigger_price'
    >
  >;
  position: API.PositionExt;
  onSubmit: () => Promise<void>;
  onSuccess?: () => void;
}
const TPSLOrderConfirmModal: React.FC<TPSLOrderConfirmModalProps> = ({
  open,
  onClose,
  position,
  order,
  onSubmit,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const quoteToken = position.symbol.split('_')?.[2];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onSubmit();
      setLoading(false);
    } catch {
      setLoading(false);
    }
    onClose();
    if (onSuccess) {
      onSuccess();
    }
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
          <h6>{getPerpsSymbol(position.symbol)}</h6>
          <Box mt={2} className='flex'>
            <Box width='45%'>
              <p>
                Position {order.tp_trigger_price ? 'TP' : ''}
                {order.tp_trigger_price && order.sl_trigger_price ? '/' : ''}
                {order.sl_trigger_price ? 'SL' : ''}
              </p>
            </Box>
            <Box width='55%'>
              <Box className='flex items-center justify-between' mb={1}>
                <p className='text-secondary'>Qty.</p>
                <p>{formatNumber(order.quantity)}</p>
              </Box>
              {order.tp_trigger_price && (
                <Box className='flex items-center justify-between' mb={1}>
                  <p className='text-secondary'>TP Price</p>
                  <p>
                    <span className='p text-success'>
                      {formatNumber(order.tp_trigger_price)}
                    </span>{' '}
                    <span className='p text-secondary'>{quoteToken}</span>
                  </p>
                </Box>
              )}
              {order.sl_trigger_price && (
                <Box className='flex items-center justify-between' mb={1}>
                  <p className='text-secondary'>SL Price</p>
                  <p>
                    <span className='p text-error'>
                      {formatNumber(order.sl_trigger_price)}
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
