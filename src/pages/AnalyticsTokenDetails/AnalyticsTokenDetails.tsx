import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Box, Grid, Skeleton } from 'theme/components';
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
import { GlobalConst, TxnType } from 'constants/index';
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
        updateTokenPairs(data);
        try {
          const aprs = await getPairsAPR(data.map((item: any) => item.id));

          updateTokenPairs(
            data.map((item: any, ind: number) => {
              return {
                ...item,
                apr: aprs[ind].apr,
                farmingApr: aprs[ind].farmingApr,
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
    if (token && (version === 'v2' ? tokenPairs : tokenTransactions)) {
      dispatch(setAnalyticsLoaded(true));
    }
  }, [token, tokenPairs, tokenTransactions, version, dispatch]);

  const tokenPercentClass = getPriceClass(
    token ? Number(token.priceChangeUSD) : 0,
  );

  const V2TokenInfo = ({ token, tokenPairs }: any) => {
    return (
      <>
        <Box width='100%' className='panel' margin='32px 0 0'>
          <Grid container>
            <Grid item xs={12} sm={12} md={6}>
              <Box width='100%'>
                <AnalyticsTokenChart token={token} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Box className='analyticsDetailsInfo' width='100%'>
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
        <Box width='100%' margin='40px 0 0'>
          <p>
            {token.symbol} {t('pools')}
          </p>
        </Box>
        <Box width='100%' margin='32px 0 0' className='panel'>
          {tokenPairs ? (
            <PairTable data={tokenPairs} />
          ) : (
            <Skeleton variant='rect' width='100%' height='150px' />
          )}
        </Box>
      </>
    );
  };

  const V3TokenInfo = ({ token, tokenTransactions }: any) => (
    <>
      <Box width='100%'>
        <Grid container spacing={2}>
          <Grid item spacing={2} xs={12} sm={12} md={3}>
            <Box className='panel analyticsDetailsInfoV3' width='100%'>
              <Box>
                <span className='text-disabled'>{t('tvl')}</span>
                <Box className='flex items-center flex-wrap'>
                  <Box margin='0 6px 0 0'>
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
                  <Box margin='0 6px 0 0'>
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
          <Grid item spacing={2} xs={12} sm={12} md={9}>
            <Box className='panel' margin='16px 0' width='100%'>
              <AnalyticsTokenChart token={token} />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box width='100%' margin='40px 0 0'>
        <p>
          {token.symbol} {t('pools')}
        </p>
      </Box>
      <Box width='100%' className='flex'>
        <Box width='100%' margin='32px 0 0' className='panel'>
          {tokenPairs ? (
            <PairTable data={tokenPairs} />
          ) : (
            <Skeleton variant='rect' width='100%' height='150px' />
          )}
        </Box>
      </Box>
      <Box width='100%' margin='40px 0 0'>
        <p>
          {token.symbol} {t('transactions')}
        </p>
      </Box>
      <Box width='100%' className='flex'>
        <Box width='100%' margin='32px 0 0' className='panel'>
          {tokenTransactions ? (
            <TransactionsTable data={tokenTransactions} />
          ) : (
            <Skeleton variant='rect' width='100%' height='150px' />
          )}
        </Box>
      </Box>
    </>
  );

  return (
    <>
      <AnalyticsHeader type='token' data={token} address={tokenAddress} />
      {token ? (
        <>
          <Box width='100%' className='flex flex-wrap justify-between'>
            <Box className='flex'>
              <CurrencyLogo currency={currency} size='32px' />
              <Box margin='0 0 0 12px'>
                <Box className='flex items-center'>
                  <Box className='flex items-end' margin='0 4px 0 0'>
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
                <Box margin='12px 0 0' className='flex items-center'>
                  <h5>${formatNumber(token.priceUSD)}</h5>
                  <Box
                    className={`priceChangeWrapper ${tokenPercentClass}`}
                    margin='0 0 0 16px'
                  >
                    <small>
                      {getFormattedPrice(Number(token.priceChangeUSD))}%
                    </small>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box margin='16px 0' className='flex'>
              <Box
                className='button border-primary'
                margin='0 12px 0 0'
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
        <Skeleton width='100%' height='100px' />
      ) : (
        <Box padding='32px 0'>
          <h5>{t('tokenNotExist')}</h5>
        </Box>
      )}
    </>
  );
};

export default AnalyticsTokenDetails;
