import React from 'react';
import { Box } from '@mui/material';
import { BuyFiatButton } from 'components';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/Home.module.scss';

const BuyFiatSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box className={styles.buyFiatContainer}>
      <picture>
        <img src='/assets/images/FiatMask.svg' alt='Fiat Mask' />
      </picture>

      <Box>
        <Box className={styles.buyFiatInfo}>
          <h3>{t('buyCryptoFiat')}</h3>
          <p>{t('buyCryptoFiatDesc')}</p>
          <BuyFiatButton />
        </Box>
        <picture>
          <img
            src='/assets/images/featured/BuyWithFiatNoPad.png'
            alt='buy with fiat'
          />
        </picture>
      </Box>
      <Box className={styles.poweredBySection}>
        {t('poweredBy')}
        <picture className={styles.meldLogo}>
          <img src='/assets/images/meldIcon.png' alt='MELD' />
        </picture>
      </Box>
    </Box>
  );
};

export default BuyFiatSection;
