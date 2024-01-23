import React, { useCallback, useState } from 'react';
import { Currency } from '@uniswap/sdk-core';
import { Box } from '@mui/material';
import { CurrencySearchModal, CurrencyLogo } from 'components';
import styles from 'styles/components/CurrencyInput.module.scss';
import { useTranslation } from 'next-i18next';

interface CurrencySelectProps {
  title?: string;
  handleCurrencySelect: (currency: Currency) => void;
  currency: Currency | undefined;
  otherCurrency?: Currency | undefined;
  id?: string;
  bgClass?: string;
  children?: any;
}

const V3CurrencySelect: React.FC<CurrencySelectProps> = ({
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
  }, [setModalOpen]);

  return (
    <Box>
      <Box
        className={
          !bgClass
            ? `${styles.currencyButton} ${
                currency ? styles.currencySelected : styles.noCurrency
              }`
            : bgClass
        }
        onClick={handleOpenModal}
      >
        {currency ? (
          <Box className='flex items-center' gap='4px'>
            <CurrencyLogo currency={currency} size={28} />
            <p>{currency?.symbol}</p>
          </Box>
        ) : (
          <p>{t('selectToken')}</p>
        )}
        {children}
      </Box>
      {modalOpen && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={() => {
            setModalOpen(false);
          }}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={currency}
          showCommonBases={true}
          otherSelectedCurrency={otherCurrency}
        />
      )}
    </Box>
  );
};

export default V3CurrencySelect;
