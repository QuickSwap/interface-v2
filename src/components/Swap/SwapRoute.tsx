import { Trade } from '@uniswap/sdk';
import { Fragment, memo } from 'react';
import { ChevronRight } from 'react-feather';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CurrencyLogo } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  swapRoute: {
    padding: 12,
    border: `1px solid ${palette.divider}`,
    borderRadius: 12,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      margin: '8px 0',
      '& p': {
        fontSize: 16,
        lineHeight: '24px',
        marginLeft: 6
      }
    }
  }
}));

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  const classes = useStyles();
  return (
    <Box className={classes.swapRoute}>
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        return (
          <Fragment key={i}>
            <Box>
              <CurrencyLogo currency={token} size="1.5rem" />
              <Typography>
                {token.symbol}
              </Typography>
            </Box>
            {isLastItem ? null : <ChevronRight />}
          </Fragment>
        )
      })}
    </Box>
  )
})
