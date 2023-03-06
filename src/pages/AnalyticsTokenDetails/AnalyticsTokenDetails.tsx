import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Box, Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { ChainId, Token } from '@uniswap/sdk';
import {
  shortenAddress,
  getEtherscanLink,
  getFormattedPrice,
  getPriceClass,
  formatNumber,
  getTokenInfo,
  getTokenPairs2,
  getBulkPairData,
  getTokenFromAddress,
  getGammaRewards,
} from 'utils';
import { useActiveWeb3React } from 'hooks';
import { CurrencyLogo, PairTable, TransactionsTable } from 'components';
import {
  useBookmarkTokens,
  useEthPrice,
  useMaticPrice,
} from 'state/application/hooks';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';
import { GammaPairs, GlobalConst, TxnType } from 'constants/index';
import AnalyticsHeader from 'pages/AnalyticsPage/AnalyticsHeader';
import AnalyticsTokenChart from './AnalyticsTokenChart';
import { useTranslation } from 'react-i18next';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getAddress } from 'ethers/lib/utils';
import {
  getPairsAPR,
  getTokenInfoTotal,
  getTokenInfoV3,
  getTokenTransactionsTotal,
  getTokenTransactionsV3,
  getTopPairsTotalByToken,
  getTopPairsV3ByToken,
} from 'utils/v3-graph';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';
import { useParams } from 'react-router-dom';

const AnalyticsTokenDetails: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const match = useRouteMatch<{ id: string }>();
  const tokenAddress = match.params.id.toLowerCase();
  const [loadingData, setLoadingData] = useState(false);
  const [token, setToken] = useState<any>(null);
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const currency = token
    ? getTokenFromAddress(tokenAddress, chainId ?? ChainId.MATIC, tokenMap, [
        new Token(ChainId.MATIC, getAddress(token.id), token.decimals),
      ])
    : undefined;
  const [tokenPairs, updateTokenPairs] = useState<any>(null);
  const [tokenTransactions, updateTokenTransactions] = useState<any>(null);
  const {
    bookmarkTokens,
    addBookmarkToken,
    removeBookmarkToken,
  } = useBookmarkTokens();
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();

  const dispatch = useDispatch();

  const params: any = useParams();
  const version = params && params.version ? params.version : 'total';

  const tokenTransactionsList = useMemo(() => {
    if (tokenTransactions) {
      const mints = tokenTransactions.mints.map((item: any) => {
        return { ...item, type: TxnType.ADD };
      });
      const swaps = tokenTransactions.swaps.map((item: any) => {
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
      const burns = tokenTransactions.burns.map((item: any) => {
        return { ...item, type: TxnType.REMOVE };
      });
      return mints.concat(swaps).concat(burns);
    } else {
      return null;
    }
  }, [tokenTransactions]);

  useEffect(() => {
    async function fetchTokenInfo() {
      try {
        if (version === 'v3') {
          if (maticPrice.price && maticPrice.oneDayPrice) {
            const tokenInfo = await getTokenInfoV3(
              maticPrice.price,
              maticPrice.oneDayPrice,
              tokenAddress,
            );
            if (tokenInfo) {
              setToken(tokenInfo[0] || tokenInfo);
            }
            setLoadingData(false);
          }
        } else if (version === 'v2') {
          if (ethPrice.price && ethPrice.oneDayPrice) {
            const tokenInfo = await getTokenInfo(
              ethPrice.price,
              ethPrice.oneDayPrice,
              tokenAddress,
            );
            if (tokenInfo) {
              setToken(tokenInfo[0] || tokenInfo);
            }
            setLoadingData(false);
          }
        } else {
          if (
            ethPrice.price &&
            ethPrice.oneDayPrice &&
            maticPrice.price &&
            maticPrice.oneDayPrice
          ) {
            const tokenInfo = await getTokenInfoTotal(
              maticPrice.price,
              maticPrice.oneDayPrice,
              ethPrice.price,
              ethPrice.oneDayPrice,
              tokenAddress,
            );
            if (tokenInfo) {
              setToken(tokenInfo[0] || tokenInfo);
            }
            setLoadingData(false);
          }
        }
      } catch (e) {
        setLoadingData(false);
      }
    }
    async function fetchTransactions() {
      if (version === 'total') {
        getTokenTransactionsTotal(tokenAddress).then((transactions) => {
          if (transactions) {
            updateTokenTransactions(transactions);
          }
        });
      } else {
        getTokenTransactionsV3(tokenAddress).then((transactions) => {
          if (transactions) {
            updateTokenTransactions(transactions);
          }
        });
      }
    }
    async function fetchPairs() {
      const tokenPairs = await getTokenPairs2(tokenAddress);
      const formattedPairs = tokenPairs
        ? tokenPairs.map((pair: any) => {
            return pair.id;
          })
        : [];
      const pairData = await getBulkPairData(formattedPairs, ethPrice.price);
      if (pairData) {
        updateTokenPairs(pairData);
      }
    }
    async function fetchPairsV3() {
      let tokenPairs;
      if (version === 'total') {
        tokenPairs = await getTopPairsTotalByToken(tokenAddress);
      } else {
        tokenPairs = await getTopPairsV3ByToken(tokenAddress);
      }
      if (tokenPairs) {
        const data = tokenPairs.filter((item: any) => !!item);
        try {
          const aprs = await getPairsAPR(data.map((item: any) => item.id));
          const gammaRewards = await getGammaRewards(chainId);

          updateTokenPairs(
            data.map((item: any, ind: number) => {
              const gammaPairs =
                GammaPairs[
                  item.token0.id.toLowerCase() +
                    '-' +
                    item.token1.id.toLowerCase()
                ];
              const gammaFarmAPRs = gammaPairs
                ? gammaPairs.map((pair) => {
                    return {
                      title: pair.title,
                      apr:
                        gammaRewards &&
                        gammaRewards[pair.address] &&
                        gammaRewards[pair.address.toLowerCase()]['apr']
                          ? Number(
                              gammaRewards[pair.address.toLowerCase()]['apr'],
                            ) * 100
                          : undefined,
                    };
                  })
                : [];
              const quickFarmingAPR = aprs[ind].farmingApr;
              const farmingApr = Math.max(
                quickFarmingAPR ?? 0,
                ...gammaFarmAPRs.map((item) => Number(item.apr ?? 0)),
              );
              return {
                ...item,
                apr: aprs[ind].apr,
                farmingApr,
                quickFarmingAPR,
                gammaFarmAPRs,
              };
            }),
          );
        } catch (e) {
          console.log(e);
        }
      }
    }
    fetchTokenInfo();
    if (version === 'v2') {
      if (ethPrice.price) {
        fetchPairs();
      }
    } else {
      fetchPairsV3();
      fetchTransactions();
    }
  }, [
    tokenAddress,
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
    version,
  ]);

  useEffect(() => {
    setLoadingData(true);
    setToken(null);
    updateTokenPairs(null);
    updateTokenTransactions(null);
  }, [tokenAddress, version]);

  useEffect(() => {
    if (!loadingData) {
      dispatch(setAnalyticsLoaded(true));
    } else {
      dispatch(setAnalyticsLoaded(false));
    }
  }, [loadingData, dispatch]);

  const tokenPercentClass = getPriceClass(
    token ? Number(token.priceChangeUSD) : 0,
  );

  const V2TokenInfo = ({ token, tokenPairs }: any) => {
    return (
      <>
        <Box width={1} className='panel' mt={4}>
          <Grid container>
            <Grid item xs={12} sm={12} md={6}>
              <AnalyticsTokenChart token={token} />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Box className='analyticsDetailsInfo'>
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
            <Skeleton variant='rect' width='100%' height={150} />
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
            <Box className='panel analyticsDetailsInfoV3'>
              <Box>
                <span className='text-disabled'>{t('tvl')}</span>
                <Box className='flex items-center flex-wrap'>
                  <Box mr='6px'>
                    <h5>${formatNumber(token.tvlUSD)}</h5>
                  </Box>
                  <small
                    className={`priceChangeWrapper ${getPriceClass(
                      Number(token.tvlUSDChange) || 0,
                    )}`}
                  >
                    {getFormattedPrice(token.tvlUSDChange || 0)}%
                  </small>
                </Box>
              </Box>
              <Box>
                <span className='text-disabled'>{t('24hTradingVol1')}</span>
                <Box className='flex items-center flex-wrap'>
                  <Box mr='6px'>
                    <h5>${formatNumber(token.oneDayVolumeUSD)}</h5>
                  </Box>
                  <small
                    className={`priceChangeWrapper ${getPriceClass(
                      Number(token.volumeChangeUSD) || 0,
                    )}`}
                  >
                    {getFormattedPrice(token.volumeChangeUSD || 0)}%
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
        {tokenPairs ? (
          <PairTable data={tokenPairs} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
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
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </>
  );

  return (
    <>
      <AnalyticsHeader type='token' data={token} address={tokenAddress} />
      {token ? (
        <>
          <Box width={1} className='flex flex-wrap justify-between'>
            <Box display='flex'>
              <CurrencyLogo currency={currency} size='32px' />
              <Box ml={1.5}>
                <Box className='flex items-center'>
                  <Box className='flex items-end' mr={0.5}>
                    <p className='heading1'>{token.name} </p>
                    <p className='heading2'>({token.symbol})</p>
                  </Box>
                  {bookmarkTokens.includes(token.id) ? (
                    <StarChecked
                      onClick={() => removeBookmarkToken(token.id)}
                    />
                  ) : (
                    <StarUnchecked onClick={() => addBookmarkToken(token.id)} />
                  )}
                </Box>
                <Box mt={1.25} className='flex items-center'>
                  <h5>${formatNumber(token.priceUSD)}</h5>
                  <Box
                    className={`priceChangeWrapper ${tokenPercentClass}`}
                    ml={2}
                  >
                    <small>
                      {getFormattedPrice(Number(token.priceChangeUSD))}%
                    </small>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box my={2} display='flex'>
              <Box
                className='button border-primary'
                mr={1.5}
                onClick={() => {
                  history.push(
                    `/pools${version === 'v2' ? '/v2' : '/v3'}?currency0=${
                      token.id
                    }&currency1=ETH`,
                  );
                }}
              >
                <small>{t('addLiquidity')}</small>
              </Box>
              <Box
                className='button filledButton'
                onClick={() => {
                  history.push(
                    `/swap${version === 'v2' ? '/v2' : ''}?currency0=${
                      token.id
                    }&currency1=ETH`,
                  );
                }}
              >
                <small>{t('swap')}</small>
              </Box>
            </Box>
          </Box>
          {version === 'v2' ? (
            <V2TokenInfo token={token} tokenPairs={tokenPairs} />
          ) : (
            <V3TokenInfo
              token={token}
              tokenTransactions={tokenTransactionsList}
            />
          )}
        </>
      ) : loadingData ? (
        <Skeleton width='100%' height={100} />
      ) : (
        <Box py={4}>
          <h5>{t('tokenNotExist')}</h5>
        </Box>
      )}
    </>
  );
};

export default React.memo(AnalyticsTokenDetails);
