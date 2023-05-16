import React from 'react';
import { CustomModal } from 'components';
import { useTranslation } from 'next-i18next';

interface MeldModalProps {
  open: boolean;
  onClose: () => void;
}

const MeldModal: React.FC<MeldModalProps> = ({ open, onClose }) => {
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
          title='meld widget'
          allow='accelerometer; autoplay; camera; gyroscope; payment'
          height='600px'
          src={`${process.env.NEXT_PUBLIC_MELD_URL}/?publicKey=${process.env.NEXT_PUBLIC_MELD_KEY}`}
          width='100%'
        >
          <p>{t('notSupportIframe')}</p>
        </iframe>
      </div>
    </CustomModal>
  );
};

export default MeldModal;
