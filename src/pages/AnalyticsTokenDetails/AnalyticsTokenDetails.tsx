import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Box, Typography, Grid, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { ChainId, Token } from '@uniswap/sdk';
import cx from 'classnames';
import {
  shortenAddress,
  getEtherscanLink,
  getFormattedPrice,
  getPriceColor,
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

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  panel: {
    background: palette.grey.A700,
    borderRadius: 20,
    padding: 24,
    [breakpoints.down('xs')]: {
      padding: 12,
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

  const tokenPercentColor = getPriceColor(
    token ? Number(token.priceChangeUSD) : 0,
    palette,
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
                    ${formatNumber(token.priceUSD)}
                  </Typography>
                  <Box
                    className={classes.priceChangeWrapper}
                    ml={2}
                    bgcolor={tokenPercentColor.bgColor}
                    color={tokenPercentColor.textColor}
                  >
                    <Typography variant='body2'>
                      {getFormattedPrice(Number(token.priceChangeUSD))}%
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
                        $
                        {(
                          token.oneDayVolumeUSD * GlobalConst.utils.FEEPERCENT
                        ).toLocaleString()}
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
                            rel='noopener noreferrer'
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
