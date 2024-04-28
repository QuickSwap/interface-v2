import { Box } from '@material-ui/core';
import { MeldModal } from 'components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
          className='text-link text-primary cursor-pointer'
          onClick={() => {
            setShowMeldWidgetWidget(true);
          }}
        >
          <small>{t('payWithFiatArrow')}</small>
        </Box>
      ) : (
        <button
          // className={`rounded ${fullWidth ? 'fullWidth' : ''} `}
          className='transparentButton'
          onClick={() => {
            setShowMeldWidgetWidget(true);
          }}
        >
          <small>{t('buyNow')}</small>
        </button>
      )}
    </>
  );
};

export default BuyFiatButton;
