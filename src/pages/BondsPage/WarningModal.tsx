import { Box, Button } from '@material-ui/core';
import { CustomModal } from 'components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Warning } from '@material-ui/icons';

const WarningModal = ({
  open,
  onDismiss,
  bond,
  handlePurchase,
}: {
  open: boolean;
  onDismiss?: () => void;
  bond: any;
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
      <Box className='flex items-center justify-center' mt='10px'>
        <Warning />
        <h1>{t('warning')}</h1>
        <Warning />
      </Box>
      <Box
        mt='30px'
        mb='30px'
        sx={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <p>
          The {bond?.earnToken?.symbol} you recieve from this Bond at a{' '}
          <span style={{ color: 'rgba(223, 65, 65, 1)' }}>
            {bond?.discount}%
          </span>{' '}
          discount rate is priced at{' '}
          <span style={{ textDecoration: 'underline' }}>${bond?.priceUsd}</span>
          , which is higher than the current market rate of{' '}
          <span style={{ textDecoration: 'underline' }}>
            ${bond?.earnTokenPrice?.toFixed(4)}{' '}
          </span>
        </p>
      </Box>
      <Box
        className='cursor-pointer flex items-center'
        mt='20px'
        onClick={() => setConfirmBuy((prev) => !prev)}
      >
        {/* <CheckBox
          checked={confirmBuy}
          onChange={() => setConfirmBuy(!confirmBuy)}
        /> */}
        <small>
          {t(
            'I understand that I am purchasing %billToken% at a price above the current market rate, and would like to continue.',
            { billToken: bond?.earnToken.symbol ?? '' },
          )}
        </small>
      </Box>
      <Button onClick={handleConfirm} disabled={!confirmBuy}>
        {t('continue')}
      </Button>
    </CustomModal>
  );
};

export default React.memo(WarningModal);
