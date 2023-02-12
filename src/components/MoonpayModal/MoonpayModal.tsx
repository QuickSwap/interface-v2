import React from 'react';
import { CustomModal } from 'components';
import { useTranslation } from 'react-i18next';
import 'components/styles/BuyFiatContent.scss';

interface MoonpayModalProps {
  open: boolean;
  onClose: () => void;
}

const MoonpayModal: React.FC<MoonpayModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      background='#fff'
      overflow='hidden'
    >
      <div className='buyFiatContent'>
        <iframe
          title='moonpay'
          allow='accelerometer; autoplay; camera; gyroscope; payment'
          height='600px'
          src={`https://buy.moonpay.com?apiKey=${process.env.REACT_APP_MOONPAY_KEY}`}
          width='100%'
        >
          <p>{t('notSupportIframe')}</p>
        </iframe>
      </div>
    </CustomModal>
  );
};

export default MoonpayModal;
