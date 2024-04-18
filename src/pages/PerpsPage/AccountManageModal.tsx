import React, { useState } from 'react';
import { CustomModal } from 'components';
import { Box } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import './Layout.scss';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import AccountManageModalMyAccount from './AccountManageModalMyAccount';
import AccountManageModalAPI from './AccountManageModalAPI';
import AccountManageModalSettings from './AccountManageSettings';
import AccountManageModalLiquidations from './AccountManageModalLiquidations';

interface AccountManageModalProps {
  open: boolean;
  onClose: () => void;
}
const AccountManageModal: React.FC<AccountManageModalProps> = ({
  open,
  onClose,
}) => {
  const [tab, setTab] = useState('myAccount');
  const tabs = [
    {
      id: 'myAccount',
      text: 'My Account',
    },
    {
      id: 'liquidations',
      text: 'Liquidations',
    },
    {
      id: 'api',
      text: 'API',
    },
    {
      id: 'settings',
      text: 'Settings',
    },
  ];

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='accountManageModalWrapper'
    >
      <Box padding={2}>
        <Box className='flex items-center justify-between' pb={2}>
          <h6>Manage your account</h6>
          <Close className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box mb={2} className='border-bottom'>
          <CustomTabSwitch
            items={tabs}
            value={tab}
            handleTabChange={setTab}
            height={45}
          />
        </Box>
        {tab === 'myAccount' && <AccountManageModalMyAccount />}
        {tab === 'liquidations' && <AccountManageModalLiquidations />}
        {tab === 'api' && <AccountManageModalAPI />}
        {tab === 'settings' && <AccountManageModalSettings />}
      </Box>
    </CustomModal>
  );
};
export default AccountManageModal;
