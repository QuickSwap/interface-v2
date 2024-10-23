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
import ReactGA from 'react-ga';
import { Box, Divider } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import Fire from 'assets/images/fire.svg';
import { useAllTokens, useToken, useInActiveTokens } from 'hooks/Tokens';
import {
  WrappedTokenInfo,
  useInactiveTokenList,
  useSelectedListInfo,
} from 'state/lists/hooks';
import { selectList } from 'state/lists/actions';
import { GlobalConst } from 'constants/index';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import CommonBases from './CommonBases';
import CurrencyList from './CurrencyList';
import { AppDispatch } from 'state';
import { formatNumber, isAddress } from 'utils';
import { filterTokens } from 'utils/filtering';
import { useTokenComparator } from 'utils/sorting';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useCurrencyBalances } from 'state/wallet/hooks';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import { useLocalStorage } from '@orderly.network/hooks';
import { useUserAddedTokens } from 'state/user/hooks';

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
  const userAddedTokens = useUserAddedTokens();

  const [favoriteCurrencies, setFavoriteCurrencies] = useLocalStorage<
    Currency[]
  >('favoriteCurrencies', []);

  // const [favoriteCurrencies, setFavoriteCurrencies] = useState<Currency[]>([]);
  const handleChangeFavorite = (currency: Currency, checked: boolean) => {
    if (checked) {
      setFavoriteCurrencies([...favoriteCurrencies, currency]);
    } else {
      setFavoriteCurrencies(
        favoriteCurrencies.filter(
          (item: Currency) => item.symbol !== currency.symbol,
        ),
      );
    }
  };
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];

  const handleInput = useCallback((input: string) => {
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
  }, []);
  const [tab, setTab] = useState('all');
  const tabs = [
    {
      id: 'all',
      text: 'All',
    },
    {
      id: 'trending',
      text: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <img src={Fire} alt='fire' />
          Trending
        </div>
      ),
    },
    {
      id: 'favorites',
      text: 'Favorites',
    },
    {
      id: 'inWallet',
      text: 'In Wallet',
    },
  ];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchQueryInput, setSearchQueryInput] = useDebouncedChangeHandler(
    searchQuery,
    handleInput,
  );

  const allTokens = useAllTokens();
  const inactiveTokens = useInActiveTokens();

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: 'Currency Select',
        action: 'Search by address',
        label: isAddressSearch,
      });
    }
  }, [isAddressSearch]);

  const showETH: boolean = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    return s === '' || s === 'e' || s === 'et' || s === 'eth';
  }, [searchQuery]);

  const currencyBalances = useCurrencyBalances(
    account || undefined,
    showETH
      ? [nativeCurrency, ...Object.values(allTokens)]
      : Object.values(allTokens),
  );
  const tokenComparator = useTokenComparator(false);

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : [];
    let updatedTokens = Object.values(allTokens);

    if (tab === 'favorites') {
      updatedTokens = [...favoriteCurrencies];
    } else if (tab === 'trending') {
      updatedTokens = updatedTokens.filter(
        (t) => (t as any).tokenInfo?.trending,
      );
    } else if (tab === 'inWallet') {
      updatedTokens = Object.values(allTokens).filter((t) => {
        const currencyFound = currencyBalances.find(
          (item) => item?.currency?.symbol === t?.symbol,
        );
        if (!currencyFound) return false;

        return Number(currencyFound.toExact()) > 0;
      });
    }

    const filteredResult = filterTokens(updatedTokens, searchQuery);
    let filteredInactiveResult: Token[] = [];
    // search in inactive token list.
    if (searchQuery) {
      filteredInactiveResult = filterTokens(
        Object.values(inactiveTokens),
        searchQuery,
      );
    }
    const inactiveAddresses = filteredInactiveResult.map(
      (token) => token.address,
    );
    const filteredDefaultTokens = filteredResult.filter(
      (token) => !inactiveAddresses.includes(token.address),
    );
    // return filterTokens(Object.values(allTokens), searchQuery);
    return [...filteredDefaultTokens, ...filteredInactiveResult];
  }, [
    isAddressSearch,
    searchToken,
    allTokens,
    inactiveTokens,
    searchQuery,
    favoriteCurrencies,
    currencyBalances,
    tab,
  ]);

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
    <Box className='currencySearchWrapper'>
      <Box className='currencySearchHeader'>
        <h6>{t('selectToken')}</h6>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box className='searchInputWrapper'>
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
      <CommonBases
        chainId={chainIdToUse}
        onSelect={handleCurrencySelect}
        currencies={favoriteCurrencies.map(
          (item: WrappedTokenInfo) =>
            new WrappedTokenInfo(item.tokenInfo, item?.tags || []),
        )}
        selectedCurrency={selectedCurrency}
        onRemoveFavorite={(c) => handleChangeFavorite(c, false)}
      />
      <CustomTabSwitch
        items={tabs}
        value={tab}
        handleTabChange={setTab}
        height={45}
      />
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
          handleChangeFavorite={handleChangeFavorite}
          favoriteCurrencies={favoriteCurrencies}
        />
      </Box>

      <Box className='currencySearchFooter' />
    </Box>
  );
};

export default CurrencySearch;
