import React, { useCallback, useState } from 'react';
import { Currency } from '@uniswap/sdk';
import { Box } from '@material-ui/core';
import { CurrencySearchModal, CurrencyLogo } from 'components';
import 'components/styles/CurrencyInput.scss';
import { useTranslation } from 'react-i18next';

interface CurrencySelectProps {
  title?: string;
  handleCurrencySelect: (currency: Currency) => void;
  currency: Currency | undefined;
  otherCurrency?: Currency | undefined;
  id?: string;
  bgClass?: string;
  children?: any;
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({
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
            ? `currencyButton ${currency ? 'currencySelected' : 'noCurrency'}`
            : bgClass
        }
        onClick={handleOpenModal}
      >
        {currency ? (
          <Box className='flex items-center'>
            <CurrencyLogo currency={currency} size={'28px'} />
            <p className='token-symbol-container'>{currency?.symbol}</p>
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

export default CurrencySelect;
