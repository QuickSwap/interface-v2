import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@material-ui/core';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import Skeleton from '@material-ui/lab/Skeleton';
import { Token, ChainId } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import { CurrencyLogo } from 'components';
import { getTopTokens, getPriceClass, formatNumber } from 'utils';
import 'components/styles/TopMovers.scss';
import { useTranslation } from 'react-i18next';
import { useEthPrice, useMaticPrice, useIsV3 } from 'state/application/hooks';
import { getTopTokensV3 } from 'utils/v3-graph';
import { useActiveWeb3React } from 'hooks';
import { getConfig } from '../../config/index';

interface TopMoversProps {
  hideArrow?: boolean;
}
const TopMovers: React.FC<TopMoversProps> = ({ hideArrow = false }) => {
  const { t } = useTranslation();
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const config = getConfig(chainIdToUse);

  const { isV3 } = useIsV3();
  const v2 = config['v2'];
  const v3 = config['v3'];

  const topMoverTokens = useMemo(
    () => (topTokens && topTokens.length >= 5 ? topTokens.slice(0, 5) : null),
    [topTokens],
  );

  useEffect(() => {
    (async () => {
      if (
        ethPrice.price !== undefined &&
        ethPrice.oneDayPrice !== undefined &&
        maticPrice.price !== undefined &&
        maticPrice.oneDayPrice !== undefined &&
        isV3 !== undefined
      ) {
        const topTokensFn =
          isV3 && v3
            ? getTopTokensV3(
                maticPrice.price,
                maticPrice.oneDayPrice,
                5,
                chainIdToUse,
              )
            : v2
            ? getTopTokens(
                ethPrice.price,
                ethPrice.oneDayPrice,
                5,
                chainIdToUse,
              )
            : getTopTokensV3(
                maticPrice.price,
                maticPrice.oneDayPrice,
                5,
                chainIdToUse,
              );

        topTokensFn.then((data: any) => {
          if (data) {
            updateTopTokens(data);
          }
        });
      }
    })();
  }, [
    updateTopTokens,
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
    isV3,
  ]);

  return (
    <Box className='bg-palette topMoversWrapper'>
      <p className='weight-600 text-secondary'>{t('24hMostVolume')}</p>
      <Box className='topMoversContent'>
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
          <Skeleton variant='rect' width='100%' height={100} />
        )}
      </Box>
    </Box>
  );
};

export default React.memo(TopMovers);
