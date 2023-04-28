import { Box, Button } from '@mui/material';
import {
  BinanceModal,
  BuyFiatModal,
  MoonpayModal,
  MeldModal,
} from 'components';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';

interface BuyFiatButtonProps {
  fullWidth?: boolean;
  textOnly?: boolean;
}

const BuyFiatButton: React.FC<BuyFiatButtonProps> = ({
  fullWidth,
  textOnly,
}) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [showMoonPayWidget, setShowMoonPayWidget] = useState(false);
  const [showBinanceWidget, setShowBinanceWidgetWidget] = useState(false);
  const [showMeldWidget, setShowMeldWidgetWidget] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      {showMoonPayWidget && (
        <MoonpayModal
          open={showMoonPayWidget}
          onClose={() => setShowMoonPayWidget(false)}
        />
      )}
      {showBinanceWidget && (
        <BinanceModal
          open={showBinanceWidget}
          onClose={() => setShowBinanceWidgetWidget(false)}
        />
      )}
      {showMeldWidget && (
        <MeldModal
          open={showMeldWidget}
          onClose={() => setShowMeldWidgetWidget(false)}
        />
      )}
      <BuyFiatModal
        open={openMenu}
        onClose={() => {
          setOpenMenu(false);
        }}
        buyMoonpay={() => {
          setShowMoonPayWidget(true);
          setOpenMenu(false);
        }}
        buyBinance={() => {
          setShowBinanceWidgetWidget(true);
          setOpenMenu(false);
        }}
        buyMeld={() => {
          setShowMeldWidgetWidget(true);
          setOpenMenu(false);
        }}
      />
      {textOnly ? (
        <Box
          className='cursor-pointer text-link text-primary'
          onClick={() => {
            setOpenMenu(true);
          }}
        >
          <small>{t('payWithFiatArrow')}</small>
        </Box>
      ) : (
        <Button
          className={`rounded ${fullWidth ? 'fullWidth' : ''} `}
          onClick={() => {
            setOpenMenu(true);
          }}
        >
          <small>{t('buyNow')}</small>
        </Button>
      )}
    </>
  );
};

export default BuyFiatButton;
