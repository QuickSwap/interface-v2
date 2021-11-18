import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk';
import React from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CurrencyLogo } from 'components';
import { Field } from 'state/mint/actions';

const useStyles = makeStyles(({}) => ({
  bottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'black',
    margin: '8px 0',
    '& img': {
      borderRadius: 12,
    },
  },
  confirmButton: {
    width: '100%',
    borderRadius: 12,
    height: 48,
    fontSize: 18,
    margin: '12px 0',
  },
}));

interface ConfirmAddModalBottomProps {
  noLiquidity?: boolean;
  price?: Fraction;
  currencies: { [field in Field]?: Currency };
  parsedAmounts: { [field in Field]?: CurrencyAmount };
  poolTokenPercentage?: Percent;
  onAdd: () => void;
}

const ConfirmAddModalBottom: React.FC<ConfirmAddModalBottomProps> = ({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
}) => {
  const classes = useStyles();
  return (
    <>
      <Box className={classes.bottomRow}>
        <Typography>
          {currencies[Field.CURRENCY_A]?.symbol} Deposited
        </Typography>
        <Box display='flex' alignItems='center'>
          <CurrencyLogo
            currency={currencies[Field.CURRENCY_A]}
            style={{ marginRight: '8px' }}
          />
          <Typography>
            {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.bottomRow}>
        <Typography>
          {currencies[Field.CURRENCY_B]?.symbol} Deposited
        </Typography>
        <Box display='flex' alignItems='center'>
          <CurrencyLogo
            currency={currencies[Field.CURRENCY_B]}
            style={{ marginRight: '8px' }}
          />
          <Typography>
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.bottomRow}>
        <Typography>Rates</Typography>
        <Typography>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(
            4,
          )} ${currencies[Field.CURRENCY_B]?.symbol}`}
        </Typography>
      </Box>
      <Box className={classes.bottomRow}>
        <Typography />
        <Typography>
          {`1 ${
            currencies[Field.CURRENCY_B]?.symbol
          } = ${price?.invert().toSignificant(4)} ${
            currencies[Field.CURRENCY_A]?.symbol
          }`}
        </Typography>
      </Box>
      <Box className={classes.bottomRow}>
        <Typography>Share of Pool:</Typography>
        <Typography>
          {noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%
        </Typography>
      </Box>
      <Button className={classes.confirmButton} onClick={onAdd}>
        {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
      </Button>
    </>
  );
};

export default ConfirmAddModalBottom;
