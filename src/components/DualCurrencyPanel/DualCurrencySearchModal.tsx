import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isAddress } from 'utils';
import CurrencyList from './CurrencyList';
import { Currency } from '@uniswap/sdk-core';
import { DualCurrencySelector } from 'types/bond';
import { CustomModal, SearchInput } from 'components';
import { Box } from '@material-ui/core';

interface CurrencySearchModalProps {
  open: boolean;
  onClose: () => void;
  onCurrencySelect: (currency: DualCurrencySelector, index: number) => void;
  inputCurrencies: Currency[];
  currenciesList: DualCurrencySelector[];
  searchQuery: string;
  handleSearchQuery: (val: string) => void;
}

const DualCurrencySearchModal: React.FC<CurrencySearchModalProps> = ({
  open,
  onClose,
  onCurrencySelect,
  currenciesList,
  searchQuery,
  handleSearchQuery,
}) => {
  // refs for fixed size lists
  const { t } = useTranslation();

  const handleCurrencySelect = useCallback(
    (currency: DualCurrencySelector, index: number) => {
      onClose();
      onCurrencySelect(currency, index);
      handleSearchQuery('');
    },
    [onClose, onCurrencySelect, handleSearchQuery],
  );

  const handleInput = useCallback(
    (event: any) => {
      const input = event.target.value;
      const checksummedInput = isAddress(input);
      handleSearchQuery(checksummedInput || input);
    },
    [handleSearchQuery],
  );

  const getCurrencyListRows = useCallback(() => {
    return (
      <CurrencyList
        currenciesList={currenciesList}
        onCurrencySelect={handleCurrencySelect}
      />
    );
  }, [currenciesList, handleCurrencySelect]);

  return (
    <CustomModal onClose={onClose} open={open}>
      <Box>
        <Box sx={{ flexDirection: 'column' }}>
          <Box sx={{ position: 'relative', margin: '10px 0px 15px 0px' }}>
            <SearchInput
              id='token-search-input'
              placeholder={t('Name or Address')}
              autoComplete='off'
              value={searchQuery}
              setValue={handleInput}
              icon='search'
            />
          </Box>
          {getCurrencyListRows()}
        </Box>
      </Box>
    </CustomModal>
  );
};

export default React.memo(DualCurrencySearchModal);
