import React from 'react';
import { CustomModal } from 'components';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import 'components/styles/MeldModal.scss';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';

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
      modalWrapper='meldModalWrapper'
    >
      <div className='meldModalClose'>
        <CloseIcon className='cursor-pointer' onClick={onClose} />
      </div>
      <div className='buyFiatContent'>
        <iframe
          title='meld widget'
          allow='accelerometer; autoplay; camera; gyroscope; payment'
          height='794px'
          src={`${process.env.REACT_APP_MELD_URL}/?publicKey=${
            process.env.REACT_APP_MELD_KEY
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
