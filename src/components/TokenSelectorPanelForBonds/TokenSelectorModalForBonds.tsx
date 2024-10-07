import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isAddress } from 'utils';
import CurrencyList from './CurrencyList';
import { Currency } from '@uniswap/sdk-core';
import { BondToken, DualCurrencySelector } from 'types/bond';
import { CustomModal, SearchInput } from 'components';
import { Box } from '@material-ui/core';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { ChainId } from '@uniswap/sdk';
import { zapInputTokens } from 'constants/index';

interface CurrencySearchModalProps {
  open: boolean;
  onClose: () => void;
  bondPrincipalToken?: BondToken;
  handleSetInputToken: (currency: string) => void;
  chainId: ChainId;
}

const TokenSelectorModalForBonds: React.FC<CurrencySearchModalProps> = ({
  open,
  onClose,
  bondPrincipalToken,
  handleSetInputToken,
  chainId,
}) => {
  // refs for fixed size lists
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const zapInputList = zapInputTokens[chainId];

  const inputTokenList: (BondToken | string)[] = useMemo(() => {
    const parsedList = zapInputList
      ?.filter((token) => {
        return !searchQuery
          ? true
          : token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .map((token) => {
        return token.address[chainId];
      }) as string[];
    if (bondPrincipalToken) return [bondPrincipalToken, 'ETH', ...parsedList];
    return ['ETH', ...parsedList];
  }, [bondPrincipalToken, chainId, searchQuery, zapInputList]);

  const handleCurrencySelect = useCallback(
    (currency: string) => {
      onClose();
      handleSetInputToken(currency);
      setSearchQuery('');
    },
    [onClose, handleSetInputToken, setSearchQuery],
  );

  const handleInput = useCallback(
    (event: any) => {
      const input = event.target.value;
      const checksummedInput = isAddress(input);
      setSearchQuery(checksummedInput || input);
    },
    [setSearchQuery],
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
            currenciesList={inputTokenList}
            onCurrencySelect={handleCurrencySelect}
            chainId={chainId}
          />
        </Box>
      </Box>
    </CustomModal>
  );
};

export default React.memo(TokenSelectorModalForBonds);
