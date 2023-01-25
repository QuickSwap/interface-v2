import { Box, Divider, Button } from 'theme/components';
import BillPay from 'assets/images/featured/BillPay.png';
import BuyWithFiat from 'assets/images/featured/BuyWithFiatNoPad.png';
import SpritzIcon from 'assets/images/SpritzIcon.png';
import { BuyFiatButton } from 'components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import 'pages/styles/swap.scss';

export const SwapBuySellWidget: React.FC = ({}) => {
  const { t } = useTranslation();
  const SPRITZ_LINK = process.env.REACT_APP_SPRITZ_FINANCE_LINK;

  return (
    <Box className='wrapper buySellWidgetContainer'>
      <Box margin='0 0 16px 0' className='row'>
        <Box>
          <img className='wallet' src={BuyWithFiat} alt='buy with fiat' />
        </Box>
        <Box className='heading'>{t('buyOrSellCryptoFiat')}</Box>
        <Box margin='auto 0'>
          <BuyFiatButton />
        </Box>
      </Box>
      <Divider />
      <Box margin='16px 0 0' className='row'>
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
        <Box margin='auto 0'>
          <a target='blank' href={SPRITZ_LINK}>
            <Button padding='0 10px' className='rounded'>
              <small>{t('payWithCrypto')}</small>
            </Button>
          </a>
        </Box>
      </Box>
    </Box>
  );
};
