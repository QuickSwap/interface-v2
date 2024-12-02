import React from 'react';
import { Box, Divider } from '@material-ui/core';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { useUserSlippageTolerance } from 'state/user/hooks';
import { FormattedPriceImpact } from 'components/ConfirmSwapModal';
import SettingsModal from 'components/SettingsModal';
import { SLIPPAGE_AUTO } from 'state/user/reducer';
import { Quote } from '@orbs-network/liquidity-hub-sdk';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import useUSDCPrice from 'utils/useUSDCPrice';
import BN from 'bignumber.js';
import { Field } from 'state/swap/actions';
import chart from 'assets/images/icons/chart.svg';

import {
  Currency,
  JSBI,
  Percent,
  TokenAmount,
  Token,
  CurrencyAmount,
} from '@uniswap/sdk';
import { fromRawAmount } from '../utils';
import { ReactComponent as SettingsIcon } from 'assets/images/icons/cog-fill.svg';
import { InfomationHelper } from 'components/QuestionHelper';
import { formatNumber } from 'utils';
import { useLiquidityHubManager } from 'state/user/hooks';
import OrbsLogo from 'assets/images/orbs-logo.svg';
import ToggleSwitch from 'components/ToggleSwitch';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { useIsLiquidityHubSupported } from './hooks';
import { LIQUIDITY_HUB_WEBSITE, ORBS_WEBSITE } from '../consts';
import { useActiveWeb3React } from 'hooks';

const useParseRawAmount = (currency?: Currency, amount?: string) => {
  const { chainId } = useActiveWeb3React();
  return useMemo(() => {
    if (!currency || !amount) return undefined;
    return currency instanceof Token
      ? new TokenAmount(currency, JSBI.BigInt(amount))
      : CurrencyAmount.ether(JSBI.BigInt(amount), chainId);
  }, [chainId, amount, currency]);
};

export const LiquidityHubSettings = () => {
  const [
    liquidityHubDisabled,
    toggleLiquidityHubDisabled,
  ] = useLiquidityHubManager();
  const { t } = useTranslation();

  const isSupported = useIsLiquidityHubSupported();
  if (!isSupported) return null;

  return (
    <>
      <Box my={2.5} className='flex items-center justify-between'>
        <Box className='LiquidityHubSettings'>
          <p>{t('disableLiquidityHub')}</p>
          <p className='bottom-text'>
            <a target='_blank' rel='noreferrer' href={LIQUIDITY_HUB_WEBSITE}>
              <img src={OrbsLogo} />
              {t('liquidityHub')}
            </a>
            , {t('poweredBy').toLowerCase()}{' '}
            <a href={ORBS_WEBSITE} target='_blank' rel='noreferrer'>
              Orbs
            </a>
            , {t('aboutLiquidityHub')}{' '}
            <a
              className='more-info'
              href={LIQUIDITY_HUB_WEBSITE}
              target='_blank'
              rel='noreferrer'
            >
              {t('forMoreInfo')}
            </a>
          </p>
        </Box>
        <ToggleSwitch
          toggled={liquidityHubDisabled}
          onToggle={toggleLiquidityHubDisabled}
        />
      </Box>
      <Divider />
    </>
  );
};

export const SwapPrice = ({ quote }: { quote?: Quote | null }) => {
  const { t } = useTranslation();
  const { parsedAmount, currencies } = useDerivedSwapInfo();
  const inCurrency = currencies.INPUT;
  const outCurrency = currencies.OUTPUT;
  const parsedOutAmount = useParseRawAmount(outCurrency, quote?.outAmount);

  const [inverted, setInverted] = useState(false);
  const price = useMemo(() => {
    if (!parsedOutAmount || !parsedAmount) return '';

    const priceFor1Token =
      Number(parsedOutAmount.toExact()) / Number(parsedAmount?.toExact());

    const price = inverted ? 1 / priceFor1Token : priceFor1Token;

    return price;
  }, [inverted, parsedAmount, parsedOutAmount]);

  const toggleInverted = useCallback(() => {
    setInverted((prev) => !prev);
  }, []);

  if (!quote) return null;

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gridGap: '4px',
        marginTop: '16px',
      }}
    >
      <Box className='swapPrice'>
        <img src={chart} alt='chart' />
        <small>
          1 {inverted ? outCurrency?.symbol : inCurrency?.symbol} ={' '}
          {formatNumber(price, 5)}{' '}
          {inverted ? inCurrency?.symbol : outCurrency?.symbol}{' '}
          <PriceExchangeIcon onClick={toggleInverted} />
        </small>
      </Box>
    </Box>
  );
};

export const LiquidityHubSwapDetails = ({
  quote,
  allowedSlippage,
}: {
  quote?: Quote | null;
  allowedSlippage: number;
}) => {
  if (!quote) return null;

  return (
    <>
      <Box
        mt={1.5}
        sx={{
          border: '1px solid #3a4769',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gridGap: '8px',
        }}
      >
        <Slippage />
        <MinReceived quote={quote} />
        <PriceImpact quote={quote} allowedSlippage={allowedSlippage} />
      </Box>
    </>
  );
};

const usePriceImpact = (quote: Quote, allowedSlippage: number) => {
  const { currencies, parsedAmount } = useDerivedSwapInfo();
  const inAmount = parsedAmount?.toExact() ?? '0';
  const inCurrency = currencies.INPUT;
  const outCurrency = currencies.OUTPUT;
  const parsedOutAmount = useParseRawAmount(
    outCurrency,
    quote?.outAmount,
  )?.raw.toString();
  const outAmount = useMemo(() => {
    if (!parsedOutAmount || !outCurrency || !quote.gasAmountOut) return '0';
    const result = BN(parsedOutAmount)
      .plus(quote.gasAmountOut)
      .toString();
    return fromRawAmount(outCurrency, result)?.toExact() || '0';
  }, [parsedOutAmount, outCurrency, quote.gasAmountOut]);

  const srcUSD =
    Number(useUSDCPrice(inCurrency)?.toSignificant() ?? 0) * Number(inAmount);
  const dstUSD =
    Number(useUSDCPrice(outCurrency)?.toSignificant() ?? 0) * Number(outAmount);

  return useMemo(() => {
    if (!srcUSD || !dstUSD || !inAmount || !outAmount) return new Percent('0');
    const _srcUSD = JSBI.BigInt(
      BN(srcUSD)
        .multipliedBy(10 ** 10)
        .toFixed(0),
    );
    const _dstUSD = JSBI.BigInt(
      BN(dstUSD)
        .multipliedBy(10 ** 10)
        .toFixed(0),
    );
    const priceChange = JSBI.subtract(_srcUSD, _dstUSD);
    return new Percent(priceChange, _srcUSD);
  }, [srcUSD, dstUSD, inAmount, outAmount]);
};

const PriceImpact = ({
  quote,
  allowedSlippage,
}: {
  quote: Quote;
  allowedSlippage: number;
}) => {
  const { t } = useTranslation();
  const priceImpact = usePriceImpact(quote, allowedSlippage);
  return (
    <Box className='summaryRow subtext-color'>
      <Box>
        <InfomationHelper text={t('priceImpactHelper')} />
        <small>{t('priceimpact')}</small>
      </Box>
      <FormattedPriceImpact priceImpact={priceImpact} />
    </Box>
  );
};

const Slippage = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const [userSlippage] = useUserSlippageTolerance();

  return (
    <>
      <Box className='summaryRow subtext-color'>
        <Box>
          <InfomationHelper text={t('slippageHelper')} />
          <small>{t('slippage')}</small>
        </Box>
        <Box onClick={() => setOpen(true)} className='swapSlippage'>
          <small>{userSlippage === SLIPPAGE_AUTO ? 0.5 : userSlippage}%</small>
          <SettingsIcon />
        </Box>
      </Box>

      {open && <SettingsModal open={open} onClose={() => setOpen(false)} />}
    </>
  );
};

const MinReceived = ({ quote }: { quote: Quote }) => {
  const { currencies } = useDerivedSwapInfo();
  const outCurrency = currencies[Field.OUTPUT];
  const parsedMinAmountOut = useParseRawAmount(
    outCurrency,
    quote?.minAmountOut,
  );

  const { t } = useTranslation();
  return (
    <Box className='summaryRow subtext-color'>
      <Box>
        <InfomationHelper text={t('txLimitHelper')} />
        <small>{t('minReceived')}</small>
      </Box>
      <Box>
        <small>
          {Number(parsedMinAmountOut?.toExact()).toLocaleString('us')}{' '}
          {outCurrency?.symbol}
        </small>
      </Box>
    </Box>
  );
};
