import { Box, Button, Checkbox } from '@material-ui/core';
import { CustomModal } from 'components';
import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Warning } from '@material-ui/icons';
import { formatNumber } from 'utils';
import { Bond } from 'types/bond';

const WarningModal = ({
  open,
  onDismiss,
  bond,
  handlePurchase,
}: {
  open: boolean;
  onDismiss?: () => void;
  bond: Bond;
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
          <p>
            <Trans
              i18nKey='bondBuyWarningMessage'
              components={{
                errSpan: <span className='p text-error' />,
                sSpan: <span className='p text-underline' />,
              }}
              values={{
                earnToken: bond?.earnToken?.symbol,
                bondDiscount: formatNumber(bond?.discount),
                bondPriceUSD: formatNumber(bond?.priceUsd),
                bondEarnTokenPrice: formatNumber(bond?.earnTokenPrice),
              }}
            />
          </p>
        </Box>
        <Box
          className='cursor-pointer flex items-center'
          gridGap={8}
          mb={2}
          onClick={() => setConfirmBuy((prev) => !prev)}
        >
          <Checkbox
            checked={confirmBuy}
            onChange={() => setConfirmBuy(!confirmBuy)}
          />
          <p>
            {t('bondBuyWarningUnderstand', {
              billToken: bond?.earnToken.symbol ?? '',
            })}
          </p>
        </Box>
        <Button fullWidth onClick={handleConfirm} disabled={!confirmBuy}>
          {t('continue')}
        </Button>
      </Box>
    </CustomModal>
  );
};

export default React.memo(WarningModal);
