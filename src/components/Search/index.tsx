import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Typography } from '@material-ui/core';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { client } from 'apollo/client';
import { TOKEN_SEARCH, PAIR_SEARCH } from 'apollo/queries';
import { getAllTokensOnUniswap, getAllPairsOnUniswap } from 'utils';
import { GlobalConst } from 'constants/index';
import { CurrencyLogo, DoubleCurrencyLogo } from 'components';
import { ChainId, Token } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import 'components/styles/SearchWidget.scss';

const Search: React.FC = () => {
  const history = useHistory();
  const [searchVal, setSearchVal] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<any>(null);
  const wrapperRef = useRef<any>(null);
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
          if (GlobalConst.blacklists.TOKEN_BLACKLIST.includes(token.id)) {
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
          if (GlobalConst.blacklists.PAIR_BLACKLIST.includes(pair.id)) {
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
    <Box position='relative'>
      <Box className='searchWidgetInput'>
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
        <div ref={wrapperRef} className='searchWidgetContent'>
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
              <Box
                mt={1}
                key={ind}
                display='flex'
                alignItems='center'
                style={{ cursor: 'pointer' }}
                onClick={() => history.push(`/analytics/pair/${val.id}`)}
              >
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
              <Box
                mt={1}
                key={ind}
                display='flex'
                alignItems='center'
                style={{ cursor: 'pointer' }}
                onClick={() => history.push(`/analytics/token/${val.id}`)}
              >
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
  );
};

export default React.memo(Search);
