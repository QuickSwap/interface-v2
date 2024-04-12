import React from 'react';
import { CustomModal } from 'components';
import { Box } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import './Layout.scss';
import { useTranslation } from 'react-i18next';
import { useAccountInfo } from '@orderly.network/hooks';

interface AccountManageModalProps {
  open: boolean;
  onClose: () => void;
}
const AccountManageModal: React.FC<AccountManageModalProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const accountInfo = useAccountInfo();
  return (
    <CustomModal open={open} onClose={onClose} modalWrapper='modalWrapperV3'>
      <Box padding={2}>
        <Box className='flex items-center justify-between border-bottom' pb={2}>
          <h6>Manage your account</h6>
          <Close className='cursor-pointer' onClick={onClose} />
        </Box>
      </Box>
    </CustomModal>
  );
};
export default AccountManageModal;
