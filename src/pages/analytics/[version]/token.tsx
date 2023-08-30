import React, { useEffect, useMemo } from 'react';
import { Box, Grid } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { Token } from '@uniswap/sdk';
import {
  shortenAddress,
  getEtherscanLink,
  getPriceClass,
  formatNumber,
  getTokenFromAddress,
  getFormattedPercent,
} from 'utils';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { CurrencyLogo, PairTable, TransactionsTable } from 'components';
import { useBookmarkTokens, useIsV2 } from 'state/application/hooks';
import StarChecked from 'svgs/StarChecked.svg';
import StarUnchecked from 'svgs/StarUnchecked.svg';
import { GlobalConst, TxnType } from 'constants/index';
import AnalyticsHeader from 'components/pages/analytics/AnalyticsHeader';
import AnalyticsTokenChart from 'components/pages/analytics/AnalyticsTokenChart';
import { useTranslation } from 'next-i18next';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAddress } from 'ethers/lib/utils';
import { useRouter } from 'next/router';
import { getConfig } from 'config';
import { GetStaticProps, InferGetStaticPropsType, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import styles from 'styles/pages/Analytics.module.scss';
import { useAnalyticsTokenDetails } from 'hooks/useFetchAnalyticsData';

const AnalyticsTokenDetails = (
  _props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
  const { t } = useTranslation();
  const router = useRouter();
  const tokenAddress = router.query.id
    ? (router.query.id as string).toLowerCase()
    : '';
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();

  const {
    bookmarkTokens,
    addBookmarkToken,
    removeBookmarkToken,
  } = useBookmarkTokens();
  const config = getConfig(chainId);
  const v3 = config['v3'];
  const v2 = config['v2'];

  const showAnalytics = config['analytics']['available'];
  useEffect(() => {
    if (!showAnalytics) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnalytics]);

  const { updateIsV2 } = useIsV2();

  useEffect(() => {
    if (!v2 && v3) {
      updateIsV2(false);
    }
  }, [updateIsV2, v2, v3]);
  const version = useAnalyticsVersion();

  const { isLoading, data } = useAnalyticsTokenDetails(
    tokenAddress,
    version,
    chainId,
  );

  const currency =
    data && data.token && chainId
      ? getTokenFromAddress(tokenAddress, chainId, tokenMap, [
          new Token(
            chainId,
            getAddress(data.token.id),
            data.token.decimals ?? 18,
          ),
        ])
      : undefined;

  const tokenPercentClass = getPriceClass(
    data && data.token ? Number(data.token.priceChangeUSD) : 0,
  );

  const tokenTransactionsList = useMemo(() => {
    if (data && data.tokenTransactions) {
      const mints = data.tokenTransactions.mints.map((item: any) => {
        return { ...item, type: TxnType.ADD };
      });
      const swaps = data.tokenTransactions.swaps.map((item: any) => {
        const amount0 = item.isV2
          ? item.amount0Out > 0
            ? item.amount0Out
            : item.amount1Out
          : item.amount0 > 0
          ? item.amount0
          : Math.abs(item.amount1);
        const amount1 = item.isV2
          ? item.amount0In > 0
            ? item.amount0In
            : item.amount1In
          : item.amount0 > 0
          ? Math.abs(item.amount1)
          : Math.abs(item.amount0);
        const token0 = (item.isV2
        ? item.amount0Out > 0
        : item.amount0 > 0)
          ? item.pair.token0
          : item.pair.token1;
        const token1 = (item.isV2
        ? item.amount0Out > 0
        : item.amount0 > 0)
          ? item.pair.token1
          : item.pair.token0;
        return {
          ...item,
          amount0,
          amount1,
          pair: { token0, token1 },
          type: TxnType.SWAP,
        };
      });
      const burns = data.tokenTransactions.burns.map((item: any) => {
        return { ...item, type: TxnType.REMOVE };
      });
      return mints.concat(swaps).concat(burns);
    } else {
      return null;
    }
  }, [data]);

  const V2TokenInfo = ({ token, tokenPairs }: any) => {
    return (
      <>
        <Box width={1} className='panel' mt={4}>
          <Grid container>
            <Grid item xs={12} sm={12} md={6}>
              <AnalyticsTokenChart token={token} />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Box className={styles.analyticsDetailsInfo}>
                <Box>
                  <Box>
                    <span className='text-disabled'>{t('totalLiquidity')}</span>
                    <h5>${formatNumber(token.totalLiquidityUSD)}</h5>
                  </Box>
                  <Box textAlign='right'>
                    <span className='text-disabled'>{t('7dTradingVol')}</span>
                    <h5>${formatNumber(token.oneWeekVolumeUSD)}</h5>
                  </Box>
                </Box>
                <Box>
                  <Box>
                    <span className='text-disabled'>{t('24hTradingVol1')}</span>
                    <h5>${formatNumber(token.oneDayVolumeUSD)}</h5>
                  </Box>
                  <Box textAlign='right'>
                    <span className='text-disabled'>{t('24hFees')}</span>
                    <h5>
                      $
                      {formatNumber(
                        token.oneDayVolumeUSD * GlobalConst.utils.FEEPERCENT,
                      )}
                    </h5>
                  </Box>
                </Box>
                <Box>
                  <Box>
                    <span className='text-disabled'>
                      {t('contractAddress')}
                    </span>
                    <h5 className='text-primary'>
                      {chainId ? (
                        <a
                          href={getEtherscanLink(chainId, token.id, 'address')}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary no-decoration'
                        >
                          {shortenAddress(token.id)}
                        </a>
                      ) : (
                        shortenAddress(token.id)
                      )}
                    </h5>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box width={1} mt={5}>
          <p>
            {token.symbol} {t('pools')}
          </p>
        </Box>
        <Box width={1} className='panel' mt={4}>
          {tokenPairs ? (
            <PairTable data={tokenPairs} />
          ) : (
            <Skeleton variant='rectangular' width='100%' height={150} />
          )}
        </Box>
      </>
    );
  };

  const V3TokenInfo = ({ token, tokenTransactions }: any) => (
    <>
      <Box width={1}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={3}>
            <Box className={`panel ${styles.analyticsDetailsInfoV3}`}>
              <Box>
                <span className='text-disabled'>{t('tvl')}</span>
                <Box className='flex flex-wrap items-center'>
                  <Box mr='6px'>
                    <h5>${formatNumber(token.tvlUSD)}</h5>
                  </Box>
                  <small
                    className={`${styles.priceChangeWrapper} ${getPriceClass(
                      Number(token.tvlUSDChange) || 0,
                    )}`}
                  >
                    {getFormattedPercent(token.tvlUSDChange || 0)}
                  </small>
                </Box>
              </Box>
              <Box>
                <span className='text-disabled'>{t('24hTradingVol1')}</span>
                <Box className='flex flex-wrap items-center'>
                  <Box mr='6px'>
                    <h5>${formatNumber(token.oneDayVolumeUSD)}</h5>
                  </Box>
                  <small
                    className={`${styles.priceChangeWrapper} ${getPriceClass(
                      Number(token.volumeChangeUSD) || 0,
                    )}`}
                  >
                    {getFormattedPercent(token.volumeChangeUSD || 0)}
                  </small>
                </Box>
              </Box>
              <Box>
                <span className='text-disabled'>{t('7dTradingVol')}</span>
                <h5>${formatNumber(token.oneWeekVolumeUSD)}</h5>
              </Box>
              <Box>
                <span className='text-disabled'>{t('24hFees')}</span>
                <h5>${formatNumber(token.feesUSD)}</h5>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={9}>
            <Box className='panel' mt={2} mb={2} height={'100%'}>
              <AnalyticsTokenChart token={token} />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box width={1} mt={5}>
        <p>
          {token.symbol} {t('pools')}
        </p>
      </Box>
      <Box width={1} className='panel' mt={4}>
        {data && data.tokenPairs ? (
          <PairTable data={data.tokenPairs} />
        ) : (
          <Skeleton variant='rectangular' width='100%' height={150} />
        )}
      </Box>
      <Box width={1} mt={5}>
        <p>
          {token.symbol} {t('transactions')}
        </p>
      </Box>
      <Box width={1} className='panel' mt={4}>
        {tokenTransactions ? (
          <TransactionsTable data={tokenTransactions} />
        ) : (
          <Skeleton variant='rectangular' width='100%' height={150} />
        )}
      </Box>
    </>
  );

  return (
    <>
      <AnalyticsHeader type='token' data={data?.token} address={tokenAddress} />
      {isLoading ? (
        <Skeleton width='100%' height={100} />
      ) : data && data.token ? (
        <>
          <Box width={1} className='flex flex-wrap justify-between'>
            <Box display='flex'>
              <CurrencyLogo currency={currency} size='32px' />
              <Box ml={1.5}>
                <Box className='flex items-center'>
                  <Box className='flex items-end' mr={0.5}>
                    <p className={styles.heading1}>{data.token.name} </p>
                    <p className={styles.heading2}>({data.token.symbol})</p>
                  </Box>
                  {bookmarkTokens.includes(data.token.id) ? (
                    <StarChecked
                      onClick={() => removeBookmarkToken(data.token.id)}
                    />
                  ) : (
                    <StarUnchecked
                      onClick={() => addBookmarkToken(data.token.id)}
                    />
                  )}
                </Box>
                <Box mt={1.25} className='flex items-center'>
                  <h5>${formatNumber(data.token.priceUSD)}</h5>
                  <Box
                    className={`${styles.priceChangeWrapper} ${tokenPercentClass}`}
                    ml={2}
                  >
                    <small>
                      {getFormattedPercent(Number(data.token.priceChangeUSD))}
                    </small>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box my={2} display='flex'>
              <Box
                className={`${styles.button} border-primary`}
                mr={1.5}
                onClick={() => {
                  router.push(
                    `/pools${version === 'v2' ? '/v2' : '/v3'}?currency0=${
                      data.token.id
                    }&currency1=ETH`,
                  );
                }}
              >
                <small>{t('addLiquidity')}</small>
              </Box>
              <Box
                className={`${styles.button} ${styles.filledButton}`}
                onClick={() => {
                  router.push(
                    `/swap${version === 'v2' ? '/v2' : ''}?currency0=${
                      data.token.id
                    }&currency1=ETH`,
                  );
                }}
              >
                <small>{t('swap')}</small>
              </Box>
            </Box>
          </Box>
          {version === 'v2' ? (
            <V2TokenInfo token={data.token} tokenPairs={data.tokenPairs} />
          ) : (
            <V3TokenInfo
              token={data.token}
              tokenTransactions={tokenTransactionsList}
            />
          )}
        </>
      ) : (
        <Box py={4}>
          <h5>{t('tokenNotExist')}</h5>
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

export default React.memo(AnalyticsTokenDetails);
