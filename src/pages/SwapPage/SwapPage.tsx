import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  Grid,
  Divider,
  useMediaQuery,
} from '@material-ui/core';
import { KeyboardArrowUp, KeyboardArrowDown } from '@material-ui/icons';
import cx from 'classnames';
import { Currency, Token } from '@uniswap/sdk';
import {
  GelatoLimitOrderPanel,
  GelatoLimitOrdersHistoryPanel,
} from '@gelatonetwork/limit-orders-react';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import {
  DoubleCurrencyLogo,
  Swap,
  SwapTokenDetails,
  SettingsModal,
} from 'components';
import { useEthPrice, useTokenPairs } from 'state/application/hooks';
import {
  getEthPrice,
  getTokenPairs,
  getBulkPairData,
  formatCompact,
  getDaysCurrentYear,
} from 'utils';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { Field } from 'state/swap/actions';
import { useAllTokens } from 'hooks/Tokens';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useCurrency } from 'hooks/Tokens';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  helpWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    border: `1px solid ${palette.secondary.light}`,
    borderRadius: 10,
    '& p': {
      color: palette.text.hint,
    },
    '& svg': {
      marginLeft: 8,
    },
  },
  wrapper: {
    padding: 24,
    backgroundColor: palette.background.paper,
    borderRadius: 20,
    [breakpoints.down('xs')]: {
      padding: '16px 12px',
    },
  },
  swapItem: {
    width: 100,
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    '& p': {
      color: palette.text.secondary,
    },
  },
  activeSwap: {
    background: palette.secondary.dark,
    '& p': {
      color: 'white',
    },
  },
  headingItem: {
    cursor: 'pointer',
  },
  swapTokenDetails: {
    backgroundColor: palette.background.paper,
    borderRadius: 16,
    width: 'calc(50% - 16px)',
    [breakpoints.down('xs')]: {
      width: '100%',
      marginTop: 16,
      marginBottom: 16,
    },
  },
  liquidityMain: {
    '& p': {
      color: palette.text.secondary,
      fontWeight: 600,
    },
  },
  liquidityFilter: {
    '& p': {
      cursor: 'pointer',
      marginRight: 20,
      '&.active': {
        color: palette.primary.main,
      },
    },
  },
  liquidityContent: {
    border: `1px solid ${palette.secondary.dark}`,
    borderRadius: '10px',
    marginBottom: '20px',
    '& p': {
      color: palette.text.primary,
    },
  },
}));

const SwapPage: React.FC = () => {
  const classes = useStyles();
  const daysCurrentYear = getDaysCurrentYear();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const [swapIndex, setSwapIndex] = useState(0);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [currency0, setCurrency0] = useState<Currency | undefined>(undefined);
  const [currency1, setCurrency1] = useState<Currency | undefined>(undefined);
  const parsedQuery = useParsedQueryString();
  const qCurrency0 = useCurrency(
    parsedQuery && parsedQuery.currency0
      ? (parsedQuery.currency0 as string)
      : undefined,
  );
  const qCurrency1 = useCurrency(
    parsedQuery && parsedQuery.currency1
      ? (parsedQuery.currency1 as string)
      : undefined,
  );

  useEffect(() => {
    if (parsedQuery && parsedQuery.currency0 && qCurrency0) {
      setCurrency0(qCurrency0);
    }
    if (parsedQuery && parsedQuery.currency1 && qCurrency1) {
      setCurrency1(qCurrency1);
    }
  }, [parsedQuery, qCurrency0, qCurrency1]);

  const { currencies } = useDerivedSwapInfo();
  const { chainId } = useActiveWeb3React();
  const allTokens = useAllTokens();
  const { ethPrice, updateEthPrice } = useEthPrice();
  const { tokenPairs, updateTokenPairs } = useTokenPairs();
  const [liquidityPoolClosed, setLiquidityPoolClosed] = useState(false);
  const [liquidityFilterIndex, setLiquidityFilterIndex] = useState(0);

  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);
  const token1Address = token1?.address.toLowerCase();
  const token2Address = token2?.address.toLowerCase();

  const liquidityPairs = tokenPairs
    ? tokenPairs
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
        .slice(0, 5)
    : [];

  useEffect(() => {
    async function fetchEthPrice() {
      const [newPrice, oneDayPrice, priceChange] = await getEthPrice();
      updateEthPrice({
        price: newPrice,
        oneDayPrice,
        ethPriceChange: priceChange,
      });
    }
    if (!ethPrice.price) {
      fetchEthPrice();
    }
  }, [ethPrice, updateEthPrice]);

  useEffect(() => {
    async function fetchTokenPairs() {
      updateTokenPairs({ data: null });
      if (token1Address && token2Address) {
        const tokenPairs = await getTokenPairs(token1Address, token2Address);
        const formattedPairs = tokenPairs
          ? tokenPairs.map((pair: any) => {
              return pair.id;
            })
          : [];
        const pairData = await getBulkPairData(formattedPairs, ethPrice.price);
        if (pairData) {
          updateTokenPairs({ data: pairData });
        }
      }
    }
    if (ethPrice.price) {
      fetchTokenPairs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethPrice, token1Address, token2Address]);

  return (
    <Box width='100%' mb={3}>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box
        mb={2}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        width='100%'
      >
        <Typography variant='h4'>Swap</Typography>
        <Box className={classes.helpWrapper}>
          <Typography variant='body2'>Help</Typography>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className={classes.wrapper}>
            <Box display='flex' justifyContent='space-between'>
              <Box display='flex'>
                <Box
                  className={cx(
                    swapIndex === 0 && classes.activeSwap,
                    classes.swapItem,
                    classes.headingItem,
                  )}
                  onClick={() => setSwapIndex(0)}
                >
                  <Typography variant='body1'>Market</Typography>
                </Box>
                <Box
                  className={cx(
                    swapIndex === 1 && classes.activeSwap,
                    classes.swapItem,
                    classes.headingItem,
                  )}
                  onClick={() => setSwapIndex(1)}
                >
                  <Typography variant='body1'>Limit</Typography>
                </Box>
              </Box>
              <Box className={classes.headingItem}>
                <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
              </Box>
            </Box>
            <Box mt={2.5}>
              {swapIndex === 0 && (
                <Swap currency0={currency0} currency1={currency1} />
              )}
              {swapIndex === 1 && (
                <>
                  <GelatoLimitOrderPanel />
                  <GelatoLimitOrdersHistoryPanel />
                  <Box mt={2} textAlign='center'>
                    <Typography variant='body2'>
                      <b>* Disclaimer:</b> Limit Orders on QuickSwap are
                      provided by Gelato, a 3rd party protocol and should be
                      considered in beta. DYOR and use at your own risk.
                      QuickSwap is not responsible. More info can be found&nbsp;
                      <a
                        style={{ color: palette.text.primary }}
                        target='_blank'
                        rel='noopener noreferrer'
                        href='https://www.certik.org/projects/gelato'
                      >
                        here.
                      </a>
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box
            display='flex'
            flexWrap='wrap'
            justifyContent='space-between'
            width='100%'
          >
            {token1 && (
              <Box className={classes.swapTokenDetails}>
                <SwapTokenDetails token={token1} />
              </Box>
            )}
            {token2 && (
              <Box className={classes.swapTokenDetails}>
                <SwapTokenDetails token={token2} />
              </Box>
            )}
          </Box>
          {currencies[Field.INPUT] && currencies[Field.OUTPUT] && (
            <Box className={classes.wrapper} marginTop='32px'>
              <Box
                display='flex'
                alignItems='center'
                justifyContent='space-between'
                marginBottom={liquidityPoolClosed ? 0 : '20px'}
              >
                <Box display='flex' alignItems='center'>
                  <Typography
                    variant='h6'
                    style={{ color: palette.text.primary, marginRight: 8 }}
                  >
                    Liquidity Pools{' '}
                  </Typography>
                  <Typography
                    variant='body2'
                    style={{ color: palette.text.secondary }}
                  >
                    ({currencies[Field.INPUT]?.symbol?.toUpperCase()},{' '}
                    {currencies[Field.OUTPUT]?.symbol?.toUpperCase()})
                  </Typography>
                </Box>
                <Box
                  display='flex'
                  style={{ cursor: 'pointer', color: palette.text.secondary }}
                  onClick={() => setLiquidityPoolClosed(!liquidityPoolClosed)}
                >
                  {liquidityPoolClosed ? (
                    <KeyboardArrowDown />
                  ) : (
                    <KeyboardArrowUp />
                  )}
                </Box>
              </Box>
              {!liquidityPoolClosed && (
                <>
                  <Divider />
                  <Box width={1}>
                    <Box
                      display='flex'
                      padding={2}
                      className={classes.liquidityMain}
                    >
                      <Box
                        display='flex'
                        width={0.5}
                        className={classes.liquidityFilter}
                      >
                        <Typography
                          variant='body2'
                          className={liquidityFilterIndex === 0 ? 'active' : ''}
                          onClick={() => setLiquidityFilterIndex(0)}
                        >
                          All
                        </Typography>
                        <Typography
                          variant='body2'
                          className={liquidityFilterIndex === 1 ? 'active' : ''}
                          onClick={() => setLiquidityFilterIndex(1)}
                        >
                          {currencies[Field.INPUT]?.symbol?.toUpperCase()}
                        </Typography>
                        <Typography
                          variant='body2'
                          className={liquidityFilterIndex === 2 ? 'active' : ''}
                          onClick={() => setLiquidityFilterIndex(2)}
                        >
                          {currencies[Field.OUTPUT]?.symbol?.toUpperCase()}
                        </Typography>
                      </Box>
                      {!isMobile && (
                        <>
                          <Box width={0.2}>
                            <Typography variant='body2' align='left'>
                              TVL
                            </Typography>
                          </Box>
                          <Box width={0.15}>
                            <Typography variant='body2' align='left'>
                              24h Volume
                            </Typography>
                          </Box>
                          <Box width={0.15}>
                            <Typography variant='body2' align='right'>
                              APY
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                    {liquidityPairs.map((pair: any, ind: any) => {
                      const dayVolumeUSD =
                        Number(
                          pair.oneDayVolumeUSD
                            ? pair.oneDayVolumeUSD
                            : pair.oneDayVolumeUntracked,
                        ) *
                        GlobalConst.utils.FEEPERCENT *
                        daysCurrentYear *
                        100;
                      const trackReserveUSD = Number(
                        pair.oneDayVolumeUSD
                          ? pair.trackedReserveUSD
                          : pair.reserveUSD,
                      );
                      const apy =
                        isNaN(dayVolumeUSD) || trackReserveUSD === 0
                          ? 0
                          : dayVolumeUSD / trackReserveUSD;
                      const liquidity = pair.trackedReserveUSD
                        ? pair.trackedReserveUSD
                        : pair.reserveUSD;
                      const volume = pair.oneDayVolumeUSD
                        ? pair.oneDayVolumeUSD
                        : pair.oneDayVolumeUntracked;
                      const token0 =
                        pair.token0.symbol.toLowerCase() === 'wmatic'
                          ? Token.ETHER
                          : Object.values(allTokens).find(
                              (token) =>
                                pair.token0.id.toLowerCase() ===
                                token.address.toLowerCase(),
                            );
                      const token1 =
                        pair.token1.symbol.toLowerCase() === 'wmatic'
                          ? Token.ETHER
                          : Object.values(allTokens).find(
                              (token) =>
                                pair.token1.id.toLowerCase() ===
                                token.address.toLowerCase(),
                            );
                      return (
                        <Box
                          key={ind}
                          display='flex'
                          flexWrap='wrap'
                          className={cx(
                            classes.liquidityContent,
                            classes.liquidityMain,
                          )}
                          padding={2}
                        >
                          <Box
                            display='flex'
                            alignItems='center'
                            width={isMobile ? 1 : 0.5}
                          >
                            <DoubleCurrencyLogo
                              currency0={token0}
                              currency1={token1}
                              size={28}
                            />
                            <Typography
                              variant='body2'
                              style={{ marginLeft: 12 }}
                            >
                              {pair.token0.symbol.toUpperCase()} /{' '}
                              {pair.token1.symbol.toUpperCase()}
                            </Typography>
                          </Box>
                          <Box
                            width={isMobile ? 1 : 0.2}
                            mt={isMobile ? 2.5 : 0}
                            display='flex'
                            justifyContent='space-between'
                          >
                            {isMobile && (
                              <Typography
                                variant='body2'
                                style={{ color: palette.text.secondary }}
                              >
                                TVL
                              </Typography>
                            )}
                            <Typography variant='body2'>
                              ${formatCompact(liquidity)}
                            </Typography>
                          </Box>
                          <Box
                            width={isMobile ? 1 : 0.15}
                            mt={isMobile ? 1 : 0}
                            display='flex'
                            justifyContent='space-between'
                          >
                            {isMobile && (
                              <Typography
                                variant='body2'
                                style={{ color: palette.text.secondary }}
                              >
                                24H Volume
                              </Typography>
                            )}
                            <Typography variant='body2'>
                              ${formatCompact(volume)}
                            </Typography>
                          </Box>
                          <Box
                            width={isMobile ? 1 : 0.15}
                            mt={isMobile ? 1 : 0}
                            display='flex'
                            justifyContent={
                              isMobile ? 'space-between' : 'flex-end'
                            }
                          >
                            {isMobile && (
                              <Typography
                                variant='body2'
                                style={{ color: palette.text.secondary }}
                              >
                                APY
                              </Typography>
                            )}
                            <Typography
                              variant='body2'
                              align='right'
                              style={{
                                color:
                                  apy < 0
                                    ? palette.error.main
                                    : palette.success.main,
                              }}
                            >
                              {apy.toFixed(2)}%
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SwapPage;
