import { Box, Divider } from '@mui/material';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from 'styles/pages/Swap.module.scss';
import Image from 'next/image';

export const SwapBuySellWidget: React.FC = ({}) => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.REACT_APP_SPRITZ_FINANCE_LINK;

  return (
    <Box className={`${styles.wrapper} ${styles.buySellWidgetContainer}`}>
      <Box mb={2} className='row'>
        <Box>
          <Image
            className='wallet'
            src='/images/featured/BuyWithFiatNoPad.png'
            alt='buy with fiat'
          />
        </Box>
        <Box className='heading'>{t('buyOrSellCryptoFiat')}</Box>
        <Box sx={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <BuyFiatButton />
        </Box>
      </Box>
      <Divider />
      <Box mt={2} className='row'>
        <Box>
          <Image
            className='bill'
            src='/images/featured/BillPay.png'
            alt='bill pay'
          />
        </Box>
        <Box className='heading'>
          <Box>{t('payBills')}</Box>
          <Box className='sub-heading'>
            {t('poweredBy')}
            <Image
              className='spritz'
              src='/images/SpritzIcon.png'
              alt='spritz finance'
            />
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
