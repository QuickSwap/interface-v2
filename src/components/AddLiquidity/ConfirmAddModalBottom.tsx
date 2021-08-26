import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk';
import React from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { CurrencyLogo } from 'components';
import { Field } from 'state/mint/actions';

interface ConfirmAddModalBottomProps {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
}

const ConfirmAddModalBottom: React.FC<ConfirmAddModalBottomProps> = ({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd
}) => {
  return (
    <>
      <Box>
        <Typography>{currencies[Field.CURRENCY_A]?.symbol} Deposited</Typography>
        <Box>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <Typography>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Typography>
        </Box>
      </Box>
      <Box>
        <Typography>{currencies[Field.CURRENCY_B]?.symbol} Deposited</Typography>
        <Box>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <Typography>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Typography>
        </Box>
      </Box>
      <Box>
        <Typography>Rates</Typography>
        <Typography>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
            currencies[Field.CURRENCY_B]?.symbol
          }`}
        </Typography>
      </Box>
      <Box style={{ justifyContent: 'flex-end' }}>
        <Typography>
          {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
            currencies[Field.CURRENCY_A]?.symbol
          }`}
        </Typography>
      </Box>
      <Box>
        <Typography>Share of Pool:</Typography>
        <Typography>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</Typography>
      </Box>
      <Button style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
      </Button>
    </>
  )
}

export default ConfirmAddModalBottom;
