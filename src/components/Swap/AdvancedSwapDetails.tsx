import { Trade, TradeType } from '@uniswap/sdk';
import React, { useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
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
import { ReactComponent as EditIcon } from 'assets/images/EditIcon.svg';
import { formatTokenAmount } from 'utils';

interface TradeSummaryProps {
  trade: Trade;
  allowedSlippage: number;
}

export const TradeSummary: React.FC<TradeSummaryProps> = ({
  trade,
  allowedSlippage,
}) => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { palette } = useTheme();
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
      <Box className='summaryRow'>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>Slippage:</Typography>
          <QuestionHelper text={t('slippageHelper')} />
        </Box>
        <Box
          display='flex'
          alignItems='center'
          onClick={() => setOpenSettingsModal(true)}
          style={{ cursor: 'pointer' }}
        >
          <Typography variant='body2' style={{ color: palette.primary.main }}>
            {allowedSlippage / 100}%
          </Typography>
          <EditIcon style={{ marginLeft: 8 }} />
        </Box>
      </Box>
      <Box className='summaryRow'>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>
            {isExactIn ? t('minReceived') : t('maxSold')}:
          </Typography>
          <QuestionHelper text={t('txLimitHelper')} />
        </Box>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>
            {formatTokenAmount(
              slippageAdjustedAmounts[isExactIn ? Field.OUTPUT : Field.INPUT],
            )}{' '}
            {tradeAmount.currency.symbol}
          </Typography>
          <Box
            width={16}
            height={16}
            ml={0.5}
            borderRadius={8}
            overflow='hidden'
          >
            <CurrencyLogo currency={tradeAmount.currency} size='16px' />
          </Box>
        </Box>
      </Box>
      <Box className='summaryRow'>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>Price Impact:</Typography>
          <QuestionHelper text={t('priceImpactHelper')} />
        </Box>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </Box>
      <Box className='summaryRow'>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>Liquidity Provider Fee:</Typography>
          <QuestionHelper text={t('liquidityProviderFeeHelper')} />
        </Box>
        <Typography variant='body2'>
          {formatTokenAmount(realizedLPFee)} {trade.inputAmount.currency.symbol}
        </Typography>
      </Box>
      <Box className='summaryRow'>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2' style={{ marginRight: 4 }}>
            Route
          </Typography>
          <QuestionHelper text={t('swapRouteHelper')} />
        </Box>
        <Box>
          {trade.route.path.map((token, i, path) => {
            const isLastItem: boolean = i === path.length - 1;
            return (
              <Box key={i} display='flex' alignItems='center'>
                <Typography variant='body2'>
                  {token.symbol}{' '}
                  {// this is not to show the arrow at the end of the trade path
                  isLastItem ? '' : ' > '}
                </Typography>
              </Box>
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
