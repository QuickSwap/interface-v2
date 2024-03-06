import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isAddress } from '~/utils';
import CurrencyList from './CurrencyList';
import { Currency } from '@uniswap/sdk-core';
import { DualCurrencySelector } from '~/types/bond';
import { CustomModal, SearchInput } from '~/components';
import { Box } from '@material-ui/core';
import CloseIcon from '~/assets/images/CloseIcon.svg?react';

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
    (input: string) => {
      const checksummedInput = isAddress(input);
      handleSearchQuery(checksummedInput || input);
    },
    [handleSearchQuery],
  );

  return (
    <CustomModal
      onClose={onClose}
      open={open}
      modalWrapper='dualCurrencySearchModalWrapper'
    >
      <Box p={2}>
        <Box
          className='flex items-center justify-between border-bottom'
          pb={2}
          mb={2}
        >
          <p className='text-bold'>{t('tokens')}</p>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box margin='10px 0px 15px'>
          <SearchInput
            id='token-search-input'
            placeholder={t('nameOrAddress')}
            autoComplete='off'
            value={searchQuery}
            setValue={handleInput}
            icon='search'
          />
        </Box>
        <Box className='bg-grey29' borderRadius={16}>
          <CurrencyList
            currenciesList={currenciesList}
            onCurrencySelect={handleCurrencySelect}
          />
        </Box>
      </Box>
    </CustomModal>
  );
};

export default React.memo(DualCurrencySearchModal);
