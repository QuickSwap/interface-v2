import React from 'react';
import { Box, Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/Home.module.scss';
import Image from 'next/image';

const BuySpritzSection: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.NEXT_PUBLIC_SPRITZ_FINANCE_LINK;

  return (
    <Box className={styles.buyFiatContainer}>
      <Image
        src='/assets/images/FiatMask.svg'
        alt='Fiat Mask'
        width={1248}
        height={338}
      />

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
        <Image
          src='/assets/images/featured/BillPay.png'
          alt='buy with crypto'
          width={129}
          height={100.52}
        />
      </Box>
      <Box className={styles.poweredBySection} gap='4px'>
        {t('poweredBy')}
        <Image
          src='/assets/images/SpritzIcon.png'
          alt='spritz finance'
          width={51}
          height={20}
        />
      </Box>
    </Box>
  );
};

export default BuySpritzSection;
