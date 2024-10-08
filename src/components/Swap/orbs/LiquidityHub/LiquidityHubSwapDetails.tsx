import React from 'react';
import { Box } from '@material-ui/core';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as PriceExchangeIcon } from 'assets/images/PriceExchangeIcon.svg';
import { ReactComponent as EditIcon } from 'assets/images/EditIcon.svg';
import { useUserSlippageTolerance } from 'state/user/hooks';
import QuestionHelper from 'components/QuestionHelper';
import { FormattedPriceImpact } from 'components/ConfirmSwapModal';
import SettingsModal from 'components/SettingsModal';
import { SLIPPAGE_AUTO } from 'state/user/reducer';
import CurrencyLogo from 'components/CurrencyLogo';
import { Quote } from '@orbs-network/liquidity-hub-sdk';
import { useDerivedSwapInfo } from 'state/swap/hooks';
import { useParseRawAmount } from './hooks';
import useUSDCPrice from 'utils/useUSDCPrice';
import BN from 'bignumber.js';
import { Field } from 'state/swap/actions';
import { JSBI, Percent } from '@uniswap/sdk';
import { fromRawAmount } from '../utils';
const SwapPrice = ({ quote }: { quote: Quote | null }) => {
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
    const price = inverted
      ? 1 / Number(priceFor1Token)
      : Number(priceFor1Token);
    return price.toLocaleString('us');
  }, [inverted, parsedAmount?.toExact(), parsedOutAmount?.toExact()]);

  const toggleInverted = useCallback(() => {
    setInverted((prev) => !prev);
  }, []);

  return (
    <Box className='swapPrice'>
      <small>{t('price')}:</small>
      <small>
        1 {inverted ? outCurrency?.symbol : inCurrency?.symbol} = {price}{' '}
        {inverted ? inCurrency?.symbol : outCurrency?.symbol}{' '}
        <PriceExchangeIcon onClick={toggleInverted} />
      </small>
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
    <Box>
      <SwapPrice quote={quote} />
      <Box mt={1.5}>
        <Slippage />
        <MinReceived quote={quote} />
        <PriceImpact quote={quote} allowedSlippage={allowedSlippage} />
        <NetworkFee quote={quote} />
      </Box>
    </Box>
  );
};

export const usePriceImpact = (quote: Quote, allowedSlippage: number) => {
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
    <Box className='summaryRow'>
      <Box>
        <small>{t('priceimpact')}:</small>
        <QuestionHelper text={t('priceImpactHelper')} />
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
      {open && <SettingsModal open={open} onClose={() => setOpen(false)} />}
      <Box className='summaryRow'>
        <Box>
          <small>{t('maxSlippage')}:</small>
          <QuestionHelper text={t('slippageHelper')} />
        </Box>
        <Box onClick={() => setOpen(true)} className='swapSlippage'>
          <small> {userSlippage === SLIPPAGE_AUTO ? 0.5 : userSlippage}%</small>
          <EditIcon />
        </Box>
      </Box>
    </>
  );
};

const NetworkFee = ({ quote }: { quote: Quote }) => {
  const { currencies } = useDerivedSwapInfo();
  const outCurrency = currencies.OUTPUT;
  const fee = useParseRawAmount(outCurrency, quote?.gasAmountOut)?.toExact();
  const usd =
    Number(useUSDCPrice(outCurrency)?.toSignificant() ?? 0) * Number(fee || 0);

  const { t } = useTranslation();
  return (
    <Box className='summaryRow'>
      <Box>
        <small>{t('Network fee')}:</small>
      </Box>
      <Box>
        {usd ? <small>${usd.toLocaleString('us')} </small> : <small>-</small>}
      </Box>
    </Box>
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
    <Box className='summaryRow'>
      <Box>
        <small>{t('minReceived')}:</small>
        <QuestionHelper text={t('txLimitHelper')} />
      </Box>
      <Box>
        <small>
          {Number(parsedMinAmountOut?.toExact()).toLocaleString('us')}{' '}
          {outCurrency?.symbol}
        </small>
        <CurrencyLogo currency={outCurrency} size='16px' />
      </Box>
    </Box>
  );
};
