import { Box, Divider } from '@material-ui/core';
import BillPay from 'assets/images/featured/BillPay.svg';
import BuyWithFiat from 'assets/images/featured/BuywithFiatNoPad.svg';
import SpritzIcon from 'assets/images/SpritzIcon.png';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './../../styles/swap.scss';

export const SwapBuySellWidget: React.FC = ({}) => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.REACT_APP_SPRITZ_FINANCE_LINK;

  return (
    <Box className='wrapper buySellWidgetContainer'>
      <Box className='row mb-1'>
        <Box>
          <img className='wallet' src={BuyWithFiat} alt='buy with fiat' />
        </Box>
        <Box className='heading'>{t('buyOrSellCryptoFiat')}</Box>
        <Box sx={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <BuyFiatButton />
        </Box>
      </Box>
      <Divider />
      <Box className='row mt-1'>
        <Box>
          <img className='bill' src={BillPay} alt='bill pay' />
        </Box>
        <Box className='heading'>
          <Box>{t('payBills')}</Box>
          <Box className='sub-heading'>
            {t('poweredBy')}
            <img className='spritz' src={SpritzIcon} alt='spritz finance' />
          </Box>
        </Box>
        <Box sx={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <a className='rounded button' target='blank' href={SPRITZ_LINK}>
            <small>{t('payWithCrypto')}</small>
          </a>
        </Box>
      </Box>
    </Box>
  );
};
