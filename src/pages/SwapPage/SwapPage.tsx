import React, { useState, useEffect } from 'react';
import { Box, Grid } from 'theme/components';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { SettingsModal, SwapTokenDetails, ToggleSwitch } from 'components';
import { useIsProMode, useIsV2 } from 'state/application/hooks';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { useDerivedSwapInfo as useDerivedSwapInfoV3 } from 'state/swap/v3/hooks';
import { Field } from 'state/swap/actions';
import { getPairAddress, getSwapTransactions } from 'utils';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import SwapMain from './SwapMain';
import LiquidityPools from './LiquidityPools';
import SwapProChartTrade from './SwapProChartTrade';
import SwapProInfo from './SwapProInfo';
import SwapProFilter from './SwapProFilter';
import { useTranslation } from 'react-i18next';
import 'pages/styles/swap.scss';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import AdsSlider from 'components/AdsSlider';
import { SwapBuySellWidget } from './BuySellWidget';
import { Token } from '@uniswap/sdk';
import { useIsSM, useIsMD, useIsXS } from 'hooks/useMediaQuery';

const SwapPage: React.FC = () => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { isProMode, updateIsProMode } = useIsProMode();
  const isTiny = useIsXS();
  const isMobile = useIsSM();
  const isTablet = useIsMD();
  const [showChart, setShowChart] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [pairId, setPairId] = useState<string | undefined>(undefined);
  const [pairTokenReversed, setPairTokenReversed] = useState(false);
  const [transactions, setTransactions] = useState<any[] | undefined>(
    undefined,
  );
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [infoPos, setInfoPos] = useState('right');

  const { currencies } = useDerivedSwapInfo();
  const { currencies: currenciesV3 } = useDerivedSwapInfoV3();
  const { chainId } = useActiveWeb3React();

  const token1 = wrappedCurrency(currencies[Field.INPUT], chainId);
  const token2 = wrappedCurrency(currencies[Field.OUTPUT], chainId);

  const token1V3 = currenciesV3[Field.INPUT]?.wrapped;
  const token2V3 = currenciesV3[Field.OUTPUT]?.wrapped;
  const { isV2 } = useIsV2();

  // this is for refreshing data of trades table every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function getPairId(token1Address: string, token2Address: string) {
      const pairData = await getPairAddress(token1Address, token2Address);
      if (pairData) {
        setPairTokenReversed(pairData.tokenReversed);
        setPairId(pairData.pairId);
      }
    }
    if (token1?.address && token2?.address) {
      getPairId(token1?.address, token2?.address);
    }
  }, [token1?.address, token2?.address]);

  useEffect(() => {
    (async () => {
      if (pairId && transactions && transactions.length > 0) {
        const txns = await getSwapTransactions(
          pairId,
          Number(transactions[0].transaction.timestamp),
        );
        if (txns) {
          const filteredTxns = txns.filter(
            (txn) =>
              !transactions.find(
                (tx) => tx.transaction.id === txn.transaction.id,
              ),
          );
          setTransactions([...filteredTxns, ...transactions]);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  useEffect(() => {
    async function getTradesData(pairId: string) {
      setTransactions(undefined);
      const transactions = await getSwapTransactions(pairId);
      setTransactions(transactions);
    }
    if (pairId && isProMode) {
      getTradesData(pairId);
    }
  }, [pairId, isProMode]);

  const { t } = useTranslation();
  const helpURL = process.env.REACT_APP_HELP_URL;
  return (
    <Box width='100%' margin='0 0 24px' id='swap-page'>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      {!isProMode && (
        <Box className='pageHeading'>
          <h4>{t('swap')}</h4>
          {helpURL && (
            <Box
              className='helpWrapper'
              onClick={() => window.open(helpURL, '_blank')}
            >
              <small>{t('help')}</small>
              <HelpIcon />
            </Box>
          )}
        </Box>
      )}
      {!isProMode ? (
        <Grid container spacing={4}>
          <Grid item spacing={4} xs={12} sm={12} md={6} lg={5}>
            <Box width='100%'>
              <Box className='wrapper'>
                <SwapMain />
              </Box>
              <Box maxWidth={isTiny ? '320px' : '352px'} margin='16px auto 0'>
                <AdsSlider sort='swap' />
              </Box>
            </Box>
          </Grid>
          <Grid item spacing={4} xs={12} sm={12} md={6} lg={7}>
            <Box width='100%'>
              <Box className='flex flex-wrap justify-between fullWidth'>
                {isV2 && token1 && (
                  <Box className='swapTokenDetails'>
                    <SwapTokenDetails token={token1} />
                  </Box>
                )}
                {isV2 && token2 && (
                  <Box className='swapTokenDetails'>
                    <SwapTokenDetails token={token2} />
                  </Box>
                )}
                {!isV2 && token1V3 && (
                  <Box className='swapTokenDetails'>
                    <SwapTokenDetails token={token1V3 as Token} />
                  </Box>
                )}
                {!isV2 && token2V3 && (
                  <Box className='swapTokenDetails'>
                    <SwapTokenDetails token={token2V3 as Token} />
                  </Box>
                )}
              </Box>
              {isV2 && token1 && token2 && (
                <Box className='wrapper' margin='32px 0 0'>
                  <LiquidityPools token1={token1} token2={token2} />
                </Box>
              )}
              {!isV2 && token1V3 && token2V3 && (
                <Box className='wrapper' margin='32px 0 0'>
                  <LiquidityPools
                    token1={token1V3 as Token}
                    token2={token2V3 as Token}
                  />
                </Box>
              )}
              <Box width='100%' className='flex'>
                <SwapBuySellWidget />
              </Box>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Box
          className='border-top border-bottom bg-palette flex flex-wrap'
          minHeight='calc(100vh - 140px)'
        >
          <Box
            width={isMobile ? '100%' : '450px'}
            padding='20px 0'
            className={isMobile ? '' : 'border-right'}
          >
            <Box
              className='flex justify-between items-center'
              padding='0 24px'
              margin='0 0 24px'
            >
              <h4>{t('swap')}</h4>
              <Box className='flex items-center' margin='0 8px 0 0'>
                <span
                  className='text-secondary text-uppercase'
                  style={{ marginRight: 8 }}
                >
                  {t('proMode')}
                </span>
                <ToggleSwitch
                  toggled={true}
                  onToggle={() => {
                    updateIsProMode(false);
                  }}
                />
                <Box margin='0 0 0 8px' className='headingItem'>
                  <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
                </Box>
              </Box>
            </Box>
            <SwapMain />
            <Box maxWidth={isTiny ? '320px' : '352px'} margin='16px auto 0'>
              <AdsSlider sort='swap' />
            </Box>
          </Box>
          {infoPos === 'left' && (
            <Box
              className={isMobile ? 'border-top' : 'border-left border-right'}
              width={isMobile ? '100%' : '250px'}
            >
              <SwapProInfo
                token1={token1}
                token2={token2}
                transactions={transactions}
              />
            </Box>
          )}
          <Box className='swapProWrapper'>
            <SwapProFilter
              infoPos={infoPos}
              setInfoPos={setInfoPos}
              showChart={showChart}
              setShowChart={setShowChart}
              showTrades={showTrades}
              setShowTrades={setShowTrades}
            />
            <SwapProChartTrade
              showChart={showChart}
              showTrades={showTrades}
              token1={token1}
              token2={token2}
              pairAddress={pairId}
              pairTokenReversed={pairTokenReversed}
              transactions={transactions}
            />
          </Box>
          {infoPos === 'right' && (
            <Box
              className={isMobile ? 'border-top' : 'border-left'}
              width={isTablet ? '100%' : '250px'}
            >
              <SwapProInfo
                token1={token1}
                token2={token2}
                transactions={transactions}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SwapPage;
