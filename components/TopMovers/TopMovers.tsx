import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { Skeleton } from '@mui/lab';
import { Token } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import { CurrencyLogo } from 'components';
import {
  getTopTokens,
  getPriceClass,
  formatNumber,
  getTokenFromAddress,
} from 'utils';
import styles from 'styles/components/TopMovers.module.scss';
import { useTranslation } from 'next-i18next';
import { useEthPrice, useMaticPrice, useIsV2 } from 'state/application/hooks';
import { getTopTokensV3 } from 'utils/v3-graph';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from 'config';
import { useSelectedTokenList } from 'state/lists/hooks';

interface TopMoversProps {
  hideArrow?: boolean;
}
const TopMovers: React.FC<TopMoversProps> = ({ hideArrow = false }) => {
  const { t } = useTranslation();
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();
  const { chainId } = useActiveWeb3React();
  const config = chainId ? getConfig(chainId) : undefined;
  const tokenMap = useSelectedTokenList();

  const v2 = config ? config['v2'] : undefined;
  const v3 = config ? config['v3'] : undefined;
  const { isV2 } = useIsV2();

  const topMoverTokens = useMemo(
    () => (topTokens && topTokens.length >= 5 ? topTokens.slice(0, 5) : null),
    [topTokens],
  );

  useEffect(() => {
    if (!chainId) return;

    (async () => {
      if (isV2) {
        if (v2 && ethPrice.price && ethPrice.oneDayPrice) {
          const data = await getTopTokens(
            ethPrice.price,
            ethPrice.oneDayPrice,
            5,
            chainId,
          );
          if (data) {
            updateTopTokens(data);
          }
        }
      } else {
        if (v3 && maticPrice.price && maticPrice.oneDayPrice) {
          const data = await getTopTokensV3(
            maticPrice.price,
            maticPrice.oneDayPrice,
            5,
            chainId,
          );
          if (data) {
            updateTopTokens(data);
          }
        }
      }
    })();
  }, [
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
    isV2,
    v2,
    v3,
    chainId,
  ]);

  return (
    <Box className={`bg-palette ${styles.topMoversWrapper}`}>
      <p className='weight-600 text-secondary'>{t('24hMostVolume')}</p>
      <Box className={styles.topMoversContent}>
        {topMoverTokens && chainId ? (
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
                <Box className={styles.topMoverItem} key={token.id}>
                  <CurrencyLogo currency={currency} size='28px' />
                  <Box ml={1}>
                    <small className='text-bold'>{token.symbol}</small>
                    <Box className='flex items-center justify-center'>
                      <small>${formatNumber(token.priceUSD)}</small>
                      <Box className={`${styles.topMoverText} ${priceClass}`}>
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
          <Skeleton variant='rectangular' width='100%' height={100} />
        )}
      </Box>
    </Box>
  );
};

export default React.memo(TopMovers);
