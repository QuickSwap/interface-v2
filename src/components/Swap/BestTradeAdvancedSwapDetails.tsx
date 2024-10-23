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
import { useAutoSlippageToleranceBestTrade } from 'hooks/useAutoSlippageTolerance';
import { SLIPPAGE_AUTO } from 'state/user/reducer';
import { InfomationHelper } from 'components/QuestionHelper';
import { ReactComponent as SettingsIcon } from 'assets/images/icons/cog-fill.svg';

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
  const [userSlippage] = useUserSlippageTolerance();

  const priceImpactWithoutFee = computePriceImpact(optimalRate);
  const isExactIn = optimalRate.side === SwapSide.SELL;
  const currency = isExactIn ? outputCurrency : inputCurrency;
  const autoSlippage = useAutoSlippageToleranceBestTrade(optimalRate);
  const tradeAmount = isExactIn
    ? new Fraction(ONE)
        .add(userSlippage === SLIPPAGE_AUTO ? autoSlippage : allowedSlippage)
        .invert()
        .multiply(optimalRate.destAmount).quotient
    : new Fraction(ONE)
        .add(userSlippage === SLIPPAGE_AUTO ? autoSlippage : allowedSlippage)
        .multiply(optimalRate.srcAmount).quotient;

  return (
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
      {/* {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )} */}
      <Box className='summaryRow subtext-color'>
        <Box>
          <InfomationHelper text={t('slippageHelper')} />
          <small>{t('slippage')}</small>
        </Box>
        <Box
          onClick={() => setOpenSettingsModal(true)}
          className='swapSlippage'
        >
          <small>
            {userSlippage === SLIPPAGE_AUTO
              ? Number(autoSlippage.toSignificant())
              : Number(allowedSlippage.toSignificant())}
            %
          </small>
          <SettingsIcon />
        </Box>
      </Box>
      <Box className='summaryRow subtext-color'>
        <Box>
          <InfomationHelper text={t('txLimitHelper')} />
          <small>{isExactIn ? t('minReceived') : t('maxSold')}</small>
        </Box>
        <Box>
          <small>
            {(
              Number(tradeAmount.toString()) /
              10 ** currency.decimals
            ).toLocaleString('us')}{' '}
            {currency.symbol}
          </small>
        </Box>
      </Box>
      <Box className='summaryRow subtext-color'>
        <Box>
          <InfomationHelper text={t('priceImpactHelper')} />
          <small>{t('priceimpact')}</small>
        </Box>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </Box>
    </Box>
  );
};

export interface BestTradeAdvancedSwapDetailsProps {
  optimalRate?: OptimalRate | null;
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
