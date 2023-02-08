import React from 'react';
import { Box, Button } from '@material-ui/core';
import FiatMask from 'assets/images/FiatMask.svg';
import BillPay from 'assets/images/featured/BillPay.png';
import SpritzIcon from 'assets/images/SpritzIcon.png';
import { useTranslation } from 'react-i18next';

const BuySpritzSection: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.REACT_APP_SPRITZ_FINANCE_LINK;

  return (
    <Box className='buyFiatContainer'>
      <img src={FiatMask} alt='Fiat Mask' />
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
        <img src={BillPay} alt='buy with crypto' />
      </Box>
      <Box className='poweredBySection'>
        {t('poweredBy')}
        <img className='spritz' src={SpritzIcon} alt='spritz finance' />
      </Box>
    </Box>
  );
};

export default BuySpritzSection;
