import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { Skeleton } from '@mui/lab';
import { Token, ChainId } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import { CurrencyLogo } from 'components';
import { getTopTokens, getPriceClass, formatNumber } from 'utils';
import styles from 'styles/components/TopMovers.module.scss';
import { useTranslation } from 'react-i18next';
import { useEthPrice, useMaticPrice, useIsV2 } from 'state/application/hooks';
import { getTopTokensV3 } from 'utils/v3-graph';

interface TopMoversProps {
  hideArrow?: boolean;
}
const TopMovers: React.FC<TopMoversProps> = ({ hideArrow = false }) => {
  const { t } = useTranslation();
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();

  const { isV2 } = useIsV2();

  const topMoverTokens = useMemo(
    () => (topTokens && topTokens.length >= 5 ? topTokens.slice(0, 5) : null),
    [topTokens],
  );

  useEffect(() => {
    if (isV2 === undefined) return;

    (async () => {
      if (isV2) {
        if (ethPrice.price && ethPrice.oneDayPrice) {
          const data = await getTopTokens(
            ethPrice.price,
            ethPrice.oneDayPrice,
            5,
          );
          if (data) {
            updateTopTokens(data);
          }
        }
      } else {
        if (maticPrice.price && maticPrice.oneDayPrice) {
          const data = await getTopTokensV3(
            maticPrice.price,
            maticPrice.oneDayPrice,
            5,
          );
          if (data) {
            updateTopTokens(data);
          }
        }
      }
    })();
  }, [
    updateTopTokens,
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
    isV2,
  ]);

  return (
    <Box className={`bg-palette ${styles.topMoversWrapper}`}>
      <p className='weight-600 text-secondary'>{t('24hMostVolume')}</p>
      <Box className={styles.topMoversContent}>
        {topMoverTokens ? (
          <Box>
            {topMoverTokens.map((token: any) => {
              const currency = new Token(
                ChainId.MATIC,
                getAddress(token.id),
                token.decimals,
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
