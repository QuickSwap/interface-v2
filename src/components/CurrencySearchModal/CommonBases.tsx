import React from 'react';
import { ChainId, Currency, currencyEquals, ETHER, Token } from '@uniswap/sdk';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SUGGESTED_BASES } from 'constants/index';
import { CurrencyLogo, QuestionHelper } from 'components';

const useStyles = makeStyles(({ palette }) => ({
  baseWrapper: {
    borderRadius: 18,
    display: 'flex',
    padding: '6px 10px',
    margin: '4px 8px 4px 0',
    alignItems: 'center',
    backgroundColor: palette.secondary.dark,
    '&:hover': {
      cursor: 'pointer',
    },
    '& p': {
      marginLeft: 6,
    },
  },
  title: {
    '& span': {
      marginRight: 4,
      color: palette.text.secondary,
    },
  },
}));

interface CommonBasesProps {
  chainId?: ChainId;
  selectedCurrency?: Currency | null;
  onSelect: (currency: Currency) => void;
}

const CommonBases: React.FC<CommonBasesProps> = ({
  chainId,
  onSelect,
  selectedCurrency,
}) => {
  const classes = useStyles();
  return (
    <Box mb={2}>
      <Box display='flex' className={classes.title} my={1.5}>
        <Typography variant='caption'>Common bases</Typography>
        <QuestionHelper text='These tokens are commonly paired with other tokens.' />
      </Box>
      <Box display='flex' flexWrap='wrap'>
        <Box
          className={classes.baseWrapper}
          onClick={() => {
            if (!selectedCurrency || !currencyEquals(selectedCurrency, ETHER)) {
              onSelect(ETHER);
            }
          }}
        >
          <CurrencyLogo currency={ETHER} size='24px' />
          <Typography variant='body2'>MATIC</Typography>
        </Box>
        {(chainId ? SUGGESTED_BASES[chainId] : []).map((token: Token) => {
          const selected =
            selectedCurrency instanceof Token &&
            selectedCurrency.address === token.address;
          return (
            <Box
              className={classes.baseWrapper}
              key={token.address}
              onClick={() => !selected && onSelect(token)}
            >
              <CurrencyLogo currency={token} size='24px' />
              <Typography variant='body2'>{token.symbol}</Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default CommonBases;
