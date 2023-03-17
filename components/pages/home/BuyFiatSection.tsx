import React from 'react';
import { Box } from '@mui/material';
import { BuyFiatButton } from 'components';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const BuyFiatSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box className='buyFiatContainer'>
      <Image src='/images/FiatMask.svg' alt='Fiat Mask' />
      <Box>
        <Box className='buyFiatInfo'>
          <h3>{t('buyCryptoFiat')}</h3>
          <p>{t('buyCryptoFiatDesc')}</p>
          <BuyFiatButton />
        </Box>
        <Image
          src='/images/featured/BuyWithFiatNoPad.png'
          alt='buy with fiat'
        />
      </Box>
    </Box>
  );
};

export default BuyFiatSection;
