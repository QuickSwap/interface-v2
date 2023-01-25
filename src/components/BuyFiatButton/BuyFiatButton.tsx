import { Button } from 'theme/components';
import { BinanceModal, BuyFiatModal, MoonpayModal } from 'components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BuyFiatButtonProps {
  fullWidth?: boolean;
}

const BuyFiatButton: React.FC<BuyFiatButtonProps> = ({ fullWidth }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [showMoonPayWidget, setShowMoonPayWidget] = useState(false);
  const [showBinanceWidget, setShowBinanceWidgetWidget] = useState(false);
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
      />
      <Button
        className={`rounded ${fullWidth ? 'fullWidth' : ''} `}
        padding='0 10px'
        onClick={() => {
          setOpenMenu(true);
        }}
      >
        <small>{t('buywithFiat')}</small>
      </Button>
    </>
  );
};

export default BuyFiatButton;
