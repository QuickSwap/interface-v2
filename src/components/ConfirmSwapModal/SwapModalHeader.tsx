import { Currency, Fraction, Trade, TradeType } from '@uniswap/sdk';
import React, { useMemo } from 'react';
import { AlertTriangle } from 'react-feather';
import { Box, Button } from '@material-ui/core';
import { Field } from 'state/swap/actions';
import { DoubleCurrencyLogo } from 'components';
import useUSDCPrice from 'utils/useUSDCPrice';
import { computeSlippageAdjustedAmounts } from 'utils/prices';
import { ReactComponent as ArrowDownIcon } from 'assets/images/ArrowDownIcon.svg';
import { basisPointsToPercent, formatTokenAmount } from 'utils';
import { useTranslation } from 'react-i18next';
import { OptimalRate, SwapSide } from '@paraswap/sdk';
import { ONE } from 'v3lib/utils';

interface SwapModalHeaderProps {
  trade?: Trade;
  optimalRate?: OptimalRate;
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  allowedSlippage: number;
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
  onConfirm: () => void;
}

const SwapModalHeader: React.FC<SwapModalHeaderProps> = ({
  trade,
  optimalRate,
  inputCurrency,
  outputCurrency,
  allowedSlippage,
  showAcceptChanges,
  onAcceptChanges,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [trade, allowedSlippage],
  );
  const usdPrice = useUSDCPrice(
    trade ? trade.inputAmount.currency : inputCurrency,
  );

  const pct = basisPointsToPercent(allowedSlippage);

  const bestTradeAmount = optimalRate
    ? optimalRate.side === SwapSide.SELL
      ? new Fraction(ONE)
          .add(pct)
          .invert()
          .multiply(optimalRate.destAmount).quotient
      : new Fraction(ONE).add(pct).multiply(optimalRate.srcAmount).quotient
    : undefined;

  return (
    <Box>
      <Box mt={10} className='flex justify-center'>
        <DoubleCurrencyLogo
          currency0={trade ? trade.inputAmount.currency : inputCurrency}
          currency1={trade ? trade.outputAmount.currency : outputCurrency}
          size={48}
        />
      </Box>
      <Box className='swapContent'>
        <p>
          {t('swap')}{' '}
          {optimalRate
            ? (
                Number(optimalRate.srcAmount) /
                10 ** optimalRate.srcDecimals
              ).toLocaleString('us')
            : trade
            ? formatTokenAmount(trade.inputAmount)
            : ''}{' '}
          {trade ? trade.inputAmount.currency.symbol : inputCurrency?.symbol} ($
          {(
            Number(usdPrice?.toSignificant()) *
            (optimalRate
              ? Number(optimalRate.srcAmount) / 10 ** optimalRate.srcDecimals
              : trade
              ? Number(trade.inputAmount.toSignificant())
              : 0)
          ).toLocaleString('us')}
          )
        </p>
        <ArrowDownIcon />
        <p>
          {optimalRate
            ? (
                Number(optimalRate.destAmount) /
                10 ** optimalRate.destDecimals
              ).toLocaleString('us')
            : trade
            ? formatTokenAmount(trade.outputAmount)
            : ''}{' '}
          {trade ? trade.outputAmount.currency.symbol : outputCurrency?.symbol}
        </p>
      </Box>
      {showAcceptChanges && (
        <Box className='priceUpdate'>
          <Box>
            <AlertTriangle size={20} />
            <p>{t('priceUpdated')}</p>
          </Box>
          <Button onClick={onAcceptChanges}>{t('accept')}</Button>
        </Box>
      )}
      <Box className='transactionText'>
        {trade?.tradeType === TradeType.EXACT_INPUT ||
        optimalRate?.side === SwapSide.SELL ? (
          <p className='small'>
            {t('outputEstimated1', {
              amount: trade
                ? formatTokenAmount(slippageAdjustedAmounts[Field.OUTPUT])
                : bestTradeAmount && outputCurrency
                ? (
                    Number(bestTradeAmount.toString()) /
                    10 ** outputCurrency.decimals
                  ).toLocaleString()
                : '',
              symbol: trade
                ? trade.outputAmount.currency.symbol
                : outputCurrency?.symbol,
            })}
          </p>
        ) : trade?.tradeType === TradeType.EXACT_OUTPUT ||
          optimalRate?.side === SwapSide.BUY ? (
          <p className='small'>
            {t('inputEstimated', {
              amount: trade
                ? formatTokenAmount(slippageAdjustedAmounts[Field.INPUT])
                : bestTradeAmount && inputCurrency
                ? (
                    Number(bestTradeAmount.toString()) /
                    10 ** inputCurrency.decimals
                  ).toLocaleString()
                : '',
              symbol: trade
                ? trade.inputAmount.currency.symbol
                : inputCurrency?.symbol,
            })}
          </p>
        ) : (
          <></>
        )}
        <Button onClick={onConfirm} className='swapButton'>
          {t('confirmSwap')}
        </Button>
      </Box>
    </Box>
  );
};

export default SwapModalHeader;
