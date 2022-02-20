import { Trade, TradeType } from '@uniswap/sdk';
import React, { useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
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

const useStyles = makeStyles(({ palette }) => ({
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '8px 24px 0',
    '& p': {
      color: '#b6b9cc',
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      '& > div': {
        marginLeft: 4,
      },
    },
  },
  swapRoute: {
    margin: '8px 0',
    '& .header': {
      display: 'flex',
      alignItems: 'center',
      '& p': {
        fontSize: 16,
        lineHeight: '28px',
        marginRight: 4,
      },
    },
  },
}));

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

  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(
    trade,
  );
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT;
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(
    trade,
    allowedSlippage,
  );
  const classes = useStyles();
  const tradeAmount = isExactIn ? trade.outputAmount : trade.inputAmount;

  return (
    <Box mt={1.5}>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box className={classes.summaryRow}>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>Slippage:</Typography>
          <QuestionHelper text='Your transaction will revert if the price changes unfavorably by more than this percentage.' />
        </Box>
        <Box
          display='flex'
          alignItems='center'
          onClick={() => setOpenSettingsModal(true)}
        >
          <Typography variant='body2' style={{ color: palette.primary.main }}>
            {allowedSlippage / 100}%
          </Typography>
          <EditIcon style={{ marginLeft: 8, cursor: 'pointer' }} />
        </Box>
      </Box>
      <Box className={classes.summaryRow}>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>
            {isExactIn ? 'Minimum Received:' : 'Maximum sold:'}
          </Typography>
          <QuestionHelper text='Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.' />
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
      <Box className={classes.summaryRow}>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>Price Impact:</Typography>
          <QuestionHelper text='The difference between the market price and estimated price due to trade size.' />
        </Box>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </Box>
      <Box className={classes.summaryRow}>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2'>Liquidity Provider Fee:</Typography>
          <QuestionHelper text='A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive.' />
        </Box>
        <Typography variant='body2'>
          {formatTokenAmount(realizedLPFee)} {trade.inputAmount.currency.symbol}
        </Typography>
      </Box>
      <Box className={classes.summaryRow}>
        <Box display='flex' alignItems='center'>
          <Typography variant='body2' style={{ marginRight: 4 }}>
            Route
          </Typography>
          <QuestionHelper text='Routing through these tokens resulted in the best price for your trade.' />
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
