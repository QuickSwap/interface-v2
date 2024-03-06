import React from 'react';
import { Box } from '@material-ui/core';
import FiatMask from '~/assets/images/FiatMask.svg';
import BuyWithFiat from '~/assets/images/featured/BuyWithFiatNoPad.png';
import { BuyFiatButton } from '~/components';
import { useTranslation } from 'react-i18next';
import MeldIcon from '~/assets/images/meldIcon.png';

const BuyFiatSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box className='buyFiatContainer'>
      <img src={FiatMask} alt='Fiat Mask' />
      <Box>
        <Box className='buyFiatInfo'>
          <h3>{t('buyCryptoFiat')}</h3>
          <p>{t('buyCryptoFiatDesc')}</p>
          <BuyFiatButton />
        </Box>
        <img src={BuyWithFiat} alt='buy with fiat' />
      </Box>
      <Box className='poweredBySection'>
        {t('poweredBy')}
        <img className='meldLogo' src={MeldIcon} alt='MELD' />
      </Box>
    </Box>
  );
};

export default BuyFiatSection;
