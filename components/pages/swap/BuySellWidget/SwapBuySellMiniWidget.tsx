import { Box, Divider } from '@mui/material';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'next-i18next';

const SwapBuySellMiniWidget: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.NEXT_PUBLIC_SPRITZ_FINANCE_LINK;
  return (
    <Box>
      <Box className='flex'>
        <Box className='p-1'>
          <picture>
            <img
              src='/assets/images/featured/BuywithFiatNoPad.svg'
              alt='buy with fiat'
            />
          </picture>
        </Box>
        <Box className='p-1'>
          <Box className='text-white text-lg'>{t('buyOrSellCryptoFiat')}</Box>
          <Box className='flex items-center'>
            <small>{t('poweredBy')}</small>
            <picture>
              <img
                src='/assets/images/meldIcon.png'
                alt='MELD'
                style={{ marginLeft: 6, height: 15 }}
              />
            </picture>
          </Box>
          <Box>
            <BuyFiatButton textOnly={true} />
          </Box>
        </Box>
      </Box>
      <Divider style={{ marginLeft: '-0.5rem', marginRight: '-0.5rem' }} />
      <Box className='flex'>
        <Box className='p-1'>
          <picture>
            <img src='/assets/images/featured/BillPay.svg' alt='bill pay' />
          </picture>
        </Box>
        <Box className='p-1'>
          <Box className='text-white text-lg'>{t('payBills')}</Box>
          <Box className='flex items-center'>
            <small>{t('poweredBy')}</small>
            <picture>
              <img
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
    </Box>
  );
};

export default SwapBuySellMiniWidget;
