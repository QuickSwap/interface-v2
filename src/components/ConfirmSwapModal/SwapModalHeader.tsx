import { Trade, TradeType } from '@uniswap/sdk';
import React, { useMemo } from 'react';
import { AlertTriangle } from 'react-feather';
import { Box, Button } from '@material-ui/core';
import { Field } from 'state/swap/actions';
import { DoubleCurrencyLogo } from 'components';
import useUSDCPrice from 'utils/useUSDCPrice';
import { computeSlippageAdjustedAmounts } from 'utils/prices';
import { ReactComponent as ArrowDownIcon } from 'assets/images/ArrowDownIcon.svg';
import { formatTokenAmount } from 'utils';

interface SwapModalHeaderProps {
  trade: Trade;
  allowedSlippage: number;
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
  onConfirm: () => void;
}

const SwapModalHeader: React.FC<SwapModalHeaderProps> = ({
  trade,
  allowedSlippage,
  showAcceptChanges,
  onAcceptChanges,
  onConfirm,
}) => {
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [trade, allowedSlippage],
  );
  const usdPrice = useUSDCPrice(trade.inputAmount.currency);

  return (
    <Box>
      <Box mt={10} className='flex justify-center'>
        <DoubleCurrencyLogo
          currency0={trade.inputAmount.currency}
          currency1={trade.outputAmount.currency}
          size={48}
        />
      </Box>
      <Box className='swapContent'>
        <p>
          Swap {formatTokenAmount(trade.inputAmount)}{' '}
          {trade.inputAmount.currency.symbol} ($
          {Number(usdPrice?.toSignificant()) *
            Number(trade.inputAmount.toSignificant(2))}
          )
        </p>
        <ArrowDownIcon />
        <p>
          {formatTokenAmount(trade.outputAmount)}{' '}
          {trade.outputAmount.currency.symbol}
        </p>
      </Box>
      {showAcceptChanges && (
        <Box className='priceUpdate'>
          <Box>
            <AlertTriangle size={20} />
            <p> Price Updated</p>
          </Box>
          <Button onClick={onAcceptChanges}>Accept</Button>
        </Box>
      )}
      <Box className='transactionText'>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <p className='small'>
            {`Output is estimated. You will receive at least `}
            {formatTokenAmount(slippageAdjustedAmounts[Field.OUTPUT])}{' '}
            {trade.outputAmount.currency.symbol}
            {' or the transaction will revert.'}
          </p>
        ) : (
          <p className='small'>
            {`Input is estimated. You will sell at most `}
            {formatTokenAmount(slippageAdjustedAmounts[Field.INPUT])}{' '}
            {trade.inputAmount.currency.symbol}
            {' or the transaction will revert.'}
          </p>
        )}
        <Button onClick={onConfirm} className='swapButton'>
          Confirm Swap
        </Button>
      </Box>
    </Box>
  );
};

export default SwapModalHeader;
