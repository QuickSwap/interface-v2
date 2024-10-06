import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Button } from '@material-ui/core';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { getTokenFromAddress } from 'utils';
import { GlobalConst } from 'constants/index';
import { CurrencyLogo, DoubleCurrencyLogo } from 'components';
import { ChainId, Token } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import 'components/styles/SearchWidget.scss';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { getConfig } from '../../config/index';
import Loader from 'components/Loader';
import { useQuery } from '@tanstack/react-query';
dayjs.extend(utc);

const AnalyticsSearch: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [searchVal, setSearchVal] = useState('');
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);
  const v2 = config['v2'];
  const v3 = config['v3'];
  const [searchValInput, setSearchValInput] = useDebouncedChangeHandler(
    searchVal,
    setSearchVal,
    500,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<any>(null);
  const wrapperRef = useRef<any>(null);
  const [tokensShown, setTokensShown] = useState(3);
  const [pairsShown, setPairsShown] = useState(3);
  const tokenMap = useSelectedTokenList();
  const version = useAnalyticsVersion();

  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const fetchSearchData = async () => {
    try {
      let v2Data: any = null;
      let v3Data: any = null;
      if (v2 && version !== 'v3') {
        const res = await fetch(
          `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/search-token-pair/v2?chainId=${chainIdToUse}&search=${searchVal}`,
        );
        if (!res.ok) {
          return null;
        }
        const data = await res.json();
        if (data && data.data) {
          v2Data = data.data;
        }
      }

      if (v3 && version !== 'v2') {
        const res = await fetch(
          `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/search-token-pair/v3?chainId=${chainIdToUse}&search=${searchVal}`,
        );
        if (!res.ok) {
          return null;
        }
        const data = await res.json();
        if (data && data.data) {
          v3Data = data.data;
        }
      }

      if (version === 'v2') return v2Data;
      if (version === 'v3') return v3Data;
      const v2Tokens =
        v2Data && v2Data.tokens
          ? v2Data.tokens.map((token: any) => {
              return { ...token, version: 'v2' };
            })
          : [];
      const v2Pairs =
        v2Data && v2Data.pairs
          ? v2Data.pairs.map((pair: any) => {
              return { ...pair, version: 'v2' };
            })
          : [];
      const v3Tokens =
        v3Data && v3Data.tokens
          ? v3Data.tokens.map((token: any) => {
              return { ...token, version: 'v3' };
            })
          : [];
      const v3Pairs =
        v3Data && v3Data.pairs
          ? v3Data.pairs.map((pair: any) => {
              return { ...pair, version: 'v3' };
            })
          : [];
      return {
        tokens: v3Tokens.concat(v2Tokens).reduce((memo: any[], token: any) => {
          const existingItemIndex = memo.findIndex(
            (item) => token.id.toLowerCase() === item.id.toLowerCase(),
          );
          if (existingItemIndex > -1) {
            const existingItem = memo[existingItemIndex];
            memo = [
              ...memo.slice(0, existingItemIndex),
              {
                ...existingItem,
                volumeUSD:
                  Number(existingItem?.volumeUSD ?? 0) +
                  Number(token?.volumeUSD ?? 0),
              },
              ...memo.slice(existingItemIndex + 1),
            ];
          } else {
            memo.push(token);
          }
          return memo;
        }, []),
        pairs: v3Pairs.concat(v2Pairs).reduce((memo: any[], pair: any) => {
          const existingItemIndex = memo.findIndex(
            (item) => pair.id.toLowerCase() === item.id.toLowerCase(),
          );
          if (existingItemIndex > -1) {
            const existingItem = memo[existingItemIndex];
            memo = [
              ...memo.slice(0, existingItemIndex),
              {
                ...existingItem,
                volumeUSD:
                  Number(existingItem?.volumeUSD ?? 0) +
                  Number(pair?.volumeUSD ?? 0),
              },
              ...memo.slice(existingItemIndex + 1),
            ];
          } else {
            memo.push(pair);
          }
          return memo;
        }, []),
      };
    } catch (e) {
      return null;
    }
  };

  const {
    isLoading: searchDataLoading,
    data: searchData,
    refetch: refetchSearchData,
  } = useQuery({
    queryKey: ['fetchAnalyticsSearchData', searchVal, version, chainIdToUse],
    queryFn: fetchSearchData,
  });

  const filteredTokens = useMemo(() => {
    const searchedTokens: any[] = searchData?.tokens ?? [];

    const filtered = searchedTokens.filter((token) => {
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
    });
    return filtered;
  }, [searchData, searchVal]);

  const filteredPairs = useMemo(() => {
    const searchedPairs: any[] = searchData?.pairs ?? [];

    const filtered = searchedPairs.filter((pair) => {
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
          return pair[field].match(new RegExp(escapeRegExp(searchVal), 'i'));
        }
        if (field === 'token0' || field === 'token1') {
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
    });
    return filtered;
  }, [searchData, searchVal]);

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
  }, []);

  return (
    <Box className='searchWidgetWrapper'>
      <Box className='searchWidgetInput'>
        <input
          placeholder={t('searchTokenPair')}
          value={searchValInput}
          ref={menuRef}
          onFocus={() => setMenuOpen(true)}
          onChange={(evt) => setSearchValInput(evt.target.value)}
        />
        <Box display='flex'>
          <SearchIcon />
        </Box>
      </Box>
      {menuOpen && (
        <div ref={wrapperRef} className='searchWidgetContent'>
          {searchDataLoading ? (
            <Box
              width='100%'
              height='100%'
              className='flex items-center justify-center'
            >
              <Loader size='30px' />
            </Box>
          ) : !searchData ? (
            <Box
              width='100%'
              height='100%'
              className='flex flex-col items-center justify-center'
            >
              <p>{t('failedToFetchAnalyticsSearch')}</p>
              <Box mt={2}>
                <Button size='large' onClick={() => refetchSearchData()}>
                  {t('tryagain')}
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <h6>{t('pairs')}</h6>
              {filteredPairs.slice(0, pairsShown).map((val, ind) => {
                const currency0 = getTokenFromAddress(
                  val.token0.id,
                  chainIdToUse,
                  tokenMap,
                  [
                    new Token(
                      chainIdToUse,
                      getAddress(val.token0.id),
                      val.token0.decimals,
                    ),
                  ],
                );
                const currency1 = getTokenFromAddress(
                  val.token1.id,
                  chainIdToUse,
                  tokenMap,
                  [
                    new Token(
                      chainIdToUse,
                      getAddress(val.token1.id),
                      val.token1.decimals,
                    ),
                  ],
                );
                return (
                  <Box
                    key={ind}
                    className='searchWidgetRow'
                    onClick={() => {
                      history.push(
                        `/analytics/${
                          version === 'total' ? val.version : version
                        }/pair/${val.id}`,
                      );
                      setMenuOpen(false);
                    }}
                  >
                    <DoubleCurrencyLogo
                      currency0={currency0}
                      currency1={currency1}
                      size={28}
                    />
                    <small>
                      {val.token0.symbol} - {val.token1.symbol} {t('pair')}
                    </small>
                  </Box>
                );
              })}
              <Box
                className='searchWidgetShowMore'
                onClick={() => setPairsShown(pairsShown + 5)}
              >
                <small>{t('showMore')}</small>
              </Box>
              <h6>{t('tokens')}</h6>
              {filteredTokens.slice(0, tokensShown).map((val, ind) => {
                const currency = getTokenFromAddress(
                  getAddress(val.id),
                  chainIdToUse,
                  tokenMap,
                  [new Token(chainIdToUse, getAddress(val.id), val.decimals)],
                );

                return (
                  <Box
                    key={ind}
                    className='searchWidgetRow'
                    onClick={() => {
                      history.push(`/analytics/${version}/token/${val.id}`);
                      setMenuOpen(false);
                    }}
                  >
                    <CurrencyLogo currency={currency} size='28px' />
                    <small>
                      {val.name} ({val.symbol})
                    </small>
                  </Box>
                );
              })}
              <Box
                className='searchWidgetShowMore'
                onClick={() => setTokensShown(tokensShown + 5)}
              >
                <small>{t('showMore')}</small>
              </Box>
            </>
          )}
        </div>
      )}
    </Box>
  );
};

export default React.memo(AnalyticsSearch);
