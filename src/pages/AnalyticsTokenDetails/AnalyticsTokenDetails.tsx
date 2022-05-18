import React, { useState, useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Box, Grid, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { ChainId, Token } from '@uniswap/sdk';
import {
  shortenAddress,
  getEtherscanLink,
  getFormattedPrice,
  getPriceClass,
  formatNumber,
} from 'utils';
import { useActiveWeb3React } from 'hooks';
import { CurrencyLogo, PairTable } from 'components';
import { useBookmarkTokens } from 'state/application/hooks';
import {
  getTokenInfo,
  getEthPrice,
  getTokenPairs2,
  getBulkPairData,
} from 'utils';
import { ReactComponent as StarChecked } from 'assets/images/StarChecked.svg';
import { ReactComponent as StarUnchecked } from 'assets/images/StarUnchecked.svg';
import { getAddress } from '@ethersproject/address';
import { GlobalConst } from 'constants/index';
import AnalyticsHeader from 'pages/AnalyticsPage/AnalyticsHeader';
import AnalyticsTokenChart from './AnalyticsTokenChart';

const AnalyticsTokenDetails: React.FC = () => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const history = useHistory();
  const match = useRouteMatch<{ id: string }>();
  const tokenAddress = match.params.id;
  const [token, setToken] = useState<any>(null);
  const { chainId } = useActiveWeb3React();
  const currency = token
    ? new Token(ChainId.MATIC, getAddress(token.id), token.decimals)
    : undefined;
  const [tokenPairs, updateTokenPairs] = useState<any>(null);
  const {
    bookmarkTokens,
    addBookmarkToken,
    removeBookmarkToken,
  } = useBookmarkTokens();

  useEffect(() => {
    async function fetchTokenInfo() {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const tokenInfo = await getTokenInfo(newPrice, oneDayPrice, tokenAddress);
      if (tokenInfo) {
        setToken(tokenInfo[0]);
      }
    }
    fetchTokenInfo();
  }, [tokenAddress]);

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateTokenPairs, tokenAddress]);

  const tokenPercentClass = getPriceClass(
    token ? Number(token.priceChangeUSD) : 0,
  );

  return (
    <>
      <AnalyticsHeader type='token' data={token} />
      {token ? (
        <>
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
                <Box mt={1.25} display='flex' alignItems='center'>
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
                  history.push(`/pools?currency0=${token.id}&currency1=ETH`);
                }}
              >
                <small>Add Liquidity</small>
              </Box>
              <Box
                className='button filledButton'
                onClick={() => {
                  history.push(`/swap?currency0=${token.id}&currency1=ETH`);
                }}
              >
                <small>Swap</small>
              </Box>
            </Box>
          </Box>
          <Box width={1} className='panel' mt={4}>
            <Grid container>
              <Grid item xs={12} sm={12} md={6}>
                <AnalyticsTokenChart token={token} />
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
                      <span className='text-disabled'>TOTAL LIQUIDITY</span>
                      <p className={isMobile ? '' : 'h5'}>
                        ${token.totalLiquidityUSD.toLocaleString()}
                      </p>
                    </Box>
                    <Box width={140}>
                      <span className='text-disabled'>7d Trading Vol</span>
                      <p className={isMobile ? '' : 'h5'}>
                        ${token.oneWeekVolumeUSD.toLocaleString()}
                      </p>
                    </Box>
                  </Box>
                  <Box
                    width={isMobile ? 1 : 0.8}
                    mt={4}
                    display='flex'
                    justifyContent='space-between'
                  >
                    <Box width={180}>
                      <span className='text-disabled'>24h Trading Vol</span>
                      <p className={isMobile ? '' : 'h5'}>
                        ${token.oneDayVolumeUSD.toLocaleString()}
                      </p>
                    </Box>
                    <Box width={140}>
                      <span className='text-disabled'>24h FEES</span>
                      <p className={isMobile ? '' : 'h5'}>
                        $
                        {(
                          token.oneDayVolumeUSD * GlobalConst.utils.FEEPERCENT
                        ).toLocaleString()}
                      </p>
                    </Box>
                  </Box>
                  <Box
                    width={isMobile ? 1 : 0.8}
                    mt={4}
                    display='flex'
                    justifyContent='space-between'
                  >
                    <Box width={180}>
                      <span className='text-disabled'>Contract Address</span>
                      <h5 className='text-primary'>
                        {chainId ? (
                          <a
                            href={getEtherscanLink(
                              chainId,
                              token.id,
                              'address',
                            )}
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
            <p>{token.symbol} Pools</p>
          </Box>
          <Box width={1} className='panel' mt={4}>
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
