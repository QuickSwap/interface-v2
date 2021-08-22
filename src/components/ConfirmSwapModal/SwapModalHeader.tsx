import { Trade, TradeType } from '@uniswap/sdk'
import React, { useContext, useMemo } from 'react'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { Box, Typography, Button } from '@material-ui/core'
import { Field } from 'state/swap/actions'
import { CurrencyLogo } from 'components'
import { isAddress, shortenAddress } from 'utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from 'utils/prices'

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}: {
  trade: Trade
  allowedSlippage: number
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  return (
    <Box>
      <Box>
        <Box>
          <CurrencyLogo currency={trade.inputAmount.currency} size={'24px'} style={{ marginRight: '12px' }} />
          <Typography style={{ color: showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? 'black' : '' }}>
            {trade.inputAmount.toSignificant(6)}
          </Typography>
        </Box>
        <Box>
          <Typography style={{ marginLeft: '10px' }}>
            {trade.inputAmount.currency.symbol}
          </Typography>
        </Box>
      </Box>
      <Box>
        <ArrowDown size="16" color='black' style={{ marginLeft: '4px', minWidth: '16px' }} />
      </Box>
      <Box>
        <Box>
          <CurrencyLogo currency={trade.outputAmount.currency} size={'24px'} style={{ marginRight: '12px' }} />
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
        <Box>
          <Typography style={{ marginLeft: '10px' }}>
            {trade.outputAmount.currency.symbol}
          </Typography>
        </Box>
      </Box>
      {showAcceptChanges && (
        <Box>
          <Box>
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
        </Box>
      )}
      <Box style={{ padding: '12px 0 0 0px' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <Typography style={{ fontStyle: 'italic', width: '100%' }}>
            {`Output is estimated. You will receive at least `}
            <b>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </Typography>
        ) : (
          <Typography style={{ fontStyle: 'italic', width: '100%' }}>
            {`Input is estimated. You will sell at most `}
            <b>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </Typography>
        )}
      </Box>
      {recipient !== null ? (
        <Box style={{ padding: '12px 0 0 0px' }}>
          <Typography>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}
