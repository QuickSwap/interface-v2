import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomModal } from 'components';
import { Box, Button } from '@material-ui/core';

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
      <Box className='flex items-center justify-center' mt='10px'>
        <h1>
          {/* <Svg icon='error' width='25px' color='error' /> */}
          <span>{t('warning')}</span>
          {/* <Svg icon='error' width='25px' color='error' /> */}
        </h1>
      </Box>
      <Box
        mt='30px'
        mb='30px'
        sx={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ flexDirection: 'column' }}>
          <p>
            This is a pre-sale of the ABOND CEX Fund Bond. By purchasing now,
            you&apos;ll receive temporary ACF tokens representing your purchase.
            You&apos;ll need to keep this new token, which you&apos;ll be able
            to exchange for your actual ABOND Bond starting on December 14th.
          </p>
        </Box>
      </Box>
      <Box
        className='cursor-pointer flex items-center'
        onClick={() => setConfirmBuy((prev) => !prev)}
        mt='20px'
      >
        {/* <CheckBox
          checked={confirmBuy}
          onChange={() => setConfirmBuy(!confirmBuy)}
        /> */}
        <small>
          I understand that I am purchasing an ABOND CEX Fund Bond early and
          will receive ACF tokens until December 14th, when the actual ABOND
          Bonds will become redeemable
        </small>
      </Box>
      <Button onClick={handleConfirm} disabled={!confirmBuy}>
        {t('continue')}
      </Button>
    </CustomModal>
  );
};

export default React.memo(BondTypeWarningModal);
