import { Box, Divider } from '@mui/material';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'next-i18next';
import styles from 'styles/pages/Swap.module.scss';

export const SwapBuySellWidget: React.FC = () => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.NEXT_PUBLIC_SPRITZ_FINANCE_LINK;

  return (
    <Box className={`${styles.wrapper} ${styles.buySellWidgetContainer}`}>
      <Box mb={2} className='row'>
        <Box>
          <picture>
            <img
              src='/images/featured/BuyWithFiatNoPad.png'
              alt='buy with fiat'
            />
          </picture>
        </Box>
        <Box className='heading'>{t('buyOrSellCryptoFiat')}</Box>
        <Box sx={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <BuyFiatButton />
        </Box>
      </Box>
      <Divider />
      <Box mt={2} className='row'>
        <Box>
          <picture>
            <img src='/images/featured/BillPay.png' alt='bill pay' />
          </picture>
        </Box>
        <Box className='heading'>
          <Box>{t('payBills')}</Box>
          <Box className='sub-heading'>
            {t('poweredBy')}
            <picture>
              <img src='/images/SpritzIcon.png' alt='spritz finance' />
            </picture>
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
