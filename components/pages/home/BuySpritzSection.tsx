import React from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const BuySpritzSection: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.REACT_APP_SPRITZ_FINANCE_LINK;

  return (
    <Box className='buyFiatContainer'>
      <Image src='/assets/images/FiatMask.svg' alt='Fiat Mask' fill />
      <Box>
        <Box className='buyFiatInfo'>
          <h3>{t('payBillWithCrypto')}</h3>
          <p>{t('payBillWithCryptoDesc')}</p>
          <Button
            className='rounded'
            onClick={() => window.open(SPRITZ_LINK, 'blank')}
          >
            <small>{t('payWithCrypto')}</small>
          </Button>
        </Box>
        <Image
          src='/assets/images/featured/BillPay.png'
          alt='buy with crypto'
          fill
        />
      </Box>
      <Box className='poweredBySection'>
        {t('poweredBy')}
        <Image
          className='spritz'
          src='/assets/images/SpritzIcon.png'
          alt='spritz finance'
          fill
        />
      </Box>
    </Box>
  );
};

export default BuySpritzSection;
