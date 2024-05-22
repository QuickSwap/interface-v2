import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export const CancelOrderButton: React.FC<{
  order_id?: number;
  symbol?: string;
  cancelOrder: (order_id: number, symbol?: string) => Promise<any>;
}> = ({ order_id, symbol, cancelOrder }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  return order_id ? (
    <Button
      disabled={loading}
      className='orderTableActionButton'
      onClick={async () => {
        try {
          setLoading(true);
          await cancelOrder(order_id, symbol);
          setLoading(false);
        } catch {
          setLoading(false);
        }
      }}
    >
      {loading ? t('canceling') : t('cancel')}
    </Button>
  ) : (
    <></>
  );
};
