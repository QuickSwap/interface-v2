import { Currency, ETHER, Token } from '@uniswap/sdk';
import React, { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga';
import { Box, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { useAllTokens, useToken } from 'hooks/Tokens';
import { useSelectedListInfo } from 'state/lists/hooks';
import { selectList } from 'state/lists/actions';
import {DEFAULT_TOKEN_LIST_URL} from 'constants/index';
import AutoSizer from 'react-virtualized-auto-sizer';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import CommonBases from './CommonBases';
import CurrencyList from './CurrencyList';
import { AppDispatch } from 'state';
import { isAddress } from 'utils';
import { filterTokens } from 'utils/filtering';
import { useTokenComparator } from 'utils/sorting';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  wrapper: {
    padding: '32px 24px 0',
    height: 620,
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    background: '#1b1e29',
    backdropFilter: 'blur(9.9px)',
    border: '1px solid #3e4252',
    [breakpoints.down('xs')]: {
      height: '90vh'
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '6px',
    '& svg': {
      fill: '#686c80',
      cursor: 'pointer'
    },
    '& h6': {
      color: '#c7cad9',
      fontWeight: 600
    }
  },
  searchInputWrapper: {
    width: '100%',
    height: 50,
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    margin: '12px 0',
    fontSize: 16,
    borderRadius: 12,
    outline: 'none',
    border: 'solid 2px rgba(105, 108, 128, 0.12)',
    backgroundColor: '#12131a',
    '& svg': {
      marginRight: 12,
    },
    '& input': {
      background: 'transparent',
      flex: 1,
      boxShadow: 'none',
      border: 'none',
      outline: 'none',
      fontSize: 14,
      fontWeight: 500,
      color: '#696c80',
      fontFamily: "'Inter', sans-serif"
    }
  },
  footer: {
    backgroundImage: 'linear-gradient(to bottom, rgba(27, 30, 41, 0), #1b1e29 64%)',
    width: '100%',
    height: 64,
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 2,
    borderRadius: 20
  },
  currencyListWrapper: {
    flex: 1,
    overflowY: 'auto',
    marginTop: 16,
    '& .MuiListItem-root': {
      padding: 6,
      '&.Mui-selected, &:hover': {
        background: 'none'
      }
    }
  }
}));

interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  onChangeList: () => void
}

const CurrencySearch: React.FC<CurrencySearchProps> = ({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  onChangeList,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();

  const [searchQuery, setSearchQuery] = useState<string>('')
  const allTokens = useAllTokens()

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: 'Currency Select',
        action: 'Search by address',
        label: isAddressSearch
      })
    }
  }, [isAddressSearch])

  const showETH: boolean = useMemo(() => {
    const s = searchQuery.toLowerCase().trim()
    return s === '' || s === 'e' || s === 'et' || s === 'eth'
  }, [searchQuery])

  const tokenComparator = useTokenComparator(false)

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : []
    return filterTokens(Object.values(allTokens), searchQuery)
  }, [isAddressSearch, searchToken, allTokens, searchQuery])

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken]
    const sorted = filteredTokens.sort(tokenComparator)
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0)
    if (symbolMatch.length > 1) return sorted

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol?.toLowerCase() !== symbolMatch[0])
    ]
  }, [filteredTokens, searchQuery, searchToken, tokenComparator])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(event => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = searchQuery.toLowerCase().trim()
        if (s === 'eth') {
          handleCurrencySelect(ETHER)
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, searchQuery]
  )

  let selectedListInfo = useSelectedListInfo()

  if (selectedListInfo.current === null) {
    dispatch(selectList(DEFAULT_TOKEN_LIST_URL))
  }
  selectedListInfo = useSelectedListInfo()


  return (
    <Box className={classes.wrapper}>
      <Box className={classes.header}>
        <Typography variant='subtitle2'>Select a token</Typography>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box className={classes.searchInputWrapper}>
        <SearchIcon />
        <input
          type="text"
          placeholder={t('tokenSearchPlaceholder')}
          value={searchQuery}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={handleInput}
          onKeyDown={handleEnter}
        />
      </Box>
      {showCommonBases && (
        <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
      )}

      <Divider />

      <Box className={classes.currencyListWrapper}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <CurrencyList
              showETH={showETH}
              height={height}
              currencies={filteredSortedTokens}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
            />
          )}
        </AutoSizer>
      </Box>

      <Box className={classes.footer} />
    </Box>
  )
}

export default CurrencySearch;
