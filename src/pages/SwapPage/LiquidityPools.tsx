import React, { useEffect, useMemo, useState } from 'react';
import { Box, Divider, useMediaQuery } from '@material-ui/core';
import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import { Token } from '@uniswap/sdk';
import LiquidityPoolRow from './LiquidityPoolRow';
import { useAllTokens } from 'hooks/Tokens';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'config';

const LiquidityPools: React.FC<{
  token1: Token;
  token2: Token;
}> = ({ token1, token2 }) => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const isLg = useMediaQuery(breakpoints.only('lg'));

  const [liquidityPoolClosed, setLiquidityPoolClosed] = useState(isMobile);
  const [liquidityFilterIndex, setLiquidityFilterIndex] = useState(0);
  const [tokenPairs, updateTokenPairs] = useState<any[] | null>(null);
  const token1Address = token1.address.toLowerCase();
  const token2Address = token2.address.toLowerCase();
  const allTokenList = useAllTokens();
  const { t } = useTranslation();

  const liquidityPairs = useMemo(
    () =>
      tokenPairs
        ? tokenPairs
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
                  pair.token0.id === token1Address ||
                  pair.token1.id === token1Address
                );
              } else {
                return (
                  pair.token0.id === token2Address ||
                  pair.token1.id === token2Address
                );
              }
            })
            .sort((pair1: any, pair2: any) =>
              Number(pair1.trackedReserveUSD) > Number(pair2.trackedReserveUSD)
                ? -1
                : 1,
            )
            .slice(0, 5)
        : [],
    [tokenPairs, liquidityFilterIndex, token1Address, token2Address],
  );

  const whiteListAddressList = useMemo(
    () => Object.keys(allTokenList).map((item) => item.toLowerCase()),
    [allTokenList],
  );

  useEffect(() => {
    (async () => {
      const config = getConfig(token1.chainId);
      const v2 = config['v2'];
      let pairData;
      if (v2) {
        const res = await fetch(
          `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/token-liquidity-pools/${token1Address}/${token2Address}/v2?chainId=${token1.chainId}`,
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            errorText || res.statusText || `Failed to get top token details`,
          );
        }
        const data = await res.json();
        pairData =
          data && data.data && data.data.liquidityPools
            ? data.data.liquidityPools.filter((pair: any) => {
                return (
                  whiteListAddressList.includes(pair?.token0?.id) &&
                  whiteListAddressList.includes(pair?.token1?.id)
                );
              })
            : [];
      }
      const v3Res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/token-liquidity-pools/${token1Address}/${token2Address}/v3?chainId=${token1.chainId}`,
      );
      if (!v3Res.ok) {
        const errorText = await v3Res.text();
        throw new Error(
          errorText || v3Res.statusText || `Failed to get top token details`,
        );
      }
      const v3Data = await v3Res.json();
      const tokenPairsV3 =
        v3Data && v3Data.data && v3Data.data.liquidityPools
          ? v3Data.data.liquidityPools
          : [];
      updateTokenPairs((pairData ?? []).concat(tokenPairsV3));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token1Address, token2Address]);

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
            <Box padding={2} className='flex liquidityMain'>
              <Box width={0.5} className='flex liquidityFilter'>
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
            {liquidityPairs.map((pair: any, ind: any) => (
              <LiquidityPoolRow pair={pair} key={ind} />
            ))}
          </Box>
        </>
      )}
    </>
  );
};

export default LiquidityPools;
