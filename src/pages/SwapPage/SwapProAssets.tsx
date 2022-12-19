import { getAddress } from '@ethersproject/address';
import { Box, Divider, useMediaQuery, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { ChainId, Token } from '@uniswap/sdk';
import { ReactComponent as SearchIcon } from 'assets/images/SearchIcon.svg';
import { CurrencyLogo, CustomTable } from 'components';
import { GlobalConst } from 'constants/index';
import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useEthPrice, useIsV2, useMaticPrice } from 'state/application/hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import {
  formatNumber,
  getFormattedPrice,
  getPriceClass,
  getTokenFromAddress,
  getTopTokens,
  isAddress,
} from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import { getTopTokensV3 } from 'utils/v3-graph';

const SwapProAssets: React.FC = ({}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('xs'));

  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback((input: string) => {
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
  }, []);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchQueryInput, setSearchQueryInput] = useDebouncedChangeHandler(
    searchQuery,
    handleInput,
    300,
  );

  // For tokens
  const { isV2 } = useIsV2();
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const [filteredTokens, updateFilteredTokens] = useState<any[]>([]);
  const tokenMap = useSelectedTokenList();
  const liquidityHeadCellIndex = 4;
  const oneDayVolumeUSDIndex = 6;

  const tokenHeadCells = [
    {
      id: 'symbol',
      numeric: false,
      label: t('asset'),
      sortDisabled: true,
    },
    {
      id: 'price',
      numeric: true,
      label: t('price'),
      sortDisabled: true,
    },
    {
      id: 'change',
      numeric: true,
      label: t('Change'),
      sortDisabled: true,
    },
    // {
    //   id: 'totalLiquidityUSD',
    //   numeric: true,
    //   label: t('Volume'),
    //   sortDisabled: true,
    // },
  ];

  useEffect(() => {
    if (isV2 === undefined) return;

    // Reset the top tokens
    // updateTopTokens(null);
    const count = GlobalConst.utils.ANALYTICS_TOKENS_COUNT;
    if (isV2) {
      const { price, oneDayPrice } = ethPrice;
      if (price !== undefined && oneDayPrice !== undefined) {
        getTopTokens(price, oneDayPrice, count).then((data) => {
          if (Array.isArray(data)) {
            data.forEach((d) => {
              d.searchVal = (
                (d.symbol || '') + '-' + ('' || d.name) || ''
              ).toLowerCase();
              d.numericVol = Number(d.oneDayVolumeUSD);
              d.kmbVol = toKMB(d.totalLiquidityUSD);
            });

            data.sort((a, b) => b.totalLiquidityUSD - a.totalLiquidityUSD);
          }
          updateTopTokens(data || []);
          setTimeout(() => {
            performFilteration(data || []);
          }, 100);
        });
      }
    } else {
      // v3
      const { price, oneDayPrice } = maticPrice;
      if (price !== undefined && oneDayPrice !== undefined) {
        getTopTokensV3(price, oneDayPrice, count).then((data) => {
          if (Array.isArray(data)) {
            data.forEach((d) => {
              d.searchVal = (
                (d.symbol || '') + '-' + ('' || d.name) || ''
              ).toLowerCase();
              d.numericVol = Number(d.totalLiquidityUSD);
              d.kmbVol = toKMB(d.numericVol);
            });

            data.sort((a, b) => b.totalLiquidityUSD - a.totalLiquidityUSD);
          }

          updateTopTokens(data || []);
          setTimeout(() => {
            performFilteration(data);
          }, 100);
        });
      }
    }
  }, [
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
    isV2,
  ]);

  const performFilteration = (data: Array<any>) => {
    if (Array.isArray(data) && searchQueryInput) {
      const toSearch = searchQueryInput.toLowerCase().trim();
      if (toSearch) {
        const filteredValue = data.filter((d) => {
          return d.searchVal.indexOf(toSearch) > -1;
        });

        // console.log('filteredValue => ', filteredValue);
        // updateFilteredTokens(filteredValue);
        return filteredValue;
      } else {
        return data || [];
      }
    } else {
      // updateFilteredTokens(data || []);
      return data || [];
    }
  };

  const filteredTokensData = useMemo(() => {
    const result: Token[] = performFilteration(topTokens || []);
    return result.slice(0, 10);
    // if (mobileWindowSize) {
    //   return result.slice(0, 20);
    // } else {
    //   return result;
    // }
  }, [searchQuery, topTokens, mobileWindowSize]);

  function toKMB(value: any) {
    const length = (Math.abs(parseInt(value, 10)) + '').length,
      index = Math.ceil((length - 3) / 3),
      suffix = ['K', 'M', 'B', 'T'];

    if (length < 4) return parseFloat(value).toFixed(2);

    return (
      (value / Math.pow(1000, index)).toFixed(1).replace(/\.0$/, '') +
      suffix[index - 1]
    );
  }

  const mobileHTML = (token: any, index: number) => {
    const tokenCurrency = getTokenFromAddress(
      token.id,
      ChainId.MATIC,
      tokenMap,
      [
        new Token(
          ChainId.MATIC,
          getAddress(token.id),
          Number(token.decimals),
          token.symbol,
          token.name,
        ),
      ],
    );
    const priceClass = getPriceClass(Number(token.priceChangeUSD));
    return (
      <Box mt={index === 0 ? 0 : 3} mx='0.5rem'>
        <Box className='flex items-center' mb={1}>
          <Box className='flex items-center'>
            <CurrencyLogo currency={tokenCurrency} size='28px' />
            <Box ml={1}>
              <p className='text-gray25'>
                {token.name} <span className='text-hint'>({token.symbol})</span>
              </p>
            </Box>
          </Box>
        </Box>
        <Divider />
        <Box className='mobileRow'>
          <p>{t('price')}</p>
          <p>${formatNumber(token.priceUSD)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('change')}</p>
          <Box className={`priceChangeWrapper ${priceClass} rounded`}>
            <small style={{ paddingLeft: '8px', paddingRight: '8px' }}>
              {getFormattedPrice(Number(token.priceChangeUSD))}%
            </small>
          </Box>
        </Box>
        <Box className='mobileRow'>
          <p>{t('liquidity')}</p>
          <p>
            <small>${token.totalLiquidityUSD.toLocaleString('us')}</small>
          </p>
        </Box>
      </Box>
    );
  };

  const desktopHTML = (token: any) => {
    const tokenCurrency = getTokenFromAddress(
      token.id,
      ChainId.MATIC,
      tokenMap,
      [
        new Token(
          ChainId.MATIC,
          getAddress(token.id),
          Number(token.decimals),
          token.symbol,
          token.name,
        ),
      ],
    );
    const priceClass = getPriceClass(Number(token.priceChangeUSD), true);
    return [
      {
        html: (
          <Box className='flex items-center'>
            <CurrencyLogo currency={tokenCurrency} size='28px' />
            <Box className='ml-1'>{token.symbol}</Box>
          </Box>
        ),
      },
      {
        html: (
          <Box>
            <p>${formatNumber(token.priceUSD)}</p>
          </Box>
        ),
      },
      {
        html: (
          <Box
            className={`priceChangeWrapper ${priceClass} bg-transparent`}
            mr={2}
          >
            <small>{getFormattedPrice(Number(token.priceChangeUSD))}%</small>
          </Box>
        ),
      },
      // {
      //   html: (
      //     <Box mr={2}>
      //       <small>{token.kmbVol}</small>
      //     </Box>
      //   ),
      // },
    ];
  };

  return (
    <Box className='flex flex-col'>
      <p className='weight-600 text-secondary text-uppercase'>{t('assets')}</p>
      {/* Search Box */}
      <Box className='searchInputWrapper'>
        <SearchIcon />
        <input
          type='text'
          placeholder={t('search')}
          value={searchQueryInput}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={(e) => setSearchQueryInput(e.target.value)}
          // onKeyDown={handleEnter}
          // onKeyUp={() => performFilteration(topTokens || [])}
        />
      </Box>

      {/** Table */}
      <Box className='panel'>
        {topTokens ? (
          <CustomTable
            headCells={tokenHeadCells}
            emptyMessage={'No token found'}
            rowsPerPage={GlobalConst.utils.ROWSPERPAGE}
            defaultOrderBy={4}
            data={filteredTokensData}
            desktopHTML={desktopHTML}
            mobileHTML={mobileHTML}
            showPagination={false}
          />
        ) : (
          <Skeleton variant='rect' width={'100%'} height={150}></Skeleton>
        )}
      </Box>

      {/* <AnalyticsTokens /> */}
    </Box>
  );
};

export default SwapProAssets;
