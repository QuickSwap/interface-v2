import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useRouteMatch, Link } from 'react-router-dom';
import { Box, Grid, Skeleton } from 'theme/components';
import { ChainId, Token } from '@uniswap/sdk';
import {
  shortenAddress,
  getEtherscanLink,
  getPairTransactions,
  getBulkPairData,
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
import 'pages/styles/analytics.scss';
import AnalyticsHeader from 'pages/AnalyticsPage/AnalyticsHeader';
import AnalyticsPairChart from './AnalyticsPairChart';
import { useTranslation } from 'react-i18next';
import { useEthPrice, useIsV2 } from 'state/application/hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getPairInfoV3, getPairTransactionsV3 } from 'utils/v3-graph';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';
import { ArrowUpRight } from 'react-feather';

const AnalyticsPairDetails: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch<{ id: string }>();
  const pairAddress = match.params.id;
  const tokenMap = useSelectedTokenList();
  const [dataLoading, setDataLoading] = useState(false);
  const [pairData, setPairData] = useState<any>(null);
  const [pairTransactions, setPairTransactions] = useState<any>(null);

  const { isV2 } = useIsV2();
  const version = useMemo(() => `${!isV2 ? `v3` : 'v2'}`, [isV2]);

  const pairTransactionsList = useMemo(() => {
    if (pairTransactions) {
      const mints = pairTransactions.mints.map((item: any) => {
        return { ...item, type: TxnType.ADD };
      });
      const swaps = pairTransactions.swaps.map((item: any) => {
        const amount0 = isV2
          ? item.amount0Out > 0
            ? item.amount0Out
            : item.amount1Out
          : item.amount0 > 0
          ? item.amount0
          : Math.abs(item.amount1);
        const amount1 = isV2
          ? item.amount0In > 0
            ? item.amount0In
            : item.amount1In
          : item.amount0 > 0
          ? Math.abs(item.amount1)
          : Math.abs(item.amount0);
        const token0 = (isV2
        ? item.amount0Out > 0
        : item.amount0 > 0)
          ? item.pair.token0
          : item.pair.token1;
        const token1 = (isV2
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
      const burns = pairTransactions.burns.map((item: any) => {
        return { ...item, type: TxnType.REMOVE };
      });
      return mints.concat(swaps).concat(burns);
    } else {
      return null;
    }
  }, [pairTransactions, isV2]);
  const { chainId } = useActiveWeb3React();
  const currency0 = pairData
    ? getTokenFromAddress(pairData.token0.id, ChainId.MATIC, tokenMap, [
        new Token(
          ChainId.MATIC,
          getAddress(pairData.token0.id),
          pairData.token0.decimals,
        ),
      ])
    : undefined;
  const currency1 = pairData
    ? getTokenFromAddress(pairData.token1.id, ChainId.MATIC, tokenMap, [
        new Token(
          ChainId.MATIC,
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
    : '-';
  const { ethPrice } = useEthPrice();

  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchPairData() {
      try {
        if (!isV2) {
          const pairInfo = await getPairInfoV3(pairAddress);
          if (pairInfo && pairInfo.length > 0) {
            setPairData(pairInfo[0]);
          }
          setDataLoading(false);
        } else {
          if (ethPrice.price) {
            const pairInfo = await getBulkPairData(
              [pairAddress],
              ethPrice.price,
            );
            if (pairInfo && pairInfo.length > 0) {
              setPairData(pairInfo[0]);
            }
            setDataLoading(false);
          }
        }
      } catch (e) {
        setDataLoading(false);
      }
    }
    async function fetchTransctions() {
      const pairTransactionsFn = !isV2
        ? getPairTransactionsV3(pairAddress)
        : getPairTransactions(pairAddress);

      pairTransactionsFn.then((transactions) => {
        if (transactions) {
          setPairTransactions(transactions);
        }
      });
    }
    if (isV2 !== undefined && ethPrice.price) {
      fetchPairData();
      fetchTransctions();
    }
  }, [pairAddress, ethPrice.price, isV2]);

  useEffect(() => {
    setDataLoading(true);
    setPairData(null);
    setPairTransactions(null);
  }, [pairAddress, isV2]);

  useEffect(() => {
    //TODO v2 Subgraph for txs is not working, for now always true
    if (pairData && (!isV2 ? pairTransactions : true)) {
      dispatch(setAnalyticsLoaded(true));
    }
  }, [pairData, pairTransactions, isV2, dispatch]);

  const PairInfo = () => (
    <Box width='100%' margin='32px 0 0'>
      <Grid container spacing={2}>
        <Grid item spacing={2} xs={12} sm={12} md={3}>
          <Box className='panel analyticsDetailsInfoV3' width='100%'>
            <Box>
              <span className='text-disabled'>{t('totalTokensLocked')}</span>
              <Box
                margin='12px 0 0'
                className='bg-gray2'
                borderRadius='8px'
                padding='12px'
              >
                <Box
                  className='flex items-center justify-between cursor-pointer'
                  onClick={() => {
                    history.push(
                      `/analytics/${version}/token/${pairData.token0.id}`,
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
                  margin='8px 0 0'
                  className='flex items-center justify-between cursor-pointer'
                  onClick={() => {
                    history.push(
                      `/analytics/${version}/token/${pairData.token1.id}`,
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
            <Box width='140px'>
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
            <Box margin='32px 0 0'>
              <span className='text-disabled'>{t('24hTradingVol1')}</span>
              <h6>${formatNumber(pairData.oneDayVolumeUSD)}</h6>
            </Box>
            <Box margin='32px 0 0'>
              <span className='text-disabled'>{t('24hFees')}</span>
              <h6>${fees}</h6>
            </Box>
            <Box margin='32px 0 0'>
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
                      <ArrowUpRight />
                    </Box>
                  </a>
                ) : (
                  shortenAddress(pairData.id)
                )}
              </h6>
            </Box>
          </Box>
        </Grid>
        <Grid item spacing={2} xs={12} sm={12} md={9}>
          <Box className='panel' margin='16px 0' width='100%'>
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
          <Box width='100%' className='flex flex-wrap justify-between'>
            <Box>
              <Box className='flex items-center'>
                <DoubleCurrencyLogo
                  currency0={currency0}
                  currency1={currency1}
                  size={32}
                />
                <Box margin='0 0 0 8px'>
                  <p className='heading1'>
                    <Link
                      to={`/analytics/${version}/token/${pairData.token0.id}`}
                    >
                      {pairData.token0.symbol}
                    </Link>{' '}
                    /{' '}
                    <Link
                      to={`/analytics/${version}/token/${pairData.token1.id}`}
                    >
                      {pairData.token1.symbol}
                    </Link>
                  </p>
                </Box>
                {!isV2 && (
                  <Box
                    margin='0 0 0 16px'
                    padding='4px 8px'
                    borderRadius='6px'
                    className='text-primaryText bg-gray30'
                  >
                    {pairData.fee / 10000}% Fee
                  </Box>
                )}
              </Box>
              <Box margin='16px 0 0' className='flex'>
                <Box
                  className='analyticsPairRate'
                  onClick={() => {
                    history.push(
                      `/analytics/${version}/token/${pairData.token0.id}`,
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
                  margin='0 0 0 8px'
                  className='analyticsPairRate'
                  onClick={() => {
                    history.push(
                      `/analytics/${version}/token/${pairData.token1.id}`,
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
            <Box margin='16px 0' className='flex'>
              <Box
                className='button border-primary'
                margin='0 12px 0 0'
                onClick={() => {
                  history.push(
                    `/pools${isV2 ? '/v2' : '/v3'}?currency0=${
                      pairData.token0.id
                    }&currency1=${pairData.token1.id}`,
                  );
                }}
              >
                <small>{t('addLiquidity')}</small>
              </Box>
              <Box
                className='button filledButton'
                onClick={() => {
                  history.push(
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
          <Box width='100%' margin='40px 0 0'>
            <p>{t('transactions')}</p>
          </Box>
          <Box width='100%' className='flex'>
            <Box width='100%' className='panel' margin='32px 0 0'>
              {pairTransactionsList ? (
                <TransactionsTable data={pairTransactionsList} />
              ) : (
                <Skeleton variant='rect' width='100%' height='150px' />
              )}
            </Box>
          </Box>
        </>
      ) : dataLoading ? (
        <Skeleton width='100%' height='100px' />
      ) : (
        <Box padding='32px 0'>
          <h5>{t('pairNotExist')}</h5>
        </Box>
      )}
    </>
  );
};

export default AnalyticsPairDetails;
