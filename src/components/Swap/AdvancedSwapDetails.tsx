import { Trade, TradeType } from '@uniswap/sdk';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Field } from 'state/swap/actions';
import { useUserSlippageTolerance } from 'state/user/hooks';
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
} from 'utils/prices';
import {
  QuestionHelper,
  FormattedPriceImpact,
  CurrencyLogo,
  SettingsModal,
} from 'components';
import EditIcon from 'svgs/EditIcon.svg';
import { formatTokenAmount } from 'utils';
import styles from 'styles/components/Swap.module.scss';

interface TradeSummaryProps {
  trade: Trade;
  allowedSlippage: number;
}

export const TradeSummary: React.FC<TradeSummaryProps> = ({
  trade,
  allowedSlippage,
}) => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { t } = useTranslation();

  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(
    trade,
  );
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
      <Box className={styles.summaryRow}>
        <Box>
          <small>{t('slippage')}:</small>
          <QuestionHelper text={t('slippageHelper')} />
        </Box>
        <Box
          onClick={() => setOpenSettingsModal(true)}
          className={styles.swapSlippage}
        >
          <small>{allowedSlippage / 100}%</small>
          <EditIcon />
        </Box>
      </Box>
      <Box className={styles.summaryRow}>
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
      <Box className={styles.summaryRow}>
        <Box>
          <small>{t('priceimpact')}:</small>
          <QuestionHelper text={t('priceImpactHelper')} />
        </Box>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </Box>
      <Box className={styles.summaryRow}>
        <Box>
          <small>{t('liquidityProviderFee')}:</small>
          <QuestionHelper text={t('liquidityProviderFeeHelper')} />
        </Box>
        <small>
          {formatTokenAmount(realizedLPFee)} {trade.inputAmount.currency.symbol}
        </small>
      </Box>
      <Box className={styles.summaryRow}>
        <Box>
          <small>{t('route')}:</small>
          <QuestionHelper text={t('swapRouteHelper')} />
        </Box>
        <Box>
          {trade.route.path.map((token, i, path) => {
            const isLastItem: boolean = i === path.length - 1;
            return (
              <small key={i}>
                {token.symbol}{' '}
                {// this is not to show the arrow at the end of the trade path
                isLastItem ? '' : ' > '}
              </small>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export interface AdvancedSwapDetailsProps {
  trade?: Trade;
}

export const AdvancedSwapDetails: React.FC<AdvancedSwapDetailsProps> = ({
  trade,
}) => {
  const [allowedSlippage] = useUserSlippageTolerance();

  return (
    <>
      {trade && (
        <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
      )}
    </>
  );
};
