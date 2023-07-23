import { Box, Divider } from '@mui/material';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

const SwapBuySellMiniWidget: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.NEXT_PUBLIC_SPRITZ_FINANCE_LINK;
  return (
    <Box>
      <Box className='flex'>
        <Box className='p-1'>
          <Image
            className='wallet'
            src='/assets/images/featured/BuywithFiatNoPad.svg'
            alt='buy with fiat'
            width={50}
            height={37}
          />
        </Box>
        <Box className='p-1'>
          <Box className='text-white text-lg'>{t('buyOrSellCryptoFiat')}</Box>
          <Box className='flex items-center'>
            <small>{t('poweredBy')}</small>
            <Image
              className='meldLogo'
              src='/assets/images/meldIcon.png'
              alt='MELD'
              width={48}
              height={15}
              style={{ marginLeft: 6 }}
            />
          </Box>
          <Box>
            <BuyFiatButton textOnly={true} />
          </Box>
        </Box>
      </Box>
      <Divider style={{ marginLeft: '-0.5rem', marginRight: '-0.5rem' }} />
      <Box className='flex'>
        <Box className='p-1'>
          <Image
            className='bill'
            src='/assets/images/featured/BillPay.svg'
            alt='bill pay'
            width={50}
            height={39}
          />
        </Box>
        <Box className='p-1'>
          <Box className='text-white text-lg'>{t('payBills')}</Box>
          <Box className='flex items-center'>
            <small>{t('poweredBy')}</small>
            <Image
              className='spritz'
              style={{ height: 20, marginLeft: 2 }}
              src='/assets/images/SpritzIcon.png'
              alt='spritz finance'
              width={51}
              height={20}
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
    </Box>
  );
};

export default SwapBuySellMiniWidget;
