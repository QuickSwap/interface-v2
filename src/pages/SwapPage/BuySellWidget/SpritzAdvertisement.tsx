import { Box } from '@material-ui/core';
import BillPay from 'assets/images/featured/BillPay.svg';
import SpritzIcon from 'assets/images/SpritzIcon.png';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const SpritzAdvertisement: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.REACT_APP_SPRITZ_FINANCE_LINK;
  return (
    <Box className='flex'>
      <Box>
        <img className='bill' src={BillPay} alt='bill pay' />
      </Box>
      <Box pl={1}>
        <Box className='text-white text-lg'>{t('payBills')}</Box>
        <Box className='flex items-center'>
          <small>{t('poweredBy')}</small>
          <img
            className='spritz'
            style={{ height: 20, marginLeft: 2 }}
            src={SpritzIcon}
            alt='spritz finance'
          />
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
