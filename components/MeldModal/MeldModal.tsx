import React from 'react';
import { CustomModal } from 'components';
import { useTranslation } from 'next-i18next';
import { useActiveWeb3React } from 'hooks';
import styles from 'styles/components/MeldModal.module.scss';
import { Close } from '@mui/icons-material';

interface MeldModalProps {
  open: boolean;
  onClose: () => void;
}

const MeldModal: React.FC<MeldModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      background='#fff'
      overflow='hidden'
      modalWrapper={styles.meldModalWrapper}
    >
      <div className={styles.meldModalClose}>
        <Close className='cursor-pointer' onClick={onClose} />
      </div>
      <div className={styles.buyFiatContent}>
        <iframe
          title='meld widget'
          allow='accelerometer; autoplay; camera; gyroscope; payment'
          height='794px'
          src={`${process.env.NEXT_PUBLIC_MELD_URL}/?publicKey=${
            process.env.NEXT_PUBLIC_MELD_KEY
          }&destinationCurrencyCode=MATIC${
            account ? `&walletAddress=${account}` : ''
          }`}
          width='100%'
        >
          <p>{t('notSupportIframe')}</p>
        </iframe>
      </div>
    </CustomModal>
  );
};

export default MeldModal;
