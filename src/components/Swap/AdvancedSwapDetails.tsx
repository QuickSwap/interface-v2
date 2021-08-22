import { Trade, TradeType } from '@uniswap/sdk';
import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Field } from 'state/swap/actions';
import { useUserSlippageTolerance } from 'state/user/hooks';
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from 'utils/prices';
import { QuestionHelper, FormattedPriceImpact } from 'components';
import SwapRoute from './SwapRoute';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      '& > div': {
        marginLeft: 4
      },
    },
  },
  analyticsWrapper: {
    border: `1px solid ${palette.divider}`,
    borderRadius: 12,
    padding: '8px 0',
    margin: '8px 0',
    '& a': {
      fontSize: 18,
      color: 'white',
      textDecoration: 'none'
    }
  },
  swapRoute: {
    margin: '8px 0',
    '& .header': {
      display: 'flex',
      alignItems: 'center',
      '& p': {
        fontSize: 16,
        lineHeight: '28px',
        marginRight: 4
      }
    }
  }
}));

interface TradeSummaryProps {
  trade: Trade;
  allowedSlippage: number;
}

export const TradeSummary: React.FC<TradeSummaryProps> = ({ trade, allowedSlippage }) => {
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade);
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT;
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage);
  const classes = useStyles();

  return (
    <>
      <Box className={classes.summaryRow}>
        <Box>
          <Typography>
            {isExactIn ? 'Minimum received' : 'Maximum sold'}
          </Typography>
          <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
        </Box>
        <Box>
          <Typography>
            {isExactIn
              ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                '-'
              : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ??
                '-'}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.summaryRow}>
        <Box>
          <Typography>
            Price Impact
          </Typography>
          <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
        </Box>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </Box>
      <Box className={classes.summaryRow}>
        <Box>
          <Typography>
            Liquidity Provider Fee
          </Typography>
          <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
        </Box>
        <Typography>
          {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-'}
        </Typography>
      </Box>
    </>
  )
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export const AdvancedSwapDetails: React.FC<AdvancedSwapDetailsProps> = ({ trade }) => {
  const [allowedSlippage] = useUserSlippageTolerance();
  const classes = useStyles();

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
    <Box mt={2} px={2}>
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <Box className={classes.swapRoute}>
              <Box className='header'>
                <Typography>
                  Route
                </Typography>
                <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
              </Box>
              <SwapRoute trade={trade} />
            </Box>
          )}
          <Box className={classes.analyticsWrapper}>
            <a href={'https://info.quickswap.exchange/pair/' + trade.route.pairs[0].liquidityToken.address} target="_blank" rel='noreferrer'>
              View pair analytics ↗
            </a>
          </Box>
        </>
      )}
    </Box>
  )
}
