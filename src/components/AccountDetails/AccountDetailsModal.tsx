import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { CustomModal } from 'components';
import AccountDetails from './AccountDetails';
import 'components/styles/WalletModal.scss';

interface AccountDetailsModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <CustomModal
      modalWrapper='walletModalWrapper'
      open={open}
      onClose={onClose}
    >
      <Box>
        <AccountDetails
          pendingTransactions={[]}
          confirmedTransactions={[]}
          close={onClose}
        />
      </Box>
    </CustomModal>
  );
};

export default AccountDetailsModal;
