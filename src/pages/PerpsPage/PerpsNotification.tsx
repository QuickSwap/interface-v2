import React, { useEffect, useMemo, useState } from 'react';
import { useWS } from '@orderly.network/hooks';
import { Box, Snackbar } from '@material-ui/core';
import { Check, Close, Warning } from '@material-ui/icons';
import Loader from 'components/Loader';
import { formatNumber } from 'utils';

export const PerpsNotification: React.FC = () => {
  const ws = useWS();
  const [walletData, setWalletData] = useState<any>(undefined);
  const [orderData, setOrderData] = useState<any>(undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscript = ws.privateSubscribe(
      {
        id: 'executionreport',
        event: 'subscribe',
        topic: `executionreport`,
        ts: Date.now(),
      },
      {
        onMessage: (data: any) => {
          setWalletData(undefined);
          setOrderData(data);
          setOpen(true);
        },
      },
    );

    const unsubscribeWallet = ws.privateSubscribe(
      { id: 'wallet', event: 'subscribe', topic: 'wallet' },
      {
        onMessage: (data: any) => {
          setOrderData(undefined);
          setWalletData(data);
          setOpen(true);
        },
      },
    );

    return () => {
      unsubscript();
      unsubscribeWallet();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = useMemo(
    () => (
      <Box className='flex items-center' gridGap={6}>
        {walletData?.transStatus === 'PROCESSING' ||
        walletData?.transStatus === 'PENDING' ? (
          <>
            <Loader />
            <p>Processing...</p>
          </>
        ) : (
          <>
            {walletData?.transStatus === 'FAILED' ? (
              <Warning className='text-error' />
            ) : (
              <Check className='text-success' />
            )}
            <p>
              {walletData?.side ?? 'Order'}{' '}
              {walletData
                ? (walletData?.transStatus ?? '')
                    .substring(0, 1)
                    .toUpperCase() +
                  (walletData?.transStatus ?? '').substring(1).toLowerCase()
                : orderData?.status === 'NEW'
                ? 'Created'
                : (orderData?.status ?? '').substring(0, 1).toUpperCase() +
                  (orderData?.status ?? '').substring(1).toLowerCase()}
            </p>
          </>
        )}
      </Box>
    ),
    [walletData, orderData],
  );

  const content = useMemo(
    () => (
      <p>
        {walletData
          ? (walletData?.transStatus === 'PROCESSING' ||
            walletData?.transStatus === 'PENDING'
              ? (walletData?.side ?? '').substring(0, 1).toUpperCase() +
                (walletData?.side ?? '').substring(1).toLowerCase()
              : '') +
            ' ' +
            formatNumber(walletData?.amount) +
            ' ' +
            walletData?.token
          : orderData?.type +
            ' ' +
            orderData?.side +
            ' ' +
            formatNumber(orderData?.quantity) +
            ' ' +
            (orderData?.symbol ?? '').split('_')[1]}
      </p>
    ),
    [walletData, orderData],
  );

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <div className='perpsNotification'>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={5000}
        onClose={handleClose}
        message={
          <>
            <Box className='flex items-center justify-between'>
              {title}
              <Close
                className='text-secondary cursor-pointer'
                onClick={() => setOpen(false)}
              />
            </Box>
            <Box mt={1}>{content}</Box>
          </>
        }
        open={open}
      />
    </div>
  );
};
