import { Trade, TradeType } from '@uniswap/sdk'
import React, { useMemo, useState } from 'react'
import { Button, Box, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { AlertTriangle, Repeat } from 'react-feather'
import { Field } from 'state/swap/actions'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity
} from 'utils/prices'
import { QuestionHelper } from 'components'
import FormattedPriceImpact from './FormattedPriceImpact'

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  swapFooterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '4px 0',
    '& p': {
      color: 'black',
      '&.headingText': {
        color: 'rgb(86, 90, 105)'
      }
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center'
    },
  },
  questionWrapper: {
    marginLeft: 4,
    '& > div': {
      background: 'white',
      color: 'black',
    }
  },
  swapButton: {
    width: '100%',
    fontSize: 20,
    height: 48,
    margin: '16px 0 0',
    borderRadius: 16
  },
  swapError: {
    color: palette.error.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& p': {
      marginLeft: 6
    }
  }
}));

interface SwapModalFooterProps {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}

const SwapModalFooter: React.FC<SwapModalFooterProps> = ({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm
}) => {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ])
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)
  const classes = useStyles({ severity });

  return (
    <>
      <Box>
        <Box className={classes.swapFooterRow}>
          <Typography className='headingText'>
            Price
          </Typography>
          <Box>
            <Typography>
              {formatExecutionPrice(trade, showInverted)}
            </Typography>
            <Box display='flex' ml={0.5} onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} color='black' />
            </Box>
          </Box>
        </Box>
        <Box className={classes.swapFooterRow}>
          <Box>
            <Typography className='headingText'>
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </Typography>
            <Box className={classes.questionWrapper}>
              <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
            </Box>
          </Box>
          <Box>
            <Typography>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </Typography>
            <Typography>
              &nbsp;{trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.swapFooterRow}>
          <Box>
            <Typography className='headingText'>
              Price Impact
            </Typography>
            <Box className={classes.questionWrapper}>
              <QuestionHelper text="The difference between the market price and your price due to trade size." />
            </Box>
          </Box>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </Box>
        <Box className={classes.swapFooterRow}>
          <Box>
            <Typography className='headingText'>
              Liquidity Provider Fee
            </Typography>
            <Box className={classes.questionWrapper}>
              <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
            </Box>
          </Box>
          <Typography>
            {realizedLPFee ? realizedLPFee?.toSignificant(6) + ' ' + trade.inputAmount.currency.symbol : '-'}
          </Typography>
        </Box>
      </Box>

      <Button
        onClick={onConfirm}
        disabled={disabledConfirm}
        className={classes.swapButton}
        // error={severity > 2}
      >
        {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
      </Button>

      {swapErrorMessage &&
        <Box className={classes.swapError}>
          <AlertTriangle size={24} />
          <p>{ swapErrorMessage }</p>
        </Box>
      }
    </>
  )
}

export default SwapModalFooter;
