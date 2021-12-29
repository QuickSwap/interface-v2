import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Box, Typography, Grid, useMediaQuery } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { ChainId, Token } from '@uniswap/sdk';
import moment from 'moment';
import cx from 'classnames';
import { shortenAddress, getEtherscanLink, formatCompact } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { CurrencyLogo, PairTable, AreaChart } from 'components';
import { useBookmarkTokens } from 'state/application/hooks';
import {
  getTokenInfo,
  getEthPrice,
  getTokenPairs2,
  getTokenChartData,
  getBulkPairData,
} from 'utils';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';
import { getAddress } from '@ethersproject/address';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  panel: {
    background: palette.grey.A700,
    borderRadius: 20,
    padding: 24,
    [breakpoints.down('xs')]: {
      padding: 12,
    },
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    color: palette.text.hint,
    marginBottom: 50,
    '& svg': {
      width: 12,
      margin: '0 6px',
    },
  },
  link: {
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: palette.text.primary,
    lineHeight: 1,
    [breakpoints.down('xs')]: {
      fontSize: 22,
      fontWeight: 600,
    },
  },
  heading2: {
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 600,
    color: palette.text.hint,
    marginLeft: 6,
    [breakpoints.down('xs')]: {
      fontSize: 18,
    },
  },
  priceChangeWrapper: {
    height: 25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: '0 8px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    height: 40,
    padding: '0 28px',
    borderRadius: 10,
    color: palette.text.primary,
    cursor: 'pointer',
  },
  filledButton: {
    background: 'linear-gradient(279deg, rgb(0, 76, 230), rgb(61, 113, 255))',
  },
  chartType: {
    height: 20,
    padding: '0 6px',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
}));

const AnalyticsTokenDetails: React.FC = () => {
  const classes = useStyles();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const history = useHistory();
  const match = useRouteMatch<{ id: string }>();
  const tokenAddress = match.params.id;
  const [token, setToken] = useState<any>(null);
  const { chainId } = useActiveWeb3React();
  const currency = token
    ? new Token(ChainId.MATIC, getAddress(token.id), token.decimals)
    : undefined;
  const [tokenChartData, updateTokenChartData] = useState<any>(null);
  const [chartIndex, setChartIndex] = useState(0);
  const [tokenPairs, updateTokenPairs] = useState<any>(null);
  const {
    bookmarkTokens,
    addBookmarkToken,
    removeBookmarkToken,
  } = useBookmarkTokens();

  useEffect(() => {
    async function checkEthPrice() {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const tokenInfo = await getTokenInfo(newPrice, oneDayPrice, tokenAddress);
      if (tokenInfo) {
        setToken(tokenInfo[0]);
      }
    }
    checkEthPrice();
  }, [tokenAddress]);

  const chartData = useMemo(() => {
    if (tokenChartData) {
      return tokenChartData.map((item: any) =>
        chartIndex === 0
          ? Number(item.dailyVolumeUSD)
          : chartIndex === 1
          ? Number(item.totalLiquidityUSD)
          : Number(item.priceUSD),
      );
    } else {
      return null;
    }
  }, [tokenChartData, chartIndex]);

  const yAxisValues = useMemo(() => {
    if (chartData) {
      const minValue = Math.min(...chartData) * 0.99;
      const maxValue = Math.max(...chartData) * 1.01;
      const step = (maxValue - minValue) / 8;
      const values = [];
      for (let i = 0; i < 9; i++) {
        values.push(maxValue - i * step);
      }
      return values;
    } else {
      return undefined;
    }
  }, [chartData]);

  const chartDates = useMemo(() => {
    if (tokenChartData) {
      const dates: string[] = [];
      tokenChartData.forEach((value: any, ind: number) => {
        const month = moment(Number(value.date) * 1000).format('MMM');
        const monthLastDate =
          ind > 0
            ? moment(Number(tokenChartData[ind - 1].date) * 1000).format('MMM')
            : '';
        if (monthLastDate !== month) {
          dates.push(month);
        }
        const dateStr = moment(Number(value.date) * 1000).format('D');
        if (Number(dateStr) % 7 === 0) {
          dates.push(dateStr);
        }
      });
      return dates;
    } else {
      return [];
    }
  }, [tokenChartData]);

  const currentData = useMemo(
    () =>
      chartData && chartData.length > 1
        ? chartData[chartData.length - 1]
        : null,
    [chartData],
  );
  const currentPercent = useMemo(() => {
    if (chartData && chartData.length > 1) {
      const prevData = chartData[chartData.length - 2];
      const nowData = chartData[chartData.length - 1];
      return (nowData - prevData) / prevData;
    } else {
      return null;
    }
  }, [chartData]);

  useEffect(() => {
    async function fetchTokenChartData() {
      const chartData = await getTokenChartData(tokenAddress);
      if (
        chartData &&
        (!tokenChartData ||
          (tokenChartData.length > 0 && tokenChartData[0].id !== tokenAddress))
      ) {
        updateTokenChartData(chartData);
      }
    }
    async function fetchTokenPairs() {
      const [newPrice] = await getEthPrice();
      const tokenPairs = await getTokenPairs2(tokenAddress);
      const formattedPairs = tokenPairs
        ? tokenPairs.map((pair: any) => {
            return pair.id;
          })
        : [];
      const pairData = await getBulkPairData(formattedPairs, newPrice);
      if (pairData) {
        updateTokenPairs(pairData);
      }
    }
    fetchTokenPairs();
    fetchTokenChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateTokenPairs, updateTokenChartData, tokenAddress]);

  return (
    <>
      {token ? (
        <>
          <Box className={classes.breadcrumb} width={1}>
            <Typography
              variant='caption'
              className={classes.link}
              onClick={() => {
                history.push('/analytics');
              }}
            >
              Analytics
            </Typography>
            <ArrowForwardIos />
            <Typography
              variant='caption'
              className={classes.link}
              onClick={() => {
                history.push('/analytics?tabIndex=1');
              }}
            >
              Tokens
            </Typography>
            <ArrowForwardIos />
            <Typography variant='caption'>
              <span style={{ color: '#b6b9cc' }}>{token.symbol}</span>(
              {shortenAddress(token.id)})
            </Typography>
          </Box>
          <Box
            width={1}
            display='flex'
            flexWrap='wrap'
            justifyContent='space-between'
          >
            <Box display='flex'>
              <CurrencyLogo currency={currency} size='32px' />
              <Box ml={1.5}>
                <Box display='flex' alignItems='center'>
                  <Box display='flex' alignItems='flex-end' mr={0.5}>
                    <Typography className={classes.heading1}>
                      {token.name}{' '}
                    </Typography>
                    <Typography className={classes.heading2}>
                      ({token.symbol})
                    </Typography>
                  </Box>
                  {bookmarkTokens.includes(token.id) ? (
                    <StarChecked
                      onClick={() => removeBookmarkToken(token.id)}
                    />
                  ) : (
                    <StarUnchecked onClick={() => addBookmarkToken(token.id)} />
                  )}
                </Box>
                <Box mt={1.25} display='flex' alignItems='center'>
                  <Typography
                    variant='h5'
                    style={{ color: palette.text.primary }}
                  >
                    ${Number(token.priceUSD).toLocaleString()}
                  </Typography>
                  <Box
                    className={classes.priceChangeWrapper}
                    ml={2}
                    bgcolor={
                      Number(token.priceChangeUSD) > 0
                        ? 'rgba(15, 198, 121, 0.1)'
                        : Number(token.priceChangeUSD) < 0
                        ? 'rgba(255, 82, 82, 0.1)'
                        : 'rgba(99, 103, 128, 0.1)'
                    }
                    color={
                      Number(token.priceChangeUSD) > 0
                        ? 'rgb(15, 198, 121)'
                        : Number(token.priceChangeUSD) < 0
                        ? 'rgb(255, 82, 82)'
                        : 'rgb(99, 103, 128)'
                    }
                  >
                    <Typography variant='body2'>
                      {Number(token.priceChangeUSD) < 0.001 &&
                      Number(token.priceChangeUSD) > 0
                        ? '<0.001'
                        : Number(token.priceChangeUSD) > -0.001 &&
                          Number(token.priceChangeUSD) < 0
                        ? '>-0.001'
                        : (Number(token.priceChangeUSD) > 0 ? '+' : '') +
                          Number(token.priceChangeUSD).toLocaleString()}
                      %
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box my={2} display='flex'>
              <Box
                className={classes.button}
                mr={1.5}
                border={`1px solid ${palette.primary.main}`}
                onClick={() => {
                  history.push(`/pools?currency0=${token.id}&currency1=ETH`);
                }}
              >
                <Typography variant='body2'>Add Liquidity</Typography>
              </Box>
              <Box
                className={cx(classes.button, classes.filledButton)}
                onClick={() => {
                  history.push(`/swap?currency0=${token.id}&currency1=ETH`);
                }}
              >
                <Typography variant='body2'>Swap</Typography>
              </Box>
            </Box>
          </Box>
          <Box width={1} className={classes.panel} mt={4}>
            <Grid container>
              <Grid item xs={12} sm={12} md={6}>
                <Box
                  display='flex'
                  flexWrap='wrap'
                  justifyContent='space-between'
                >
                  <Box mt={1.5}>
                    <Typography variant='caption'>
                      {chartIndex === 0
                        ? 'Volume'
                        : chartIndex === 1
                        ? 'Liquidity'
                        : 'Price'}
                    </Typography>
                    <Box mt={1}>
                      {chartData ? (
                        <>
                          <Box display='flex' alignItems='center'>
                            <Typography
                              variant='h4'
                              style={{ color: palette.text.primary }}
                            >
                              $
                              {currentData > 100000
                                ? formatCompact(currentData)
                                : currentData.toLocaleString()}
                            </Typography>
                            <Box
                              className={classes.priceChangeWrapper}
                              ml={1}
                              bgcolor={
                                Number(currentPercent) > 0
                                  ? 'rgba(15, 198, 121, 0.1)'
                                  : Number(currentPercent) < 0
                                  ? 'rgba(255, 82, 82, 0.1)'
                                  : 'rgba(99, 103, 128, 0.1)'
                              }
                              color={
                                Number(currentPercent) > 0
                                  ? 'rgb(15, 198, 121)'
                                  : Number(currentPercent) < 0
                                  ? 'rgb(255, 82, 82)'
                                  : 'rgb(99, 103, 128)'
                              }
                            >
                              <Typography variant='body2'>
                                {Number(currentPercent) < 0.001 &&
                                Number(currentPercent) > 0
                                  ? '<0.001'
                                  : Number(currentPercent) > -0.001 &&
                                    Number(currentPercent) < 0
                                  ? '>-0.001'
                                  : (Number(currentPercent) > 0 ? '+' : '') +
                                    Number(currentPercent).toLocaleString()}
                                %
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant='caption'>
                              {moment().format('MMM DD, YYYY')}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Skeleton variant='rect' width='120px' height='30px' />
                      )}
                    </Box>
                  </Box>
                  <Box display='flex' mt={1.5}>
                    <Box
                      mr={1}
                      bgcolor={
                        chartIndex === 0 ? palette.grey.A400 : 'transparent'
                      }
                      className={classes.chartType}
                      onClick={() => setChartIndex(0)}
                    >
                      <Typography variant='caption'>Volume</Typography>
                    </Box>
                    <Box
                      mr={1}
                      bgcolor={
                        chartIndex === 1 ? palette.grey.A400 : 'transparent'
                      }
                      className={classes.chartType}
                      onClick={() => setChartIndex(1)}
                    >
                      <Typography variant='caption'>Liquidity</Typography>
                    </Box>
                    <Box
                      bgcolor={
                        chartIndex === 2 ? palette.grey.A400 : 'transparent'
                      }
                      className={classes.chartType}
                      onClick={() => setChartIndex(2)}
                    >
                      <Typography variant='caption'>Price</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box mt={2} width={1}>
                  {tokenChartData ? (
                    <AreaChart
                      data={chartData}
                      yAxisValues={yAxisValues}
                      dates={tokenChartData.map((value: any) => value.date)}
                      width='100%'
                      height={240}
                      categories={chartDates}
                    />
                  ) : (
                    <Skeleton variant='rect' width='100%' height={200} />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <Box
                  my={2}
                  height={1}
                  display='flex'
                  flexDirection='column'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Box
                    width={isMobile ? 1 : 0.8}
                    display='flex'
                    justifyContent='space-between'
                  >
                    <Box width={180}>
                      <Typography
                        variant='caption'
                        style={{ color: palette.text.disabled }}
                      >
                        TOTAL LIQUIDITY
                      </Typography>
                      <Typography variant={isMobile ? 'body1' : 'h5'}>
                        ${token.totalLiquidityUSD.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box width={140}>
                      <Typography
                        variant='caption'
                        style={{ color: palette.text.disabled }}
                      >
                        7d Trading Vol
                      </Typography>
                      <Typography variant={isMobile ? 'body1' : 'h5'}>
                        ${token.oneWeekVolumeUSD.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    width={isMobile ? 1 : 0.8}
                    mt={4}
                    display='flex'
                    justifyContent='space-between'
                  >
                    <Box width={180}>
                      <Typography
                        variant='caption'
                        style={{ color: palette.text.disabled }}
                      >
                        24h Trading Vol
                      </Typography>
                      <Typography variant={isMobile ? 'body1' : 'h5'}>
                        ${token.oneDayVolumeUSD.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box width={140}>
                      <Typography
                        variant='caption'
                        style={{ color: palette.text.disabled }}
                      >
                        24h FEES
                      </Typography>
                      <Typography variant={isMobile ? 'body1' : 'h5'}>
                        ${(token.oneDayVolumeUSD * 0.003).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    width={isMobile ? 1 : 0.8}
                    mt={4}
                    display='flex'
                    justifyContent='space-between'
                  >
                    <Box width={180}>
                      <Typography
                        variant='caption'
                        style={{ color: palette.text.disabled }}
                      >
                        Contract Address
                      </Typography>
                      <Typography
                        variant='h5'
                        style={{ color: palette.primary.main }}
                      >
                        {chainId ? (
                          <a
                            href={getEtherscanLink(
                              chainId,
                              token.id,
                              'address',
                            )}
                            target='_blank'
                            rel='noreferrer'
                            style={{
                              color: palette.primary.main,
                              textDecoration: 'none',
                            }}
                          >
                            {shortenAddress(token.id)}
                          </a>
                        ) : (
                          shortenAddress(token.id)
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box width={1} mt={5}>
            <Typography variant='body1'>{token.symbol} Pools</Typography>
          </Box>
          <Box width={1} className={classes.panel} mt={4}>
            {tokenPairs ? (
              <PairTable data={tokenPairs} />
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

export default AnalyticsTokenDetails;
