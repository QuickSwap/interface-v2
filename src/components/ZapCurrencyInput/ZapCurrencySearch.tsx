import { ChainId } from '@uniswap/sdk';
import { Currency } from '@uniswap/sdk-core';
import React, {
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactGA from 'react-ga';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { useSelectedListInfo } from 'state/lists/hooks';
import { selectList } from 'state/lists/actions';
import { GlobalConst } from 'constants/index';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import ZapCurrencyList from './ZapCurrencyList';
import { AppDispatch } from 'state';
import { isAddress, toNativeCurrency } from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useCurrencyBalances } from 'state/wallet/v3/hooks';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { wrappedCurrencyV3 } from 'utils/wrappedCurrency';
import { useSetZapInputList, useZapInputList } from 'state/zap/hooks';
import { createFilterToken } from 'components/TokenSelectorPanelForBonds/filtering';
import { useAllTokens } from 'hooks/v3/Tokens';

interface CurrencySearchProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
}

const CurrencySearch: React.FC<CurrencySearchProps> = ({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  onDismiss,
  isOpen,
}) => {
  useSetZapInputList();
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const handleInput = useCallback((input: string) => {
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchQueryInput, setSearchQueryInput] = useDebouncedChangeHandler(
    searchQuery,
    handleInput,
  );

  const allTokens = useAllTokens();
  const rawZapInputList = useZapInputList();

  const zapInputList = useMemo(() => {
    const addresses: any = [];
    if (rawZapInputList) {
      const listByChain = rawZapInputList[chainId as ChainId];
      for (const res of Object?.values(listByChain ?? [])) {
        if (res.address[chainId as ChainId]) {
          addresses.push(res.address[chainId as ChainId].toLowerCase());
        }
      }
    }
    const filteredZapInputTokens = Object.entries(allTokens).filter((token) =>
      addresses.includes(token[0].toLowerCase()),
    );
    return Object.fromEntries(filteredZapInputTokens);
  }, [allTokens, chainId, rawZapInputList]);

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery);

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: 'Currency Select',
        action: 'Search by address',
        label: isAddressSearch,
      });
    }
  }, [isAddressSearch]);

  const allCurrencies = useMemo(() => {
    const filterToken = createFilterToken(searchQuery);
    const parsedList = Object.values(zapInputList).filter(filterToken);
    const nativeCurrency = toNativeCurrency(chainId);

    if (nativeCurrency) {
      return [nativeCurrency, ...parsedList];
    }
    return parsedList;
  }, [searchQuery, zapInputList, chainId]);

  const currencyBalances = useCurrencyBalances(
    account || undefined,
    allCurrencies,
  );

  const tokenAddresses = allCurrencies
    .map((currency) => {
      const token = wrappedCurrencyV3(currency, chainId);
      return token ? token.address.toLowerCase() : '';
    })
    .filter((address, ind, self) => self.indexOf(address) === ind);

  const { prices: usdPrices } = useUSDCPricesFromAddresses(tokenAddresses);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect],
  );

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('');
  }, [isOpen]);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (allCurrencies.length > 0) {
          if (
            allCurrencies[0].symbol?.toLowerCase() ===
              searchQuery.trim().toLowerCase() ||
            allCurrencies.length === 1
          ) {
            handleCurrencySelect(allCurrencies[0]);
          }
        }
      }
    },
    [allCurrencies, handleCurrencySelect, searchQuery],
  );

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();

  let selectedListInfo = useSelectedListInfo();

  if (selectedListInfo.current === null) {
    dispatch(selectList(GlobalConst.utils.DEFAULT_TOKEN_LIST_URL));
  }
  selectedListInfo = useSelectedListInfo();

  return (
    <Box className='zapCurrencySearchWrapper'>
      <Box className='zapCurrencySearchHeader'>
        <h6>{t('tokens')}</h6>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box className='zapSearchInputWrapper'>
        <SearchIcon />
        <input
          type='text'
          placeholder={t('tokenSearchPlaceholder')}
          value={searchQueryInput}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={(e) => setSearchQueryInput(e.target.value)}
          onKeyDown={handleEnter}
          autoFocus
        />
      </Box>

      <Box flex={1} className='bg-grey29' borderRadius={16} mt={2}>
        <ZapCurrencyList
          chainId={chainIdToUse}
          currencies={allCurrencies}
          onCurrencySelect={handleCurrencySelect}
          otherCurrency={otherSelectedCurrency}
          selectedCurrency={selectedCurrency}
          balances={currencyBalances}
          usdPrices={usdPrices}
        />
      </Box>
    </Box>
  );
};

export default CurrencySearch;
