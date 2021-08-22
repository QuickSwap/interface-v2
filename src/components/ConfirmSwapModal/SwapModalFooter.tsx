import { Trade, TradeType } from '@uniswap/sdk'
import React, { useContext, useMemo, useState } from 'react'
import { Button, Box, Typography } from '@material-ui/core'
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

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ])
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)

  return (
    <>
      <Box>
        <Box>
          <Typography>
            Price
          </Typography>
          <Typography>
            {formatExecutionPrice(trade, showInverted)}
            <Box onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </Box>
          </Typography>
        </Box>

        <Box>
          <Box>
            <Typography>
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </Typography>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </Box>
          <Box>
            <Typography>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </Typography>
            <Typography>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Box>
            <Typography>
              Price Impact
            </Typography>
            <QuestionHelper text="The difference between the market price and your price due to trade size." />
          </Box>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </Box>
        <Box>
          <Box>
            <Typography>
              Liquidity Provider Fee
            </Typography>
            <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
          </Box>
          <Typography>
            {realizedLPFee ? realizedLPFee?.toSignificant(6) + ' ' + trade.inputAmount.currency.symbol : '-'}
          </Typography>
        </Box>
      </Box>

      <Box>
        <Button
          onClick={onConfirm}
          disabled={disabledConfirm}
          // error={severity > 2}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
        >
          <Typography>
            {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
          </Typography>
        </Button>

        {swapErrorMessage &&
          <Box>
            <AlertTriangle size={24} />
            <p>swapErrorMessage</p>
          </Box>
        }
      </Box>
    </>
  )
}
