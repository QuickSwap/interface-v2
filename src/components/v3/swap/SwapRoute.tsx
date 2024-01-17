import React, { Fragment, memo } from 'react';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { Trade as V3Trade } from 'lib/trade';
import { ChevronRight } from 'react-feather';
import { Box } from '@mui/material';
import { unwrappedToken } from 'utils/unwrappedToken';

function LabeledArrow() {
  // todo: render the fee in the label
  return <ChevronRight size={14} className='text-secondary' />;
}

export default memo(function SwapRoute({
  trade,
}: {
  trade: V3Trade<Currency, Currency, TradeType>;
}) {
  const tokenPath = trade.route.tokenPath;
  return (
    <Box className='flex flex-wrap items-center' width='100%'>
      {tokenPath.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1;
        const currency = unwrappedToken(token);
        return (
          <Fragment key={i}>
            <div className='flex items-end'>
              <small style={{ margin: '0 0.145rem' }}>{currency.symbol}</small>
            </div>
            {isLastItem ? null : <LabeledArrow />}
          </Fragment>
        );
      })}
    </Box>
  );
});
