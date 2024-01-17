import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { CustomModal } from 'components';
import { Box, Button, Checkbox } from '@mui/material';
import { Warning } from '@mui/icons-material';
import styles from 'styles/pages/Bonds.module.scss';

const BondTypeWarningModal = ({
  open,
  onDismiss,
  handlePurchase,
}: {
  open: boolean;
  onDismiss?: () => void;
  handlePurchase: () => void;
}) => {
  const [confirmBuy, setConfirmBuy] = useState(false);
  const { t } = useTranslation();

  const handleConfirm = () => {
    handlePurchase();
    onDismiss && onDismiss();
  };

  return (
    <CustomModal open={open} onClose={onDismiss}>
      <Box p={2} className={styles.bondWarningModalWrapper}>
        <Box className='flex items-center justify-center' gap='8px'>
          <Warning />
          <h4>{t('warning')}</h4>
          <Warning />
        </Box>
        <Box my='20px'>
          <p>{t('bondTypeWarningMessage')}</p>
        </Box>
        <Box
          className='cursor-pointer flex items-center'
          onClick={() => setConfirmBuy((prev) => !prev)}
          gap='8px'
          mb={2}
        >
          <Checkbox
            checked={confirmBuy}
            onChange={() => setConfirmBuy(!confirmBuy)}
          />
          <small>{t('bondTypeWarningUnderstand')}</small>
        </Box>
        <Button onClick={handleConfirm} fullWidth disabled={!confirmBuy}>
          {t('continue')}
        </Button>
      </Box>
    </CustomModal>
  );
};

export default React.memo(BondTypeWarningModal);
