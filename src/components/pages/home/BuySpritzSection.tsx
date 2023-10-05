import React from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/Home.module.scss';

const BuySpritzSection: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.NEXT_PUBLIC_SPRITZ_FINANCE_LINK;

  return (
    <Box className={styles.buyFiatContainer}>
      <picture>
        <img src='/assets/images/FiatMask.svg' alt='Fiat Mask' />
      </picture>

      <Box>
        <Box className={styles.buyFiatInfo}>
          <h3>{t('payBillWithCrypto')}</h3>
          <p>{t('payBillWithCryptoDesc')}</p>
          <Button
            className='rounded'
            onClick={() => window.open(SPRITZ_LINK, 'blank')}
          >
            <small>{t('payWithCrypto')}</small>
          </Button>
        </Box>
        <picture>
          <img
            src='/assets/images/featured/BillPay.png'
            alt='buy with crypto'
          />
        </picture>
      </Box>
      <Box className={styles.poweredBySection}>
        {t('poweredBy')}
        <picture className='spritz'>
          <img src='/assets/images/SpritzIcon.png' alt='spritz finance' />
        </picture>
      </Box>
    </Box>
  );
};

export default BuySpritzSection;
