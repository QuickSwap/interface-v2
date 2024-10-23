import React from 'react';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade } from 'lib/src/trade';
import { useMemo } from 'react';
import { computeRealizedLPFeePercent } from 'utils/v3/prices';
import FormattedPriceImpact from './FormattedPriceImpact';
import SwapRoute from './SwapRoute';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';

interface AdvancedSwapDetailsProps {
  trade?: Trade<Currency, Currency, TradeType>;
  allowedSlippage: Percent;
}

export function AdvancedSwapDetails({
  trade,
  allowedSlippage,
}: AdvancedSwapDetailsProps) {
  const { t } = useTranslation();

  const { realizedLPFee, priceImpact } = useMemo(() => {
    if (!trade) return { realizedLPFee: undefined, priceImpact: undefined };

    const realizedLpFeePercent = computeRealizedLPFeePercent(trade);
    const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent);
    const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent);
    return { priceImpact, realizedLPFee };
  }, [trade]);

  return !trade ? null : (
    <Box>
      <Box className='flex justify-between' mb={0.5}>
        <p className='caption'>{t('liquidityProviderFee')}</p>
        <p className='caption weight-600 ml-1'>
          {realizedLPFee
            ? `${realizedLPFee.toSignificant(4)} ${
                realizedLPFee.currency.symbol
              }`
            : '-'}
        </p>
      </Box>

      <Box className='flex justify-between' mb={0.5}>
        <p className='caption'>{t('route')}</p>
        <div className='caption weight-600 ml-1'>
          <SwapRoute trade={trade} />
        </div>
      </Box>

      <Box className='flex justify-between' mb={0.5}>
        <p className='caption'>{t('priceimpact')}</p>
        <p className='caption weight-600 ml-1'>
          <FormattedPriceImpact priceImpact={priceImpact} />
        </p>
      </Box>

      <Box className='flex justify-between' mb={0.5}>
        <p className='caption'>
          {trade.tradeType === TradeType.EXACT_INPUT
            ? t('minReceived')
            : t('maxSold')}
        </p>
        <p className='caption weight-600 ml-1'>
          {trade.tradeType === TradeType.EXACT_INPUT
            ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${
                trade.outputAmount.currency.symbol
              }`
            : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${
                trade.inputAmount.currency.symbol
              }`}
        </p>
      </Box>

      <Box className='flex justify-between'>
        <p className='caption'>{t('slippageTolerance')}</p>
        <p className='caption weight-600 ml-1'>{allowedSlippage.toFixed(2)}%</p>
      </Box>
    </Box>
  );
}
