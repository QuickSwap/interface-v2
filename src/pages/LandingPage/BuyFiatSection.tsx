import React from 'react';
import { Box } from '@material-ui/core';
import FiatMask from 'assets/images/FiatMask.svg';
import BuyWithFiat from 'assets/images/featured/BuywithFiat.svg';
import { BuyFiatButton } from 'components';
import { useTranslation } from 'react-i18next';

export const BuyFiatSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box className='buyFiatContainer'>
      <img src={FiatMask} alt='Fiat Mask' />
      <Box>
        <Box className='buyFiatInfo'>
          <img src={BuyWithFiat} alt='buy with fiat' />
          <Box>
            <h3>{t('buyCryptoFiat')}</h3>
            <p className='weight-600'>{t('buyCryptoFiatDesc')}</p>
          </Box>
        </Box>
        <Box className='buyFiatWrapper'>
          <BuyFiatButton fullWidth />
        </Box>
      </Box>
    </Box>
  );
};
