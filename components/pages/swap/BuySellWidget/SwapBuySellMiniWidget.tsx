import { Box, Divider } from '@mui/material';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

const SwapBuySellMiniWidget: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.REACT_APP_SPRITZ_FINANCE_LINK;
  return (
    <Box>
      <Box className='flex'>
        <Box className='p-1'>
          <Image
            className='wallet'
            src='/images/featured/BuywithFiatNoPad.svg'
            alt='buy with fiat'
          />
        </Box>
        <Box className='p-1'>
          <Box className='text-lg text-white'>Buy or sell crypto with fiat</Box>
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
            src='/images/featured/BillPay.svg'
            alt='bill pay'
          />
        </Box>
        <Box className='p-1'>
          <Box className='text-lg text-white'>Pay your bills with crypto</Box>
          <Box>
            <small>Powered by </small>
            <Image
              className='spritz'
              style={{ height: '20px' }}
              src='/images/SpritzIcon.png'
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
    </Box>
  );
};

export default SwapBuySellMiniWidget;
