import React, { useCallback, useState } from 'react';
import { Currency } from '@uniswap/sdk-core';
import { Box } from '@mui/material';
import { CurrencyLogo } from 'components';
import ZapCurrencySearchModal from './ZapCurrencySearchModal';
import styles from 'styles/components/ZapCurrencyInput.module.scss';
import { useTranslation } from 'next-i18next';
import { KeyboardArrowDown } from '@mui/icons-material';

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
            ? `${styles.zapCurrencyButton} ${
                currency ? styles.zapCurrencySelected : styles.zapNoCurrency
              }`
            : bgClass
        }
        onClick={handleOpenModal}
      >
        {currency ? (
          <Box className='flex items-center'>
            <CurrencyLogo currency={currency} size={'28px'} />
            <p>{currency?.symbol}</p>
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
