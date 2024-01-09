import { Box } from '@material-ui/core';
import BuyWithFiat from 'assets/images/featured/BuywithFiatNoPad.svg';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MeldIcon from 'assets/images/meldIcon.png';

export const MeldAdvertisement: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box className='flex'>
      <Box>
        <img className='wallet' src={BuyWithFiat} alt='buy with fiat' />
      </Box>
      <Box pl={1}>
        <Box className='text-white text-lg'>{t('buyOrSellCryptoFiat')}</Box>
        <Box className='flex items-center'>
          <small>{t('poweredBy')}</small>
          <img
            className='meldLogo'
            src={MeldIcon}
            alt='MELD'
            style={{ height: 15, marginLeft: 6 }}
          />
        </Box>
        <Box>
          <BuyFiatButton textOnly={true} />
        </Box>
      </Box>
    </Box>
  );
};
