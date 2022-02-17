import { Trade } from '@uniswap/sdk';
import React from 'react';
import { ChevronRight } from 'react-feather';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CurrencyLogo } from 'components';

const useStyles = makeStyles(({ palette }) => ({
  swapRoute: {
    padding: 12,
    border: `1px solid ${palette.divider}`,
    borderRadius: 12,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    '& p': {
      fontSize: 16,
      lineHeight: '24px',
      marginLeft: 6,
    },
  },
}));

const SwapRoute: React.FC<{ trade: Trade }> = ({ trade }) => {
  const classes = useStyles();
  return (
    <Box className={classes.swapRoute}>
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1;
        return (
          <Box key={i} display='flex' alignItems='center' my={0.5}>
            <Box display='flex' alignItems='center'>
              <CurrencyLogo currency={token} size='24px' />
              <Typography>{token.symbol}</Typography>
            </Box>
            {// this is not to show the arrow at the end of the trade path
            !isLastItem && <ChevronRight />}
          </Box>
        );
      })}
    </Box>
  );
};

export default React.memo(SwapRoute);
