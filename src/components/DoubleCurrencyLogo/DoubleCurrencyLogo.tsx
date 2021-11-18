import { Currency } from '@uniswap/sdk';
import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CurrencyLogo } from 'components';

const useStyles = makeStyles(({}) => ({
  wrapper: {
    position: 'relative',
    display: 'flex',
    '& > div:first-child': {
      zIndex: 2,
      marginRight: -4,
    },
  },
}));

interface DoubleCurrencyLogoProps {
  margin?: boolean;
  size?: number;
  currency0?: Currency;
  currency1?: Currency;
}
const DoubleCurrencyLogo: React.FC<DoubleCurrencyLogoProps> = ({
  currency0,
  currency1,
  size = 16,
  margin = false,
}: DoubleCurrencyLogoProps) => {
  const classes = useStyles({ size, margin });
  return (
    <Box className={classes.wrapper}>
      <CurrencyLogo currency={currency0} size={size.toString() + 'px'} />
      <CurrencyLogo currency={currency1} size={size.toString() + 'px'} />
    </Box>
  );
};

export default DoubleCurrencyLogo;
