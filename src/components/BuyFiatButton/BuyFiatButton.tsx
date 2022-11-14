import { Button } from '@material-ui/core';
import {
  BinanceModal,
  BuyFiatModal,
  MoonpayModal,
  BuyWithCoinbaseModal,
} from 'components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BuyFiatButtonProps {
  fullWidth?: boolean;
}

const BuyFiatButton: React.FC<BuyFiatButtonProps> = ({ fullWidth }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [showMoonPayWidget, setShowMoonPayWidget] = useState(false);
  const [showBinanceWidget, setShowBinanceWidgetWidget] = useState(false);
  const [showCoinbaseWidget, setShowCoinbaseWidgetWidget] = useState(false);
  const { t } = useTranslation();

  return (
    <Button
      className={`rounded ${fullWidth ? 'fullWidth' : ''} `}
      onClick={() => {
        setOpenMenu(true);
      }}
    >
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
      {showCoinbaseWidget && (
        <BuyWithCoinbaseModal
          open={showCoinbaseWidget}
          onClose={() => setShowCoinbaseWidgetWidget(false)}
        />
      )}
      {openMenu && (
        <BuyFiatModal
          open={openMenu}
          onClose={() => {
            setTimeout(() => {
              setOpenMenu(false);
            }, 10);
          }}
          buyMoonpay={() => {
            setShowMoonPayWidget(true);
            setOpenMenu(false);
          }}
          buyBinance={() => {
            setShowBinanceWidgetWidget(true);
            setOpenMenu(false);
          }}
          buyWithCoinbase={() => {
            setShowCoinbaseWidgetWidget(true);
            setOpenMenu(false);
          }}
        />
      )}
      <small>{t('buyNow')}</small>
    </Button>
  );
};

export default BuyFiatButton;
