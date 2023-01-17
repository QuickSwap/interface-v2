import React, { useCallback, useState } from 'react';
import { Currency } from '@uniswap/sdk-core';
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
    <>
      <div
        className={
          !bgClass
            ? `currencyButton ${currency ? 'currencySelected' : 'noCurrency'}`
            : bgClass
        }
        onClick={handleOpenModal}
      >
        {currency ? (
          <div className='flex items-center'>
            <CurrencyLogo currency={currency} size={'28px'} />
            <p className='token-symbol-container'>{currency?.symbol}</p>
          </div>
        ) : (
          <p>{t('selectToken')}</p>
        )}
        {children}
      </div>
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
    </>
  );
};

export default V3CurrencySelect;
