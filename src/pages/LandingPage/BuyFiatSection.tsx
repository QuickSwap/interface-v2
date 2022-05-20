import React, { useState } from 'react';
import { Button, Box } from '@material-ui/core';
import FiatMask from 'assets/images/FiatMask.svg';
import BuyWithFiat from 'assets/images/featured/BuywithFiat.svg';
import { BuyFiatModal, MoonpayModal } from 'components';

export const BuyFiatSection: React.FC = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [showMoonPayWidget, setShowMoonPayWidget] = useState(false);

  return (
    <Box className='buyFiatContainer'>
      {showMoonPayWidget && (
        <MoonpayModal
          open={showMoonPayWidget}
          onClose={() => setShowMoonPayWidget(false)}
        />
      )}
      {openMenu && (
        <BuyFiatModal
          open={openMenu}
          onClose={() => setOpenMenu(false)}
          buyMoonpay={() => {
            setShowMoonPayWidget(true);
            setOpenMenu(false);
          }}
        />
      )}
      <img src={FiatMask} alt='Fiat Mask' />
      <Box>
        <Box className='buyFiatInfo'>
          <img src={BuyWithFiat} alt='buy with fiat' />
          <Box>
            <h3>Buy crypto with Fiat</h3>
            <p className='weight-600'>
              Simple way to buy or sell crypto with a credit card, bank transfer
              and more
            </p>
          </Box>
        </Box>
        <Box className='buyFiatWrapper'>
          <Button
            fullWidth
            onClick={() => {
              setOpenMenu(true);
            }}
          >
            Buy Now
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
