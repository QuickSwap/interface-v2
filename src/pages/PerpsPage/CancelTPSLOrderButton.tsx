import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useOrderStream } from '@orderly.network/hooks';
import { AlgoOrderRootType } from '@orderly.network/types';

export const CancelTPSLOrderButton: React.FC<{
  order: any;
}> = ({ order }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [_, { cancelAllTPSLOrders }] = useOrderStream({
    includes: [AlgoOrderRootType.TP_SL, AlgoOrderRootType.POSITIONAL_TP_SL],
    symbol: order.symbol,
  });

  return order ? (
    <Button
      disabled={loading}
      className='orderTableActionButton'
      onClick={async () => {
        try {
          setLoading(true);
          await cancelAllTPSLOrders();
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
