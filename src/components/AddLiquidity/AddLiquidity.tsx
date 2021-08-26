import React, { useCallback } from 'react';
import { Box, Button, Typography } from '@material-ui/core';
import { CurrencyInput } from 'components';
import { makeStyles } from '@material-ui/core/styles';
import { Currency, currencyEquals, ETHER, TokenAmount, WETH } from '@uniswap/sdk'
import AddIcon from '@material-ui/icons/Add';
import { useActiveWeb3React } from 'hooks';
import { Field } from 'state/mint/actions';
import { PairState } from 'data/Reserves'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'state/mint/hooks';
import { maxAmountSpend } from 'utils';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  exchangeSwap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    background: palette.background.default,
    border: `2px solid ${palette.primary.dark}`,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '-20px auto',
    zIndex: 2,
    position: 'relative',
    '& svg': {
      width: 32,
      height: 32,
      color: palette.primary.main
    }
  },
  swapButtonWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 16,
    '& button': {
      height: 56,
      fontSize: 16,
      fontWeight: 'normal',
      '& .content': {
        display: 'flex',
        alignItems: 'center',
        '& > div': {
          color: 'white',
          marginLeft: 6
        }
      },
      width: '100%',
      '& p': {
        fontSize: 16
      }
    }
  },
  swapPrice: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '16px 8px 0',
    '& p': {
      display: 'flex',
      alignItems: 'center',
      '& svg': {
        marginLeft: 8,
        width: 16,
        height: 16,
        cursor: 'pointer'
      }
    }
  }
}));

const AddLiquidity: React.FC = () => {
  const classes = useStyles();

  const { account } = useActiveWeb3React();

  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error
  } = useDerivedMintInfo(undefined, undefined);

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field])
      }
    },
    {}
  );

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  };

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      // const newCurrencyIdA = currencyId(currencyA)
      // if (newCurrencyIdA === currencyIdB) {
      //   history.push(`/add/${currencyIdB}/${currencyIdA}`)
      // } else {
      //   history.push(`/add/${newCurrencyIdA}/${currencyIdB}`)
      // }
    },
    []
  )
  
  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      // const newCurrencyIdB = currencyId(currencyB)
      // if (currencyIdA === newCurrencyIdB) {
      //   if (currencyIdB) {
      //     history.push(`/add/${currencyIdB}/${newCurrencyIdB}`)
      //   } else {
      //     history.push(`/add/${newCurrencyIdB}`)
      //   }
      // } else {
      //   history.push(`/add/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`)
      // }
    },
    []
  )

  const onAdd = () => {

  }

  const connectWallet = () => {
    
  }

  return (
    <Box>
      <CurrencyInput title='Input 1:' currency={currencies[Field.CURRENCY_A]} onMax={() => onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')} handleCurrencySelect={handleCurrencyASelect} amount={formattedAmounts[Field.CURRENCY_A]} setAmount={onFieldAInput} />
      <Box className={classes.exchangeSwap}>
        <AddIcon />
      </Box>
      <CurrencyInput title='Input 2:' currency={currencies[Field.CURRENCY_B]} onMax={() => onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')} handleCurrencySelect={handleCurrencyBSelect} amount={formattedAmounts[Field.CURRENCY_B]} setAmount={onFieldBInput} />
      {
        currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID &&
          <Box className={classes.swapPrice}>
            <Typography>Price:</Typography>
            <Typography>1 { currencies[Field.CURRENCY_A]?.symbol } = { price?.toSignificant(6) } { currencies[Field.CURRENCY_B]?.symbol } </Typography>
          </Box>
      }
      <Box className={classes.swapButtonWrapper}>
        <Button color='primary' onClick={account ? onAdd : connectWallet}>
          Supply
        </Button>
      </Box>
    </Box>
  )
}

export default AddLiquidity;