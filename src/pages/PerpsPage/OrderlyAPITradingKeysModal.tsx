import React from 'react';
import { CopyHelper, CustomModal } from 'components';
import { Box } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import './Layout.scss';
import { useAccount } from '@orderly.network/hooks';
import { useOrderlyAPIKey } from 'hooks/useOrderlyData';

interface OrderlyAPITradingKeysModalProps {
  open: boolean;
  onClose: () => void;
}
const OrderlyAPITradingKeysModal: React.FC<OrderlyAPITradingKeysModalProps> = ({
  open,
  onClose,
}) => {
  const { data: orderlyAPIKey } = useOrderlyAPIKey();
  const { account } = useAccount();
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 orderlyAPIKeyModalWrapper'
    >
      <Box padding={2}>
        <Box className='flex items-center justify-between' pb={2}>
          <h6>API Trading Keys</h6>
          <Close className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box my={2}>
          <p>
            Do not disclose your API keys to anyone to avoid asset losses in
            your wallet.
          </p>
        </Box>
        <Box mb={2}>
          <Box className='flex items-center' gridGap={4}>
            <p className='text-secondary'>Wallet address</p>
            <CopyHelper toCopy={account.address ?? ''} />
          </Box>
          <small className='p'>{account.address}</small>
        </Box>
        <Box mb={2}>
          <Box className='flex items-center' gridGap={4}>
            <p className='text-secondary'>Account</p>
            <CopyHelper toCopy={account.accountId ?? ''} />
          </Box>
          <small className='p'>{account.accountId}</small>
        </Box>
        <Box mb={2}>
          <Box className='flex items-center' gridGap={4}>
            <p className='text-secondary'>Orderly API Key</p>
            <CopyHelper toCopy={orderlyAPIKey?.key ?? ''} />
          </Box>
          <small className='p'>{orderlyAPIKey?.key}</small>
        </Box>
        <Box mb={2}>
          <Box className='flex items-center' gridGap={4}>
            <p className='text-secondary'>Orderly API Secret</p>
            <CopyHelper toCopy={orderlyAPIKey?.secret ?? ''} />
          </Box>
          <small className='p'>{orderlyAPIKey?.secret}</small>
        </Box>
      </Box>
    </CustomModal>
  );
};
export default OrderlyAPITradingKeysModal;
