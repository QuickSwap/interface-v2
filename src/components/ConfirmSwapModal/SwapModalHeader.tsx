import { Trade, TradeType } from '@uniswap/sdk'
import React, { useMemo } from 'react'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { Box, Typography, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Field } from 'state/swap/actions'
import { CurrencyLogo } from 'components'
import { isAddress, shortenAddress } from 'utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from 'utils/prices'

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  swapCurrency: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'black',
    margin: '8px 0',
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      '& img': {
        marginRight: 4
      }
    }
  },
  arrowContainer: {
    marginLeft: 4,
    display: 'flex'
  },
  priceUpdate: {
    backgroundColor: 'rgba(40, 145, 249, 0.1)',
    margin: '16px 0',
    padding: 8,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: palette.secondary.dark,
    '& > div': {
      display: 'flex',
      alignItems: 'center'
    }
  },
  transactionText: {
    color: 'black',
    '& p': {
      fontStyle: 'italic',
    }
  }
}));

interface SwapModalHeaderProps {
  trade: Trade
  allowedSlippage: number
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}

const SwapModalHeader: React.FC<SwapModalHeaderProps> = ({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}) => {
  const classes = useStyles();
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  return (
    <Box>
      <Box className={classes.swapCurrency}>
        <Box>
          <CurrencyLogo currency={trade.inputAmount.currency} size={'48px'} style={{ marginRight: '12px' }} />
          <CurrencyLogo currency={trade.outputAmount.currency} size={'48px'} />
        </Box>
        <Typography style={{ color: showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? 'black' : '' }}>
          {trade.inputAmount.toSignificant(6)}
        </Typography>
        <Typography style={{ marginLeft: '10px' }}>
          {trade.inputAmount.currency.symbol}
        </Typography>
      </Box>
      <Box className={classes.arrowContainer}>
        <ArrowDown size="16" color='black' />
      </Box>
      <Box className={classes.swapCurrency}>
        <Box>
          <Typography
            style={{ color: priceImpactSeverity > 2
              ? 'red'
              : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
              ? 'blue'
              : ''}}
          >
            {trade.outputAmount.toSignificant(6)}
          </Typography>
        </Box>
        <Typography style={{ marginLeft: '10px' }}>
          {trade.outputAmount.currency.symbol}
        </Typography>
      </Box>
      {showAcceptChanges && (
        <Box className={classes.priceUpdate}>
          <Box>
            <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
            <Typography> Price Updated</Typography>
          </Box>
          <Button
            style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
            onClick={onAcceptChanges}
          >
            Accept
          </Button>
        </Box>
      )}
      <Box className={classes.transactionText}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <Typography>
            {`Output is estimated. You will receive at least `}
            <b>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </Typography>
        ) : (
          <Typography>
            {`Input is estimated. You will sell at most `}
            <b>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </Typography>
        )}
      </Box>
      {recipient !== null ? (
        <Box>
          <Typography>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}

export default SwapModalHeader;