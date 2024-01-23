import { getAddress } from '@ethersproject/address';
import { Box, Divider } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { ChainId, Token } from '@uniswap/sdk';
import { Search } from '@mui/icons-material';
import { CurrencyLogo, CustomTable } from 'components';
import { GlobalConst } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import { useAnalyticsTopTokens } from 'hooks/useFetchAnalyticsData';
import React, {
  RefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'next-i18next';
import { useIsV2 } from 'state/application/hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import {
  formatNumber,
  getFormattedPrice,
  getPriceClass,
  getTokenFromAddress,
  isAddress,
} from 'utils';
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler';
import styles from 'styles/components/CurrencySearchModal.module.scss';

const SwapProAssets: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();

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
  const tokenMap = useSelectedTokenList();

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

  const { isLoading: loadingV2Tokens, data: v2Tokens } = useAnalyticsTopTokens(
    'v2',
    chainId,
    GlobalConst.utils.ANALYTICS_TOKENS_COUNT,
  );

  const { isLoading: loadingV3Tokens, data: v3Tokens } = useAnalyticsTopTokens(
    'v3',
    chainId,
    GlobalConst.utils.ANALYTICS_TOKENS_COUNT,
  );

  const loading = loadingV2Tokens || loadingV3Tokens;

  const topTokens = useMemo(() => {
    const data = isV2 ? v2Tokens : v3Tokens;
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
    return data;
  }, [isV2, v2Tokens, v3Tokens]);

  const performFilteration = useCallback(
    (data: Array<any>) => {
      if (Array.isArray(data) && searchQueryInput) {
        const toSearch = searchQueryInput.toLowerCase().trim();
        if (toSearch) {
          const filteredValue = data.filter((d) => {
            return d.searchVal.indexOf(toSearch) > -1;
          });

          return filteredValue;
        } else {
          return data || [];
        }
      } else {
        return data || [];
      }
    },
    [searchQueryInput],
  );

  const filteredTokensData = useMemo(() => {
    const result: Token[] = performFilteration(topTokens || []);
    return result.slice(0, 10);
  }, [performFilteration, topTokens]);

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
          <Box className='flex items-center' gap='8px'>
            <CurrencyLogo currency={tokenCurrency} size={28} />
            <p className='text-gray25'>
              {token.name} <span className='text-hint'>({token.symbol})</span>
            </p>
          </Box>
        </Box>
        <Divider />
        <Box className='mobileRow'>
          <p>{t('price')}</p>
          <p>${formatNumber(token.priceUSD)}</p>
        </Box>
        <Box className='mobileRow'>
          <p>{t('change')}</p>
          <Box className={`${priceClass} rounded`}>
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
          <Box className='flex items-center' gap='8px'>
            <CurrencyLogo currency={tokenCurrency} size={28} />
            <p>{token.symbol}</p>
          </Box>
        ),
      },
      {
        html: (
          <Box width='100%' style={{ wordBreak: 'break-all' }}>
            <p>${formatNumber(token.priceUSD)}</p>
          </Box>
        ),
      },
      {
        html: (
          <Box className={`${priceClass} bg-transparent`}>
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
      <Box className={styles.searchInputWrapper}>
        <Search />
        <input
          type='text'
          placeholder={t('search') ?? undefined}
          value={searchQueryInput}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={(e) => setSearchQueryInput(e.target.value)}
          // onKeyDown={handleEnter}
          // onKeyUp={() => performFilteration(topTokens || [])}
        />
      </Box>

      {/** Table */}
      {loading ? (
        <Skeleton variant='rectangular' width={'100%'} height={150} />
      ) : topTokens ? (
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
        <></>
      )}
    </Box>
  );
};

export default SwapProAssets;
