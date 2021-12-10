import React, { useEffect, useState, useRef, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import cx from 'classnames';
import { useAnalyticToken } from 'state/application/hooks';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { client } from 'apollo/client';
import { TOKEN_SEARCH, PAIR_SEARCH } from 'apollo/queries';
import { getAllTokensOnUniswap, getAllPairsOnUniswap } from 'utils';
import { TOKEN_BLACKLIST, PAIR_BLACKLIST } from 'constants/index';
import AnalyticsOverview from './AnalyticsOverview';
import AnalyticsTokens from './AnalyticsTokens';
import AnalyticsPairs from './AnalyticsPairs';
import AnalyticsTokenDetails from './AnalyticTokenDetails';
import { CurrencyLogo, DoubleCurrencyLogo } from 'components';
import { ChainId, Token } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';

const useStyles = makeStyles(({}) => ({
  topTab: {
    height: 46,
    padding: '0 24px',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '& p': {
      color: '#626680',
    },
  },
  selectedTab: {
    background: '#252833',
    '& p': {
      color: '#ebecf2',
    },
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    background: '#1b1d26',
    height: 46,
    borderRadius: 10,
    margin: '12px 0',
    '& input': {
      background: 'transparent',
      border: 'none',
      outline: 'none',
      fontSize: 15,
      fontWeight: 500,
      minWidth: 240,
      color: '#ebecf2',
    },
  },
  searchContent: {
    position: 'absolute',
    width: '100%',
    background: '#1b1d26',
    borderRadius: 10,
    padding: 12,
    zIndex: 2,
    height: 300,
    overflowY: 'auto',
  },
}));

const AnalyticsPage: React.FC = () => {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<any>(null);
  const wrapperRef = useRef<any>(null);
  const { analyticToken, updateAnalyticToken } = useAnalyticToken();
  const [searchedTokens, setSearchedTokens] = useState<any[]>([]);
  const [searchedPairs, setSearchedPairs] = useState<any[]>([]);
  const [tokensShown, setTokensShown] = useState(3);
  const [pairsShown, setPairsShown] = useState(3);
  const [allTokens, setAllTokens] = useState<any[]>([]);
  const [allPairs, setAllPairs] = useState<any[]>([]);

  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const filteredTokens = useMemo(() => {
    const tokens = allTokens.concat(
      searchedTokens.filter((searchedToken) => {
        let included = false;
        allTokens.map((token) => {
          if (token.id === searchedToken.id) {
            included = true;
          }
          return true;
        });
        return !included;
      }),
    );
    const filtered = tokens
      ? tokens.filter((token) => {
          if (TOKEN_BLACKLIST.includes(token.id)) {
            return false;
          }
          const regexMatches = Object.keys(token).map((tokenEntryKey) => {
            const isAddress = searchVal.slice(0, 2) === '0x';
            if (tokenEntryKey === 'id' && isAddress) {
              return token[tokenEntryKey].match(
                new RegExp(escapeRegExp(searchVal), 'i'),
              );
            }
            if (tokenEntryKey === 'symbol' && !isAddress) {
              return token[tokenEntryKey].match(
                new RegExp(escapeRegExp(searchVal), 'i'),
              );
            }
            if (tokenEntryKey === 'name' && !isAddress) {
              return token[tokenEntryKey].match(
                new RegExp(escapeRegExp(searchVal), 'i'),
              );
            }
            return false;
          });
          return regexMatches.some((m) => m);
        })
      : [];
    return filtered;
  }, [allTokens, searchedTokens, searchVal]);

  const filteredPairs = useMemo(() => {
    const pairs = allPairs.concat(
      searchedPairs.filter((searchedPair) => {
        let included = false;
        allPairs.map((pair) => {
          if (pair.id === searchedPair.id) {
            included = true;
          }
          return true;
        });
        return !included;
      }),
    );
    const filtered = pairs
      ? pairs.filter((pair) => {
          if (PAIR_BLACKLIST.includes(pair.id)) {
            return false;
          }
          if (searchVal && searchVal.includes(' ')) {
            const pairA = searchVal.split(' ')[0]?.toUpperCase();
            const pairB = searchVal.split(' ')[1]?.toUpperCase();
            return (
              (pair.token0.symbol.includes(pairA) ||
                pair.token0.symbol.includes(pairB)) &&
              (pair.token1.symbol.includes(pairA) ||
                pair.token1.symbol.includes(pairB))
            );
          }
          if (searchVal && searchVal.includes('-')) {
            const pairA = searchVal.split('-')[0]?.toUpperCase();
            const pairB = searchVal.split('-')[1]?.toUpperCase();
            return (
              (pair.token0.symbol.includes(pairA) ||
                pair.token0.symbol.includes(pairB)) &&
              (pair.token1.symbol.includes(pairA) ||
                pair.token1.symbol.includes(pairB))
            );
          }
          const regexMatches = Object.keys(pair).map((field) => {
            const isAddress = searchVal.slice(0, 2) === '0x';
            if (field === 'id' && isAddress) {
              return pair[field].match(
                new RegExp(escapeRegExp(searchVal), 'i'),
              );
            }
            if (field === 'token0') {
              return (
                pair[field].symbol.match(
                  new RegExp(escapeRegExp(searchVal), 'i'),
                ) ||
                pair[field].name.match(new RegExp(escapeRegExp(searchVal), 'i'))
              );
            }
            if (field === 'token1') {
              return (
                pair[field].symbol.match(
                  new RegExp(escapeRegExp(searchVal), 'i'),
                ) ||
                pair[field].name.match(new RegExp(escapeRegExp(searchVal), 'i'))
              );
            }
            return false;
          });
          return regexMatches.some((m) => m);
        })
      : [];
    return filtered;
  }, [allPairs, searchedPairs, searchVal]);

  useEffect(() => {
    async function fetchAllData() {
      const tokens = await getAllTokensOnUniswap();
      const pairs = await getAllPairsOnUniswap();
      if (tokens) {
        setAllTokens(tokens);
      }
      if (pairs) {
        setAllPairs(pairs);
      }
    }
    fetchAllData();
  }, []);

  useEffect(() => {
    updateAnalyticToken(null);
  }, [updateAnalyticToken]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (searchVal.length > 0) {
          const tokens = await client.query({
            query: TOKEN_SEARCH,
            variables: {
              value: searchVal ? searchVal.toUpperCase() : '',
              id: searchVal,
            },
          });

          const pairs = await client.query({
            query: PAIR_SEARCH,
            variables: {
              tokens: tokens.data.asSymbol?.map((t: any) => t.id),
              id: searchVal,
            },
          });

          setSearchedPairs(
            pairs.data.as0.concat(pairs.data.as1).concat(pairs.data.asAddress),
          );
          const foundTokens = tokens.data.asSymbol
            .concat(tokens.data.asAddress)
            .concat(tokens.data.asName);
          setSearchedTokens(foundTokens);
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, [searchVal]);

  const handleClick = (e: any) => {
    if (
      !(menuRef.current && menuRef.current.contains(e.target)) &&
      !(wrapperRef.current && wrapperRef.current.contains(e.target))
    ) {
      setPairsShown(3);
      setTokensShown(3);
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  });

  return (
    <Box width='100%' mb={3}>
      {analyticToken ? (
        <AnalyticsTokenDetails token={analyticToken} goBack={setTabIndex} />
      ) : (
        <>
          <Box mb={4}>
            <Typography variant='h4'>Quickswap Analytics</Typography>
          </Box>
          <Box
            mb={4}
            position='relative'
            display='flex'
            justifyContent='space-between'
            flexWrap='wrap'
          >
            <Box marginY={1.5} display='flex' alignItems='center'>
              <Box
                className={cx(
                  classes.topTab,
                  tabIndex === 0 && classes.selectedTab,
                )}
                onClick={() => setTabIndex(0)}
              >
                <Typography variant='body1'>Overview</Typography>
              </Box>
              <Box
                className={cx(
                  classes.topTab,
                  tabIndex === 1 && classes.selectedTab,
                )}
                onClick={() => setTabIndex(1)}
              >
                <Typography variant='body1'>Tokens</Typography>
              </Box>
              <Box
                className={cx(
                  classes.topTab,
                  tabIndex === 2 && classes.selectedTab,
                )}
                onClick={() => setTabIndex(2)}
              >
                <Typography variant='body1'>Pairs</Typography>
              </Box>
            </Box>
            <Box position='relative'>
              <Box className={classes.searchInput}>
                <input
                  placeholder='Search for tokens, pairs, etc…'
                  value={searchVal}
                  ref={menuRef}
                  onFocus={() => setMenuOpen(true)}
                  onChange={(evt) => setSearchVal(evt.target.value)}
                />
                <Box display='flex'>
                  <SearchIcon />
                </Box>
              </Box>
              {menuOpen && (
                <div ref={wrapperRef} className={classes.searchContent}>
                  <Typography variant='body1'>Pairs</Typography>
                  {filteredPairs.slice(0, pairsShown).map((val, ind) => {
                    const currency0 = new Token(
                      ChainId.MATIC,
                      getAddress(val.token0.id),
                      val.token0.decimals,
                    );
                    const currency1 = new Token(
                      ChainId.MATIC,
                      getAddress(val.token1.id),
                      val.token1.decimals,
                    );
                    return (
                      <Box mt={1} key={ind} display='flex' alignItems='center'>
                        <DoubleCurrencyLogo
                          currency0={currency0}
                          currency1={currency1}
                          size={28}
                        />
                        <Typography variant='body2' style={{ marginLeft: 8 }}>
                          {val.token0.symbol} - {val.token1.symbol} Pair
                        </Typography>
                      </Box>
                    );
                  })}
                  <Typography
                    variant='body2'
                    style={{ cursor: 'pointer', margin: '8px 0' }}
                    onClick={() => setPairsShown(pairsShown + 5)}
                  >
                    Show More
                  </Typography>
                  <Typography variant='body1'>Tokens</Typography>
                  {filteredTokens.slice(0, tokensShown).map((val, ind) => {
                    const currency = new Token(
                      ChainId.MATIC,
                      getAddress(val.id),
                      val.decimals,
                    );
                    return (
                      <Box mt={1} key={ind} display='flex' alignItems='center'>
                        <CurrencyLogo currency={currency} size='28px' />
                        <Typography variant='body2' style={{ marginLeft: 8 }}>
                          {val.name} {val.symbol}
                        </Typography>
                      </Box>
                    );
                  })}
                  <Typography
                    variant='body2'
                    style={{ cursor: 'pointer', marginTop: 8 }}
                    onClick={() => setTokensShown(tokensShown + 5)}
                  >
                    Show More
                  </Typography>
                </div>
              )}
            </Box>
          </Box>
          {tabIndex === 0 && (
            <AnalyticsOverview
              showAllTokens={() => setTabIndex(1)}
              showAllPairs={() => setTabIndex(2)}
            />
          )}
          {tabIndex === 1 && <AnalyticsTokens />}
          {tabIndex === 2 && <AnalyticsPairs />}
        </>
      )}
    </Box>
  );
};

export default AnalyticsPage;
