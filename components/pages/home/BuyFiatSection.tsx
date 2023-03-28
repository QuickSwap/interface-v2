import React from 'react';
import { Box } from '@mui/material';
import { BuyFiatButton } from 'components';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import styles from 'styles/pages/Home.module.scss';

const BuyFiatSection: React.FC = () => {
  const { t } = useTranslation();

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
          <h3>{t('buyCryptoFiat')}</h3>
          <p>{t('buyCryptoFiatDesc')}</p>
          <BuyFiatButton />
        </Box>
        <Image
          src='/assets/images/featured/BuyWithFiatNoPad.png'
          alt='buy with fiat'
          width={129}
          height={129}
        />
      </Box>
    </Box>
  );
};

export default BuyFiatSection;
