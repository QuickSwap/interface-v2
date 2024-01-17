import { Box } from '@mui/material';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'next-i18next';

export const MeldAdvertisement: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box className='flex'>
      <Box>
        <picture>
          <img
            className='wallet'
            src='/assets/images/featured/BuywithFiatNoPad.svg'
            alt='buy with fiat'
          />
        </picture>
      </Box>
      <Box pl={1}>
        <Box className='text-white text-lg'>{t('buyOrSellCryptoFiat')}</Box>
        <Box className='flex items-center'>
          <small>{t('poweredBy')}</small>
          <picture>
            <img
              className='meldLogo'
              src='/assets/images/meldIcon.png'
              alt='MELD'
              style={{ height: 15, marginLeft: 6 }}
            />
          </picture>
        </Box>
        <Box>
          <BuyFiatButton textOnly={true} />
        </Box>
      </Box>
    </Box>
  );
};
