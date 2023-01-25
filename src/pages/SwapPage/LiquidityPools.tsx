import React, { useEffect, useMemo, useState } from 'react';
import { Box, Divider } from 'theme/components';
import { ChevronDown, ChevronUp } from 'react-feather';
import { getTokenPairs, getBulkPairData } from 'utils';
import { Token } from '@uniswap/sdk';
import LiquidityPoolRow from './LiquidityPoolRow';
import { useAllTokens } from 'hooks/Tokens';
import { useTranslation } from 'react-i18next';
import { useEthPrice } from 'state/application/hooks';
import { getTopPairsV3ByTokens } from 'utils/v3-graph';
import { useIsXS } from 'hooks/useMediaQuery';

const LiquidityPools: React.FC<{
  token1: Token;
  token2: Token;
}> = ({ token1, token2 }) => {
  const isMobile = useIsXS();
  const [liquidityPoolClosed, setLiquidityPoolClosed] = useState(false);
  const [liquidityFilterIndex, setLiquidityFilterIndex] = useState(0);
  const [tokenPairs, updateTokenPairs] = useState<any[] | null>(null);
  const token1Address = token1.address.toLowerCase();
  const token2Address = token2.address.toLowerCase();
  const allTokenList = useAllTokens();
  const { t } = useTranslation();
  const { ethPrice } = useEthPrice();

  const liquidityPairs = useMemo(
    () =>
      tokenPairs
        ? tokenPairs
            .filter(
              (item: any, pos: number, self: any[]) =>
                self.findIndex(
                  (item1: any) =>
                    item &&
                    item1 &&
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
    if (!ethPrice.price) return;
    (async () => {
      const tokenPairs = await getTokenPairs(token1Address, token2Address);
      const tokenPairsV3 = await getTopPairsV3ByTokens(
        token1Address.toLowerCase(),
        token2Address.toLowerCase(),
      );

      const formattedPairs = tokenPairs
        ? tokenPairs
            .filter((pair: any) => {
              return (
                whiteListAddressList.includes(pair?.token0?.id) &&
                whiteListAddressList.includes(pair?.token1?.id)
              );
            })
            .map((pair: any) => {
              return pair.id;
            })
        : [];

      const pairData = await getBulkPairData(formattedPairs, ethPrice.price);

      if (pairData) {
        updateTokenPairs(pairData.concat(tokenPairsV3));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token1Address, token2Address, whiteListAddressList, ethPrice.price]);

  return (
    <>
      <Box
        className='flex items-center justify-between'
        margin={liquidityPoolClosed ? '0' : '0 0 20px'}
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
          {liquidityPoolClosed ? <ChevronDown /> : <ChevronUp />}
        </Box>
      </Box>
      {!liquidityPoolClosed && (
        <>
          <Divider />
          <Box width='100%'>
            <Box padding='16px' className='flex liquidityMain'>
              <Box width='50%' className='flex liquidityFilter'>
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
              {!isMobile && (
                <>
                  <Box width='20%'>
                    <small>{t('tvl')}</small>
                  </Box>
                  <Box width='15%'>
                    <small>{t('24hVol')}</small>
                  </Box>
                  <Box width='15%' className='text-right'>
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
