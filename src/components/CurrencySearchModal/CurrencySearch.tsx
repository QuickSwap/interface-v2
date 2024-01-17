import { ChainId, Currency, ETHER, Token } from '@uniswap/sdk';
import React, {
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { event } from 'nextjs-google-analytics';
import { Box, Divider } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { useAllTokens, useToken } from 'hooks/Tokens';
import { useSelectedListInfo } from 'state/lists/hooks';
import { selectList } from 'state/lists/actions';
import { GlobalConst } from 'constants/index';
import { Close, Search } from '@mui/icons-material';
import CommonBases from './CommonBases';
import CurrencyList from './CurrencyList';
import { AppDispatch } from 'state';
import { isAddress } from 'utils';
import { filterTokens } from 'utils/filtering';
import { useTokenComparator } from 'utils/sorting';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useCurrencyBalances } from 'state/wallet/hooks';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import styles from 'styles/components/CurrencySearchModal.module.scss';

interface CurrencySearchProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
  onChangeList: () => void;
}

const CurrencySearch: React.FC<CurrencySearchProps> = ({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
}) => {
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];
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

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  useEffect(() => {
    if (isAddressSearch) {
      event('Search by address', {
        category: 'Currency Select',
        label: isAddressSearch,
      });
    }
  }, [isAddressSearch]);

  const showETH: boolean = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    return s === '' || s === 'e' || s === 'et' || s === 'eth';
  }, [searchQuery]);

  const tokenComparator = useTokenComparator(false);

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : [];
    return filterTokens(Object.values(allTokens), searchQuery);
  }, [isAddressSearch, searchToken, allTokens, searchQuery]);

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken];
    const sorted = filteredTokens.sort(tokenComparator);
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((s) => s.length > 0);
    if (symbolMatch.length > 1) return sorted;

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(
        (token) => token.symbol?.toLowerCase() === symbolMatch[0],
      ),
      ...sorted.filter(
        (token) => token.symbol?.toLowerCase() !== symbolMatch[0],
      ),
    ];
  }, [filteredTokens, searchQuery, searchToken, tokenComparator]);

  const allCurrencies = showETH
    ? [nativeCurrency, ...filteredSortedTokens]
    : filteredSortedTokens;

  const currencyBalances = useCurrencyBalances(
    account || undefined,
    allCurrencies,
  );

  const tokenAddresses = allCurrencies
    .map((currency) => {
      const token = wrappedCurrency(currency, chainId);
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
        const s = searchQuery.toLowerCase().trim();
        if (s === 'eth') {
          handleCurrencySelect(nativeCurrency);
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() ===
              searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0]);
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, nativeCurrency, searchQuery],
  );

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();

  let selectedListInfo = useSelectedListInfo();

  if (selectedListInfo.current === null) {
    dispatch(selectList(GlobalConst.utils.DEFAULT_TOKEN_LIST_URL));
  }
  selectedListInfo = useSelectedListInfo();

  return (
    <Box className={styles.currencySearchWrapper}>
      <Box className={styles.currencySearchHeader}>
        <h6>{t('selectToken')}</h6>
        <Close onClick={onDismiss} />
      </Box>
      <Box className={styles.searchInputWrapper}>
        <Search />
        <input
          type='text'
          placeholder={t('tokenSearchPlaceholder') ?? undefined}
          value={searchQueryInput}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={(e) => setSearchQueryInput(e.target.value)}
          onKeyDown={handleEnter}
          autoFocus
        />
      </Box>
      {showCommonBases && (
        <CommonBases
          chainId={chainIdToUse}
          onSelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
        />
      )}

      <Divider />

      <Box flex={1}>
        <CurrencyList
          chainId={chainIdToUse}
          showETH={showETH}
          currencies={filteredSortedTokens}
          onCurrencySelect={handleCurrencySelect}
          otherCurrency={otherSelectedCurrency}
          selectedCurrency={selectedCurrency}
          balances={currencyBalances}
          usdPrices={usdPrices}
        />
      </Box>

      <Box className='currencySearchFooter' />
    </Box>
  );
};

export default CurrencySearch;
