import React from 'react';
import { CustomModal } from 'components';
import { useTranslation } from 'next-i18next';
import styles from 'styles/components/BuyFiatContent.module.scss';

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
      <div className={styles.buyFiatContent}>
        <iframe
          title='moonpay'
          allow='accelerometer; autoplay; camera; gyroscope; payment'
          height='600px'
          src={`https://buy.moonpay.com?apiKey=${process.env.NEXT_PUBLIC_MOONPAY_KEY}`}
          width='100%'
        >
          <p>{t('notSupportIframe')}</p>
        </iframe>
      </div>
    </CustomModal>
  );
};

export default MoonpayModal;
