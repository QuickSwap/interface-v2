import React from 'react'
import { ChainId, Currency, currencyEquals, ETHER, Token } from '@uniswap/sdk';
import { Box, Typography, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SUGGESTED_BASES } from 'constants/index';
import { CurrencyLogo, QuestionHelper } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  baseWrapper: {
    border: `1px solid ${palette.divider}`,
    borderRadius: 10,
    display: 'flex',
    padding: 6,
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: palette.background.paper
    }
  }
}));

interface CommonBasesProps {
  chainId?: ChainId
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
}

const CommonBases: React.FC<CommonBasesProps> = ({
  chainId,
  onSelect,
  selectedCurrency
}) => {
  const classes = useStyles();
  return (
    <Box>
      <Box>
        <Typography>
          Common bases
        </Typography>
        <QuestionHelper text="These tokens are commonly paired with other tokens." />
      </Box>
      <Box>
        <Button
          className={classes.baseWrapper}
          onClick={() => {
            if (!selectedCurrency || !currencyEquals(selectedCurrency, ETHER)) {
              onSelect(ETHER)
            }
          }}
          disabled={selectedCurrency === ETHER}
        >
          <CurrencyLogo currency={ETHER} style={{ marginRight: 8 }} />
          <Typography>
            MATIC
          </Typography>
        </Button>
        {(chainId ? SUGGESTED_BASES[chainId] : []).map((token: Token) => {
          const selected = selectedCurrency instanceof Token && selectedCurrency.address === token.address
          return (
            <Button className={classes.baseWrapper} onClick={() => !selected && onSelect(token)} disabled={selected}>
              <CurrencyLogo currency={token} style={{ marginRight: 8 }} />
              <Typography>
                {token.symbol}
              </Typography>
            </Button>
          )
        })}
      </Box>
    </Box>
  )
}

export default CommonBases;
