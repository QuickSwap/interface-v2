import React, { Fragment, memo } from 'react';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { Trade as V3Trade } from 'lib/src/trade';
import { ChevronRight } from 'react-feather';
import { Box } from '@material-ui/core';
import { unwrappedToken } from 'utils/unwrappedToken';
import { FeeAmount } from 'lib/src/constants';

function LabeledArrow({}: { fee: FeeAmount }) {
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
              <p style={{ margin: '0 0.145rem' }}>{currency.symbol}</p>
            </div>
            {isLastItem ? null : (
              <LabeledArrow fee={trade.route.pools[i].fee} />
            )}
          </Fragment>
        );
      })}
    </Box>
  );
});
