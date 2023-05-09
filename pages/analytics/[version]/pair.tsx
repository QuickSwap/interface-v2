import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Grid } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { Token } from '@uniswap/sdk';
import {
  shortenAddress,
  getEtherscanLink,
  formatNumber,
  getTokenFromAddress,
} from 'utils';
import { useActiveWeb3React } from 'hooks';
import {
  CurrencyLogo,
  DoubleCurrencyLogo,
  TransactionsTable,
} from 'components';
import { getAddress } from '@ethersproject/address';
import { GlobalConst, TxnType } from 'constants/index';
import AnalyticsHeader from 'components/pages/analytics/AnalyticsHeader';
import AnalyticsPairChart from 'components/pages/analytics/AnalyticsPairChart';
import { useTranslation } from 'next-i18next';
import { useEthPrice } from 'state/application/hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { CallMade } from '@mui/icons-material';
import { getConfig } from 'config';
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from 'styles/pages/Analytics.module.scss';

const AnalyticsPairDetails = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pairAddress = router.query.id ? (router.query.id as string) : undefined;
  const tokenMap = useSelectedTokenList();
  const [dataLoading, setDataLoading] = useState(false);
  const [pairData, setPairData] = useState<any>(null);
  const [pairTransactions, setPairTransactions] = useState<any>(null);

  const version = router.query.version ?? 'v3';
  const isV2 = version === 'v2';
  const { chainId } = useActiveWeb3React();

  const config = getConfig(chainId);
  const showAnalytics = config['analytics']['available'];
  useEffect(() => {
    if (!showAnalytics) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnalytics]);

  const pairTransactionsList = useMemo(() => {
    if (pairTransactions) {
      const mints = pairTransactions.mints.map((item: any) => {
        return { ...item, type: TxnType.ADD };
      });
      const swaps = pairTransactions.swaps.map((item: any) => {
        const amount0 =
          item.amount0 > 0 ? item.amount0 : Math.abs(item.amount1);
        const amount1 =
          item.amount0 > 0 ? Math.abs(item.amount1) : Math.abs(item.amount0);
        const token0 = item.amount0 > 0 ? item.pair.token0 : item.pair.token1;
        const token1 = item.amount0 > 0 ? item.pair.token1 : item.pair.token0;
        return {
          ...item,
          amount0,
          amount1,
          pair: { token0, token1 },
          type: TxnType.SWAP,
        };
      });
      const burns = pairTransactions.burns.map((item: any) => {
        return { ...item, type: TxnType.REMOVE };
      });
      return mints.concat(swaps).concat(burns);
    } else {
      return null;
    }
  }, [pairTransactions]);
  const currency0 =
    pairData && chainId
      ? getTokenFromAddress(pairData.token0.id, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(pairData.token0.id),
            pairData.token0.decimals,
          ),
        ])
      : undefined;
  const currency1 =
    pairData && chainId
      ? getTokenFromAddress(pairData.token1.id, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(pairData.token1.id),
            pairData.token1.decimals,
          ),
        ])
      : undefined;

  const token0Rate = !isV2
    ? // According to the graph Token1Price is the number of token 1s per token 0
      // So we need to invert these
      pairData && pairData.token1Price
      ? Number(pairData.token1Price) >= 0.0001
        ? Number(pairData.token1Price).toFixed(
            Number(pairData.token1Price) > 1 ? 2 : 4,
          )
        : '< 0.0001'
      : '-'
    : pairData && pairData.reserve0 && pairData.reserve1
    ? Number(pairData.reserve1) / Number(pairData.reserve0) >= 0.0001
      ? (Number(pairData.reserve1) / Number(pairData.reserve0)).toFixed(
          Number(pairData.reserve1) / Number(pairData.reserve0) > 1 ? 2 : 4,
        )
      : '< 0.0001'
    : '-';

  // According to the graph Token0Price is the number of token 0's per token 1
  // So we need to invert these
  const token1Rate = !isV2
    ? pairData && pairData.token0Price
      ? Number(pairData.token0Price) >= 0.0001
        ? Number(pairData.token0Price).toFixed(
            Number(pairData.token0Price) > 1 ? 2 : 4,
          )
        : '< 0.0001'
      : '-'
    : pairData && pairData.reserve0 && pairData.reserve1
    ? Number(pairData.reserve0) / Number(pairData.reserve1) >= 0.0001
      ? (Number(pairData.reserve0) / Number(pairData.reserve1)).toFixed(
          Number(pairData.reserve0) / Number(pairData.reserve1) > 1 ? 2 : 4,
        )
      : '< 0.0001'
    : '-';

  const usingUtVolume =
    pairData &&
    pairData.oneDayVolumeUSD === 0 &&
    !!pairData.oneDayVolumeUntracked;
  const fees = isV2
    ? pairData && (pairData.oneDayVolumeUSD || pairData.oneDayVolumeUSD === 0)
      ? usingUtVolume
        ? formatNumber(
            Number(pairData.oneDayVolumeUntracked) *
              GlobalConst.utils.FEEPERCENT,
          )
        : formatNumber(
            Number(pairData.oneDayVolumeUSD) * GlobalConst.utils.FEEPERCENT,
          )
      : '-'
    : pairData && pairData.feesUSDOneDay
    ? formatNumber(pairData.feesUSDOneDay)
    : '0';
  const { ethPrice } = useEthPrice();

  useEffect(() => {
    (async () => {
      if (chainId && version && pairAddress) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/analytics/top-pair-details/${pairAddress}/${version}?chainId=${chainId}`,
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            errorText || res.statusText || `Failed to get top pair details`,
          );
        }
        const data = await res.json();
        setDataLoading(false);
        if (data?.data?.pairData) {
          setPairData(data.data.pairData);
          setPairTransactions(data.data.pairTransactions);
        }
      }
    })();
  }, [pairAddress, ethPrice.price, isV2, chainId, version]);

  useEffect(() => {
    setDataLoading(true);
    setPairData(null);
    setPairTransactions(null);
  }, [pairAddress, isV2]);

  const PairInfo = () => (
    <Box width={1} my={4}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={3}>
          <Box className={`panel ${styles.analyticsDetailsInfoV3}`}>
            <Box>
              <span className='text-disabled'>{t('totalTokensLocked')}</span>
              <Box
                mt={1.5}
                className='bg-gray2'
                borderRadius='8px'
                padding={1.5}
              >
                <Box
                  className='flex items-center justify-between cursor-pointer'
                  onClick={() => {
                    router.push(
                      `/analytics/${version}/token?id=${pairData.token0.id}`,
                    );
                  }}
                >
                  <Box className='flex items-center'>
                    <CurrencyLogo currency={currency0} size='16px' />
                    <span style={{ marginLeft: 6 }}>
                      {pairData.token0.symbol} :
                    </span>
                  </Box>
                  <span>{formatNumber(pairData.reserve0)}</span>
                </Box>
                <Box
                  mt={1}
                  className='flex items-center justify-between cursor-pointer'
                  onClick={() => {
                    router.push(
                      `/analytics/${version}/token?id=${pairData.token1.id}`,
                    );
                  }}
                >
                  <Box className='flex items-center'>
                    <CurrencyLogo currency={currency1} size='16px' />
                    <span style={{ marginLeft: 6 }}>
                      {pairData.token1.symbol} :
                    </span>
                  </Box>
                  <span>{formatNumber(pairData.reserve1)}</span>
                </Box>
              </Box>
            </Box>
            <Box width={140}>
              <span className='text-disabled'>{t('totalLiquidity')}</span>
              <h6>
                $
                {formatNumber(
                  pairData.reserveUSD
                    ? pairData.reserveUSD
                    : pairData.trackedReserveUSD,
                )}
              </h6>
            </Box>
            <Box mt={4}>
              <span className='text-disabled'>{t('24hTradingVol1')}</span>
              <h6>${formatNumber(pairData.oneDayVolumeUSD)}</h6>
            </Box>
            <Box mt={4}>
              <span className='text-disabled'>{t('24hFees')}</span>
              <h6>${fees}</h6>
            </Box>
            <Box mt={4}>
              <span className='text-disabled'>{t('contractAddress')}</span>
              <h6>
                {chainId ? (
                  <a
                    href={getEtherscanLink(chainId, pairData.id, 'address')}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primaryText no-decoration'
                  >
                    <Box className='flex items-center'>
                      {shortenAddress(pairData.id)}
                      <CallMade />
                    </Box>
                  </a>
                ) : (
                  shortenAddress(pairData.id)
                )}
              </h6>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={9}>
          <Box className='panel' mt={2} mb={2} height={'100%'}>
            <AnalyticsPairChart
              pairData={pairData}
              token0Rate={token0Rate}
              token1Rate={token1Rate}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <>
      <AnalyticsHeader type='pair' data={pairData} address={pairAddress} />
      {pairData ? (
        <>
          <Box width={1} className='flex flex-wrap justify-between'>
            <Box>
              <Box className='flex items-center'>
                <DoubleCurrencyLogo
                  currency0={currency0}
                  currency1={currency1}
                  size={32}
                />
                <Box ml={1}>
                  <p className={styles.heading1}>
                    <Link
                      href={`/analytics/${version}/token?id=${pairData.token0.id}`}
                    >
                      {pairData.token0.symbol}
                    </Link>{' '}
                    /{' '}
                    <Link
                      href={`/analytics/${version}/token?id=${pairData.token1.id}`}
                    >
                      {pairData.token1.symbol}
                    </Link>
                  </p>
                </Box>
                {!isV2 && (
                  <Box
                    ml={2}
                    paddingY={0.5}
                    paddingX={1}
                    borderRadius='6px'
                    className='text-primaryText bg-gray30'
                  >
                    <small>{pairData.fee / 10000}% Fee</small>
                  </Box>
                )}
              </Box>
              <Box mt={2} display='flex'>
                <Box
                  className={styles.analyticsPairRate}
                  onClick={() => {
                    router.push(
                      `/analytics/${version}/token?id=${pairData.token0.id}`,
                    );
                  }}
                >
                  <CurrencyLogo currency={currency0} size='16px' />
                  <small style={{ marginLeft: 6 }}>
                    1 {pairData.token0.symbol} = {token0Rate}{' '}
                    {pairData.token1.symbol}
                  </small>
                </Box>
                <Box
                  ml={1}
                  className={styles.analyticsPairRate}
                  onClick={() => {
                    router.push(
                      `/analytics/${version}/token?id=${pairData.token1.id}`,
                    );
                  }}
                >
                  <CurrencyLogo currency={currency1} size='16px' />
                  <small style={{ marginLeft: 6 }}>
                    1 {pairData.token1.symbol} = {token1Rate}{' '}
                    {pairData.token0.symbol}
                  </small>
                </Box>
              </Box>
            </Box>
            <Box my={2} display='flex'>
              <Box
                className={`${styles.button} border-primary`}
                mr={1.5}
                onClick={() => {
                  router.push(
                    `/pools${isV2 ? '/v2' : '/v3'}?currency0=${
                      pairData.token0.id
                    }&currency1=${pairData.token1.id}`,
                  );
                }}
              >
                <small>{t('addLiquidity')}</small>
              </Box>
              <Box
                className={`${styles.button} ${styles.filledButton}`}
                onClick={() => {
                  router.push(
                    `/swap${isV2 ? '/v2' : '/v3'}?currency0=${
                      pairData.token0.id
                    }&currency1=${pairData.token1.id}`,
                  );
                }}
              >
                <small>{t('swap')}</small>
              </Box>
            </Box>
          </Box>
          <PairInfo />
          {!isV2 && (
            <>
              <Box width={1}>
                <p>{t('transactions')}</p>
              </Box>
              <Box width={1} className='panel' my={4}>
                {pairTransactionsList ? (
                  <TransactionsTable data={pairTransactionsList} />
                ) : (
                  <Skeleton variant='rectangular' width='100%' height={150} />
                )}
              </Box>
            </>
          )}
        </>
      ) : dataLoading ? (
        <Skeleton width='100%' height={100} />
      ) : (
        <Box py={4}>
          <h5>{t('pairNotExist')}</h5>
        </Box>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const versions = ['v2', 'v3', 'total'];
  const paths =
    versions?.map((version) => ({
      params: { version },
    })) || [];

  return {
    paths,
    fallback: 'blocking',
  };
};

export default AnalyticsPairDetails;
