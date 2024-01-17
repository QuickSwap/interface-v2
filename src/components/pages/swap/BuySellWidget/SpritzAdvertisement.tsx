import { Box } from '@mui/material';
import React from 'react';
import { useTranslation } from 'next-i18next';

export const SpritzAdvertisement: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.NEXT_PUBLIC_SPRITZ_FINANCE_LINK;
  return (
    <Box className='flex'>
      <Box>
        <picture>
          <img
            className='bill'
            src='/assets/images/featured/BillPay.svg'
            alt='bill pay'
          />
        </picture>
      </Box>
      <Box pl={1}>
        <Box className='text-white text-lg'>{t('payBills')}</Box>
        <Box className='flex items-center'>
          <small>{t('poweredBy')}</small>
          <picture>
            <img
              className='spritz'
              style={{ height: 20, marginLeft: 2 }}
              src='/assets/images/SpritzIcon.png'
              alt='spritz finance'
            />
          </picture>
        </Box>
        <Box>
          <a
            className='text-link text-primary'
            target='blank'
            href={SPRITZ_LINK}
          >
            <small>{t('payWithCrypto')}</small>
          </a>
        </Box>
      </Box>
    </Box>
  );
};
