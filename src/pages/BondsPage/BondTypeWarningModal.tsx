import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomModal } from '~/components';
import { Box, Button, Checkbox } from '@material-ui/core';
import { Warning } from '@material-ui/icons';

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
      <Box p={2} className='bondWarningModalWrapper'>
        <Box className='flex items-center justify-center' gridGap={8}>
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
          gridGap={8}
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
