import { Box } from '@mui/material';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

export const MeldAdvertisement: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box className='flex'>
      <Box>
        <Image
          src='/assets/images/featured/BuywithFiatNoPad.svg'
          alt='buy with fiat'
          width={50}
          height={37}
        />
      </Box>
      <Box pl={1}>
        <Box className='text-white text-lg'>{t('buyOrSellCryptoFiat')}</Box>
        <Box className='flex items-center' gap='6px'>
          <small>{t('poweredBy')}</small>
          <Image
            src='/assets/images/meldIcon.png'
            alt='MELD'
            width={48}
            height={15}
          />
        </Box>
        <Box>
          <BuyFiatButton textOnly={true} />
        </Box>
      </Box>
    </Box>
  );
};
