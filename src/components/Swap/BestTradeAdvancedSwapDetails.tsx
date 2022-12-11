import { Currency, Fraction, Percent } from '@uniswap/sdk';
import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useUserSlippageTolerance } from 'state/user/hooks';
import { computePriceImpact } from 'utils/prices';
import {
  QuestionHelper,
  FormattedPriceImpact,
  CurrencyLogo,
  SettingsModal,
} from 'components';
import { ReactComponent as EditIcon } from 'assets/images/EditIcon.svg';
import { basisPointsToPercent } from 'utils';
import { OptimalRate, SwapSide } from '@paraswap/sdk';
import { ONE } from 'v3lib/utils';

interface TradeSummaryProps {
  optimalRate: OptimalRate;
  allowedSlippage: Percent;
  inputCurrency: Currency;
  outputCurrency: Currency;
}

export const BestTradeSummary: React.FC<TradeSummaryProps> = ({
  optimalRate,
  allowedSlippage,
  inputCurrency,
  outputCurrency,
}) => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { t } = useTranslation();

  const priceImpactWithoutFee = computePriceImpact(optimalRate);
  const isExactIn = optimalRate.side === SwapSide.SELL;
  const currency = isExactIn ? outputCurrency : inputCurrency;
  const tradeAmount = isExactIn
    ? new Fraction(ONE)
        .add(allowedSlippage)
        .invert()
        .multiply(optimalRate.destAmount).quotient
    : new Fraction(ONE).add(allowedSlippage).multiply(optimalRate.srcAmount)
        .quotient;

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
          <small>{Number(allowedSlippage.toSignificant())}%</small>
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
            {(
              Number(tradeAmount.toString()) /
              10 ** currency.decimals
            ).toLocaleString('us')}{' '}
            {currency.symbol}
          </small>
          <CurrencyLogo currency={currency} size='16px' />
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
  inputCurrency?: Currency;
  outputCurrency?: Currency;
}

export const BestTradeAdvancedSwapDetails: React.FC<BestTradeAdvancedSwapDetailsProps> = ({
  optimalRate,
  inputCurrency,
  outputCurrency,
}) => {
  const [allowedSlippage] = useUserSlippageTolerance();
  const pct = basisPointsToPercent(allowedSlippage);

  return (
    <>
      {inputCurrency && outputCurrency && optimalRate && (
        <BestTradeSummary
          optimalRate={optimalRate}
          inputCurrency={inputCurrency}
          outputCurrency={outputCurrency}
          allowedSlippage={pct}
        />
      )}
    </>
  );
};
