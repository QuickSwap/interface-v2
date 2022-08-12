import { Trade, TradeType } from '@uniswap/sdk';
import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Field } from 'state/swap/actions';
import { useUserSlippageTolerance } from 'state/user/hooks';
import {
  computePriceImpact,
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
} from 'utils/prices';
import {
  QuestionHelper,
  FormattedPriceImpact,
  CurrencyLogo,
  SettingsModal,
} from 'components';
import { ReactComponent as EditIcon } from 'assets/images/EditIcon.svg';
import { formatTokenAmount } from 'utils';
import { OptimalRate } from '@paraswap/sdk';

interface TradeSummaryProps {
  optimalRate: OptimalRate;
  trade: Trade;
  allowedSlippage: number;
}

export const BestTradeSummary: React.FC<TradeSummaryProps> = ({
  optimalRate,
  trade,
  allowedSlippage,
}) => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { t } = useTranslation();

  const priceImpactWithoutFee = computePriceImpact(optimalRate);
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT;
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(
    trade,
    allowedSlippage,
  );
  const tradeAmount = isExactIn ? trade.outputAmount : trade.inputAmount;

  return (
    <Box mt={1.5}>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box className='summaryRow'>
        <Box>
          <small>{t('slippage')}:</small>
          <QuestionHelper text={t('slippageHelper')} />
        </Box>
        <Box
          onClick={() => setOpenSettingsModal(true)}
          className='swapSlippage'
        >
          <small>{allowedSlippage / 100}%</small>
          <EditIcon />
        </Box>
      </Box>
      <Box className='summaryRow'>
        <Box>
          <small>{isExactIn ? t('minReceived') : t('maxSold')}:</small>
          <QuestionHelper text={t('txLimitHelper')} />
        </Box>
        <Box>
          <small>
            {formatTokenAmount(
              slippageAdjustedAmounts[isExactIn ? Field.OUTPUT : Field.INPUT],
            )}{' '}
            {tradeAmount.currency.symbol}
          </small>
          <CurrencyLogo currency={tradeAmount.currency} size='16px' />
        </Box>
      </Box>
      <Box className='summaryRow'>
        <Box>
          <small>{t('priceimpact')}:</small>
          <QuestionHelper text={t('priceImpactHelper')} />
        </Box>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </Box>
    </Box>
  );
};

export interface BestTradeAdvancedSwapDetailsProps {
  optimalRate?: OptimalRate;
  trade?: Trade;
}

export const BestTradeAdvancedSwapDetails: React.FC<BestTradeAdvancedSwapDetailsProps> = ({
  optimalRate,
  trade,
}) => {
  const [allowedSlippage] = useUserSlippageTolerance();

  return (
    <>
      {trade && optimalRate && (
        <BestTradeSummary
          optimalRate={optimalRate}
          trade={trade}
          allowedSlippage={allowedSlippage}
        />
      )}
    </>
  );
};
