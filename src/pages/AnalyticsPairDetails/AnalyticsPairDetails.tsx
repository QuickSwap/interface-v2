import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useRouteMatch, Link } from 'react-router-dom';
import { Box, Grid, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { ChainId, Token } from '@uniswap/sdk';
import {
  shortenAddress,
  getEtherscanLink,
  getPairTransactions,
  getEthPrice,
  getBulkPairData,
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

const AnalyticsPairDetails: React.FC = () => {
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const history = useHistory();
  const match = useRouteMatch<{ id: string }>();
  const pairAddress = match.params.id;
  const [pairData, setPairData] = useState<any>(null);
  const [pairTransactions, setPairTransactions] = useState<any>(null);
  const pairTransactionsList = useMemo(() => {
    if (pairTransactions) {
      const mints = pairTransactions.mints.map((item: any) => {
        return { ...item, type: TxnType.ADD };
      });
      const swaps = pairTransactions.swaps.map((item: any) => {
        const amount0 = item.amount0Out > 0 ? item.amount0Out : item.amount1Out;
        const amount1 = item.amount0In > 0 ? item.amount0In : item.amount1In;
        const token0 =
          item.amount0Out > 0 ? item.pair.token0 : item.pair.token1;
        const token1 =
          item.amount0Out > 0 ? item.pair.token1 : item.pair.token0;
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
  const { chainId } = useActiveWeb3React();
  const currency0 = pairData
    ? new Token(
        ChainId.MATIC,
        getAddress(pairData.token0.id),
        pairData.token0.decimals,
      )
    : undefined;
  const currency1 = pairData
    ? new Token(
        ChainId.MATIC,
        getAddress(pairData.token1.id),
        pairData.token1.decimals,
      )
    : undefined;

  const token0Rate =
    pairData && pairData.reserve0 && pairData.reserve1
      ? Number(pairData.reserve1) / Number(pairData.reserve0) >= 0.0001
        ? (Number(pairData.reserve1) / Number(pairData.reserve0)).toFixed(
            Number(pairData.reserve1) / Number(pairData.reserve0) > 1 ? 2 : 4,
          )
        : '< 0.0001'
      : '-';
  const token1Rate =
    pairData && pairData.reserve0 && pairData.reserve1
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
  const fees =
    pairData && (pairData.oneDayVolumeUSD || pairData.oneDayVolumeUSD === 0)
      ? usingUtVolume
        ? (
            Number(pairData.oneDayVolumeUntracked) *
            GlobalConst.utils.FEEPERCENT
          ).toLocaleString()
        : (
            Number(pairData.oneDayVolumeUSD) * GlobalConst.utils.FEEPERCENT
          ).toLocaleString()
      : '-';

  useEffect(() => {
    async function checkEthPrice() {
      const [newPrice] = await getEthPrice();
      const pairInfo = await getBulkPairData([pairAddress], newPrice);
      if (pairInfo && pairInfo.length > 0) {
        setPairData(pairInfo[0]);
      }
    }
    async function fetchTransctions() {
      const transactions = await getPairTransactions(pairAddress);
      if (transactions) {
        setPairTransactions(transactions);
      }
    }
    checkEthPrice();
    fetchTransctions();
  }, [pairAddress]);

  return (
    <>
      <AnalyticsHeader type='pair' data={pairData} />
      {pairData ? (
        <>
          <Box
            width={1}
            display='flex'
            flexWrap='wrap'
            justifyContent='space-between'
          >
            <Box>
              <Box display='flex' alignItems='center'>
                <DoubleCurrencyLogo
                  currency0={currency0}
                  currency1={currency1}
                  size={32}
                />
                <Box ml={1}>
                  <h2>
                    <Link to={`/analytics/token/${pairData.token0.id}`}>
                      {pairData.token0.symbol}
                    </Link>{' '}
                    /{' '}
                    <Link to={`/analytics/token/${pairData.token1.id}`}>
                      {pairData.token1.symbol}
                    </Link>
                  </h2>
                </Box>
              </Box>
              <Box mt={2} display='flex'>
                <Box
                  paddingY={0.75}
                  paddingX={1.5}
                  borderRadius={20}
                  display='flex'
                  alignItems='center'
                  bgcolor={palette.grey.A700}
                >
                  <CurrencyLogo currency={currency0} size='16px' />
                  <small style={{ marginLeft: 6 }}>
                    1 {pairData.token0.symbol} = {token0Rate}{' '}
                    {pairData.token1.symbol}
                  </small>
                </Box>
                <Box
                  padding={0.75}
                  paddingX={1.5}
                  ml={2}
                  borderRadius={20}
                  display='flex'
                  alignItems='center'
                  bgcolor={palette.grey.A700}
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
                className='button'
                mr={1.5}
                border={`1px solid ${palette.primary.main}`}
                onClick={() => {
                  history.push(
                    `/pools?currency0=${pairData.token0.id}&currency1=${pairData.token1.id}`,
                  );
                }}
              >
                <small>Add Liquidity</small>
              </Box>
              <Box
                className='button filledButton'
                onClick={() => {
                  history.push(
                    `/swap?currency0=${pairData.token0.id}&currency1=${pairData.token1.id}`,
                  );
                }}
              >
                <small>Swap</small>
              </Box>
            </Box>
          </Box>
          <Box width={1} className='panel' mt={4}>
            <Grid container>
              <Grid item xs={12} sm={12} md={6}>
                <AnalyticsPairChart pairData={pairData} />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <Box
                  my={2}
                  height={1}
                  display='flex'
                  justifyContent='center'
                  alignItems='center'
                >
                  <Box
                    width={isMobile ? 1 : 0.8}
                    display='flex'
                    justifyContent='space-between'
                  >
                    <Box width={212}>
                      <Box>
                        <caption className='text-disabled'>
                          TOTAL TOKENS LOCKED
                        </caption>
                        <Box
                          mt={1.5}
                          bgcolor={palette.grey.A400}
                          borderRadius={8}
                          padding={1.5}
                        >
                          <Box
                            display='flex'
                            alignItems='center'
                            justifyContent='space-between'
                          >
                            <Box display='flex' alignItems='center'>
                              <CurrencyLogo currency={currency0} size='16px' />
                              <caption style={{ marginLeft: 6 }}>
                                {pairData.token0.symbol} :
                              </caption>
                            </Box>
                            <caption>
                              {Number(pairData.reserve0).toLocaleString()}
                            </caption>
                          </Box>
                          <Box
                            mt={1}
                            display='flex'
                            alignItems='center'
                            justifyContent='space-between'
                          >
                            <Box display='flex' alignItems='center'>
                              <CurrencyLogo currency={currency1} size='16px' />
                              <caption style={{ marginLeft: 6 }}>
                                {pairData.token1.symbol} :
                              </caption>
                            </Box>
                            <caption>
                              {Number(pairData.reserve1).toLocaleString()}
                            </caption>
                          </Box>
                        </Box>
                      </Box>
                      <Box mt={4}>
                        <caption className='text-disabled'>
                          7d Trading Vol
                        </caption>
                        <p className={isMobile ? '' : 'h5'}>
                          ${pairData.oneWeekVolumeUSD.toLocaleString()}
                        </p>
                      </Box>
                      <Box mt={4}>
                        <caption className='text-disabled'>24h FEES</caption>
                        <p className={isMobile ? '' : 'h5'}>${fees}</p>
                      </Box>
                    </Box>
                    <Box width={140}>
                      <caption className='text-disabled'>
                        TOTAL LIQUIDITY
                      </caption>
                      <p className={isMobile ? '' : 'h5'}>
                        $
                        {Number(
                          pairData.reserveUSD
                            ? pairData.reserveUSD
                            : pairData.trackedReserveUSD,
                        ).toLocaleString()}
                      </p>
                      <Box mt={4}>
                        <caption className='text-disabled'>
                          24h Trading Vol
                        </caption>
                        <p className={isMobile ? '' : 'h5'}>
                          ${pairData.oneDayVolumeUSD.toLocaleString()}
                        </p>
                      </Box>
                      <Box mt={4}>
                        <caption className='text-disabled'>
                          Contract Address
                        </caption>
                        <h5 className='text-primary'>
                          {chainId ? (
                            <a
                              href={getEtherscanLink(
                                chainId,
                                pairData.id,
                                'address',
                              )}
                              target='_blank'
                              rel='noopener noreferrer'
                              style={{
                                color: palette.primary.main,
                                textDecoration: 'none',
                              }}
                            >
                              {shortenAddress(pairData.id)}
                            </a>
                          ) : (
                            shortenAddress(pairData.id)
                          )}
                        </h5>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box width={1} mt={5}>
            <p>Transactions</p>
          </Box>
          <Box width={1} className='panel' mt={4}>
            {pairTransactionsList ? (
              <TransactionsTable data={pairTransactionsList} />
            ) : (
              <Skeleton variant='rect' width='100%' height={150} />
            )}
          </Box>
        </>
      ) : (
        <Skeleton width='100%' height={100} />
      )}
    </>
  );
};

export default AnalyticsPairDetails;
