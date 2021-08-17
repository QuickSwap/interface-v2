import { Currency, ETHER, Token } from '@uniswap/sdk'
import React, { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactGA from 'react-ga'
import { Box, Typography, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import { FixedSizeList } from 'react-window'
import { useDispatch } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useActiveWeb3React } from 'hooks'
import { useAllTokens, useToken } from 'hooks/Tokens'
import { useSelectedListInfo } from 'state/lists/hooks'
import { selectList } from 'state/lists/actions'
import {DEFAULT_TOKEN_LIST_URL} from "constants/index";
import { QuestionHelper, ListLogo } from 'components'
import { ReactComponent as  CloseIcon } from 'assets/images/x.svg'
import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import { AppDispatch } from 'state'
import { isAddress } from 'utils'
import { filterTokens } from 'utils/filtering'
import { useTokenComparator } from 'utils/sorting'
import SortButton from './SortButton'

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  wrapper: {
    padding: '16px 0',
    height: 400,
    display: 'flex',
    flexDirection: 'column',
    [breakpoints.down('xs')]: {
      height: '90vh'
    },
    '& p': {
      color: 'black'
    }
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    '& svg': {
      fill: 'white',
      stroke: 'black'
    },
    '& > svg': {
      cursor: 'pointer'
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      '& p': {
        marginRight: 4,
      },
    }
  },
  searchInput: {
    width: '100%',
    margin: '12px 0',
    fontSize: 16,
    padding: 8,
    borderRadius: 12,
    outline: 'none',
    border: `1px solid ${palette.divider}`
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    margin: '8px 0 0 0',
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      '& img': {
        marginRight: 4
      }
    },
    '& .listButton': {
      color: 'black',
      cursor: 'pointer'
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
  onChangeList
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();


  const fixedList = useRef<FixedSizeList>()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [invertSearchOrder, setInvertSearchOrder] = useState<boolean>(false)
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

  const tokenComparator = useTokenComparator(invertSearchOrder)

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
    fixedList.current?.scrollTo(0)
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
        <Box>
          <Typography>Select a token</Typography>
          <QuestionHelper text="Find a token by searching for its name or symbol or by pasting its address below." />
        </Box>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box mx={2}>
        <input
          type="text"
          className={classes.searchInput}
          placeholder={t('tokenSearchPlaceholder')}
          value={searchQuery}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={handleInput}
          onKeyDown={handleEnter}
        />
        {showCommonBases && (
          <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
        )}
        <Box mb={2} display='flex' justifyContent='space-between' alignItems='center'>
          <Typography>
            Token Name
          </Typography>
          <SortButton ascending={invertSearchOrder} toggleSortOrder={() => setInvertSearchOrder(iso => !iso)} />
        </Box>
      </Box>

      <Divider />

      <Box style={{ flex: 1 }}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <CurrencyList
              height={height}
              showETH={showETH}
              currencies={filteredSortedTokens}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
            />
          )}
        </AutoSizer>
      </Box>

      <Box className={classes.footer}>
        {selectedListInfo.current ? (
          <Box>
            {selectedListInfo.current.logoURI ? (
              <ListLogo
                logoURI={selectedListInfo.current.logoURI}
                alt={`${selectedListInfo.current.name} list logo`}
              />
            ) : null}
            <Typography id="currency-search-selected-list-name">{selectedListInfo.current.name}</Typography>
          </Box>
        ) : null}
        <Box className='listButton' onClick={onChangeList}>
          {selectedListInfo.current ? 'Change' : 'Select a list'}
        </Box>
      </Box>
    </Box>
  )
}

export default CurrencySearch;
