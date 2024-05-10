import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@orderly.network/hooks';

export const CancelTPSLOrderButton: React.FC<{
  order: any;
}> = ({ order }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [doDeleteOrder] = useMutation('/v1/algo/order', 'DELETE');

  return order ? (
    <Button
      disabled={loading}
      className='orderTableActionButton'
      onClick={async () => {
        try {
          setLoading(true);
          await doDeleteOrder(null, {
            order_id: order.algo_order_id,
            symbol: order.symbol,
          });
          setLoading(false);
        } catch (e) {
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
