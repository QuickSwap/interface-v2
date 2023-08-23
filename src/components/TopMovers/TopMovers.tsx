import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import Skeleton from '@material-ui/lab/Skeleton';
import { Token } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import { CurrencyLogo } from 'components';
import { getPriceClass, formatNumber, getTokenFromAddress } from 'utils';
import 'components/styles/TopMovers.scss';
import { useTranslation } from 'react-i18next';
import { useIsV2 } from 'state/application/hooks';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from '../../config/index';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useAnalyticsTopTokens } from 'hooks/useFetchAnalyticsData';

interface TopMoversProps {
  hideArrow?: boolean;
}
const TopMovers: React.FC<TopMoversProps> = ({ hideArrow = false }) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const config = chainId ? getConfig(chainId) : undefined;
  const tokenMap = useSelectedTokenList();

  const v2 = config ? config['v2'] : undefined;
  const v3 = config ? config['v3'] : undefined;
  const { isV2 } = useIsV2();

  const { isLoading: loadingV2Tokens, data: v2Tokens } = useAnalyticsTopTokens(
    'v2',
    chainId,
    5,
  );

  const { isLoading: loadingV3Tokens, data: v3Tokens } = useAnalyticsTopTokens(
    'v3',
    chainId,
    5,
  );

  const topTokens = useMemo(() => {
    if (v2 && isV2) return v2Tokens;
    if (v3) return v3Tokens;
    return;
  }, [isV2, v2, v2Tokens, v3, v3Tokens]);

  const topMoverTokens = useMemo(
    () => (topTokens && topTokens.length >= 5 ? topTokens.slice(0, 5) : null),
    [topTokens],
  );

  const loading = loadingV2Tokens || loadingV3Tokens;

  return (
    <Box className='bg-palette topMoversWrapper'>
      <p className='weight-600 text-secondary'>{t('24hMostVolume')}</p>
      <Box className='topMoversContent'>
        {loading ? (
          <Skeleton variant='rect' width='100%' height={100} />
        ) : topMoverTokens && chainId ? (
          <Box>
            {topMoverTokens.map((token: any) => {
              const currency = getTokenFromAddress(
                token.id,
                chainId,
                tokenMap,
                [
                  new Token(
                    chainId,
                    getAddress(token.id),
                    Number(token.decimals),
                    token.symbol,
                    token.name,
                  ),
                ],
              );
              const priceClass = getPriceClass(Number(token.priceChangeUSD));
              const priceUp = Number(token.priceChangeUSD) > 0;
              const priceDown = Number(token.priceChangeUSD) < 0;
              const priceUpPercent = Number(token.priceChangeUSD).toFixed(2);
              return (
                <Box className='topMoverItem' key={token.id}>
                  <CurrencyLogo currency={currency} size='28px' />
                  <Box ml={1}>
                    <small className='text-bold'>{token.symbol}</small>
                    <Box className='flex justify-center items-center'>
                      <small>${formatNumber(token.priceUSD)}</small>
                      <Box className={`topMoverText ${priceClass}`}>
                        {!hideArrow && priceUp && <ArrowDropUp />}
                        {!hideArrow && priceDown && <ArrowDropDown />}
                        <span>
                          {hideArrow && priceUp ? '+' : ''}
                          {priceUpPercent}%
                        </span>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(TopMovers);
