import { Box, Button } from '@mui/material';
import { MeldModal } from 'components';
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
  const [showMeldWidget, setShowMeldWidgetWidget] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      {showMeldWidget && (
        <MeldModal
          open={showMeldWidget}
          onClose={() => setShowMeldWidgetWidget(false)}
        />
      )}
      {textOnly ? (
        <Box
          className='cursor-pointer text-link text-primary'
          onClick={() => {
            setShowMeldWidgetWidget(true);
          }}
        >
          <small>{t('payWithFiatArrow')}</small>
        </Box>
      ) : (
        <Button
          className={`rounded ${fullWidth ? 'fullWidth' : ''} `}
          onClick={() => {
            setShowMeldWidgetWidget(true);
          }}
        >
          <small>{t('buyNow')}</small>
        </Button>
      )}
    </>
  );
};

export default BuyFiatButton;
