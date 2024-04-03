import React from 'react';
import { CustomModal } from 'components';
import '../styles/AccountModal.scss';

interface NotifyModalProps {
  open: boolean;
  onClose: () => void;
}
const NotifyModal: React.FC<NotifyModalProps> = ({ open, onClose }) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      modalWrapper='modalWrapperV3 assetModalWrapper'
    >
      <div
        style={{
          margin: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div>
          This Transaction may take 10-20 minutes to show up in your Leverage
          Wallet
        </div>
      </div>
    </CustomModal>
  );
};
export default NotifyModal;
