import React from 'react';
import { CustomModal } from 'components';

interface MoonpayModalProps {
  open: boolean;
  onClose: () => void;
}

const MoonpayModal: React.FC<MoonpayModalProps> = ({ open, onClose }) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      background='#fff'
      overflow='hidden'
    >
      <div style={{ height: '100%', width: '100%', overflowY: 'auto' }}>
        <iframe
          title='moonpay'
          allow='accelerometer; autoplay; camera; gyroscope; payment'
          frameBorder='0'
          height='600px'
          src={`https://buy.moonpay.com?apiKey=${process.env.REACT_APP_MOONPAY_KEY}`}
          width='100%'
        >
          <p>Your browser does not support iframes.</p>
        </iframe>
      </div>
    </CustomModal>
  );
};

export default MoonpayModal;
