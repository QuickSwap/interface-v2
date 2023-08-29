import React, { useEffect, useMemo, useState } from 'react';
import { Box, Divider, useMediaQuery, useTheme } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { Token } from '@uniswap/sdk';
import LiquidityPoolRow from './LiquidityPoolRow';
import { useAllTokens } from 'hooks/Tokens';
import { useTranslation } from 'next-i18next';
import { getConfig } from 'config';
import styles from 'styles/pages/Swap.module.scss';
import { useQuery } from '@tanstack/react-query';

const LiquidityPools: React.FC<{
  token1: Token;
  token2: Token;
}> = ({ token1, token2 }) => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const isLg = useMediaQuery(breakpoints.only('lg'));

  const [liquidityPoolClosed, setLiquidityPoolClosed] = useState(isMobile);
  const [liquidityFilterIndex, setLiquidityFilterIndex] = useState(0);
  const token1Address = token1.address.toLowerCase();
  const token2Address = token2.address.toLowerCase();
  const allTokenList = useAllTokens();
  const { t } = useTranslation();

  const whiteListAddressList = useMemo(
    () => Object.keys(allTokenList).map((item) => item.toLowerCase()),
    [allTokenList],
  );

  const fetchLiquidityPools = async () => {
    const config = getConfig(token1.chainId);
    const v2 = config['v2'];
    let pairData: any[] = [];
    if (v2) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/utils/token-liquidity-pools/${token1Address}/${token2Address}/v2?chainId=${token1.chainId}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.data && data.data.liquidityPools) {
          pairData = data.data.liquidityPools.filter((pair: any) => {
            return (
              whiteListAddressList.includes(pair?.token0?.id) &&
              whiteListAddressList.includes(pair?.token1?.id)
            );
          });
        }
      }
    }
    const v3Res = await fetch(
      `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/utils/token-liquidity-pools/${token1Address}/${token2Address}/v3?chainId=${token1.chainId}`,
    );
    let tokenPairsV3: any[] = [];
    if (v3Res.ok) {
      const v3Data = await v3Res.json();
      if (v3Data && v3Data.data && v3Data.data.liquidityPools) {
        tokenPairsV3 = v3Data.data.liquidityPools;
      }
    }

    return pairData.concat(tokenPairsV3);
  };

  const { isLoading, data: tokenPairs, refetch } = useQuery({
    queryKey: ['fetchSwapTokenPairs', token1Address, token2Address],
    queryFn: fetchLiquidityPools,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  const liquidityPairs = useMemo(() => {
    if (!tokenPairs) return;
    return tokenPairs
      .filter(
        (item: any, pos: number, self: any[]) =>
          self.findIndex(
            (item1: any) =>
              item &&
              item.token0 &&
              item.token1 &&
              item1 &&
              item1.token0 &&
              item1.token1 &&
              item.token0.symbol === item1.token0.symbol &&
              item.token1.symbol === item1.token1.symbol,
          ) === pos,
      )
      .filter((pair: any) => {
        if (liquidityFilterIndex === 0) {
          return true;
        } else if (liquidityFilterIndex === 1) {
          return (
            pair.token0.id === token1Address || pair.token1.id === token1Address
          );
        } else {
          return (
            pair.token0.id === token2Address || pair.token1.id === token2Address
          );
        }
      })
      .sort((pair1: any, pair2: any) =>
        Number(pair1.trackedReserveUSD) > Number(pair2.trackedReserveUSD)
          ? -1
          : 1,
      )
      .slice(0, 5);
  }, [tokenPairs, liquidityFilterIndex, token1Address, token2Address]);

  useEffect(() => {
    setTimeout(() => {
      setLiquidityPoolClosed(isMobile);
    }, 300);
  }, [isMobile]);

  return (
    <>
      <Box
        className='flex items-center justify-between'
        marginBottom={liquidityPoolClosed ? 0 : '20px'}
      >
        <Box className='flex items-center'>
          <p className='weight-600' style={{ marginRight: 8 }}>
            {t('liquidityPools')}
          </p>
          <small className='text-secondary'>
            ({token1.symbol?.toUpperCase()}, {token2.symbol?.toUpperCase()})
          </small>
        </Box>
        <Box
          className='flex cursor-pointer text-secondary'
          onClick={() => setLiquidityPoolClosed(!liquidityPoolClosed)}
        >
          {liquidityPoolClosed ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
        </Box>
      </Box>
      {!liquidityPoolClosed && (
        <>
          <Divider />
          <Box width={1}>
            <Box padding={2} className={`flex ${styles.liquidityMain}`}>
              <Box width={0.5} className={`flex ${styles.liquidityFilter}`}>
                <small
                  className={liquidityFilterIndex === 0 ? 'active' : ''}
                  onClick={() => setLiquidityFilterIndex(0)}
                >
                  {t('all')}
                </small>
                <small
                  className={liquidityFilterIndex === 1 ? 'active' : ''}
                  onClick={() => setLiquidityFilterIndex(1)}
                >
                  {token1.symbol?.toUpperCase()}
                </small>
                <small
                  className={liquidityFilterIndex === 2 ? 'active' : ''}
                  onClick={() => setLiquidityFilterIndex(2)}
                >
                  {token2.symbol?.toUpperCase()}
                </small>
              </Box>
              {isLg && (
                <Box style={{ textAlign: 'right' }} width={0.5}>
                  <small>{t('24hVol')}</small>
                </Box>
              )}
              {!isMobile && !isLg && (
                <>
                  <Box width={0.2}>
                    <small>{t('tvl')}</small>
                  </Box>
                  <Box width={0.15}>
                    <small>{t('24hVol')}</small>
                  </Box>
                  <Box width={0.15} className='text-right'>
                    <small>{t('apy')}</small>
                  </Box>
                </>
              )}
            </Box>
            {isLoading && <Skeleton width='100%' height={50} />}
            {liquidityPairs && (
              <>
                {liquidityPairs.map((pair: any, ind: any) => (
                  <LiquidityPoolRow pair={pair} key={ind} />
                ))}
              </>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default LiquidityPools;
