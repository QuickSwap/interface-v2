import React, { useCallback, useState } from 'react';
import { Currency } from '@uniswap/sdk-core';
import { Box } from '@material-ui/core';
import { CurrencyLogo } from '~/components';
import ZapCurrencySearchModal from './ZapCurrencySearchModal';
import '~/components/styles/ZapCurrencyInput.scss';
import { useTranslation } from 'react-i18next';
import { KeyboardArrowDown } from '@material-ui/icons';

interface ZapCurrencySelectProps {
  title?: string;
  handleCurrencySelect: (currency: Currency) => void;
  currency: Currency | undefined;
  otherCurrency?: Currency | undefined;
  id?: string;
  bgClass?: string;
  children?: any;
}

const ZapCurrencySelect: React.FC<ZapCurrencySelectProps> = ({
  handleCurrencySelect,
  currency,
  otherCurrency,
  bgClass,
  children,
}) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  return (
    <Box>
      <Box
        className={
          !bgClass
            ? `zapCurrencyButton ${
                currency ? 'zapCurrencySelected' : 'zapNoCurrency'
              }`
            : bgClass
        }
        onClick={handleOpenModal}
      >
        {currency ? (
          <Box className='flex items-center'>
            <CurrencyLogo currency={currency} size={'28px'} />
            <p className='token-symbol-container'>{currency?.symbol}</p>
            <KeyboardArrowDown />
          </Box>
        ) : (
          <p>{t('selectToken')}</p>
        )}
        {children}
      </Box>
      {modalOpen && (
        <ZapCurrencySearchModal
          isOpen={modalOpen}
          onDismiss={() => {
            setModalOpen(false);
          }}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
        />
      )}
    </Box>
  );
};

export default ZapCurrencySelect;
