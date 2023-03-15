import { Box, Divider } from '@material-ui/core';
import BillPay from 'assets/images/featured/BillPay.svg';
import BuyWithFiat from 'assets/images/featured/BuywithFiatNoPad.svg';
import SpritzIcon from 'assets/images/SpritzIcon.png';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SwapBuySellMiniWidget: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.REACT_APP_SPRITZ_FINANCE_LINK;
  return (
    <Box>
      <Box className='flex'>
        <Box className='p-1'>
          <img className='wallet' src={BuyWithFiat} alt='buy with fiat' />
        </Box>
        <Box className='p-1'>
          <Box className='text-white text-lg'>Buy or sell crypto with fiat</Box>
          <Box>
            <BuyFiatButton textOnly={true} />
          </Box>
        </Box>
      </Box>
      <Divider style={{ marginLeft: '-0.5rem', marginRight: '-0.5rem' }} />
      <Box className='flex'>
        <Box className='p-1'>
          <img className='bill' src={BillPay} alt='bill pay' />
        </Box>
        <Box className='p-1'>
          <Box className='text-white text-lg'>Pay your bills with crypto</Box>
          <Box>
            <small>Powered by </small>
            <img
              className='spritz'
              style={{ height: '20px' }}
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
    </Box>
  );
};

export default SwapBuySellMiniWidget;
