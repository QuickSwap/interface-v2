import React, { useState } from 'react';
import { OrderBook } from '@orderly.network/react';
import { useOrderbookStream, useSymbolsInfo } from '@orderly.network/hooks';

export const MyOrderBook: React.FC = () => {
  const [symbol, setSymbol] = useState('PERP_ETH_USDC');
  const config = useSymbolsInfo();
  const symbolInfo = config ? config[symbol] : {};

  const [
    data,
    { onDepthChange, isLoading, onItemClick, depth, allDepths },
  ] = useOrderbookStream(symbol, undefined, {
    level: 7,
  });

  return (
    <div className='bg-neutral-900 px-5 py-3 w-[300px] rounded-lg h-[480px]'>
      {/* <OrderBook
        level={7}
        asks={data.asks ?? []}
        bids={data.bids ?? []}
        markPrice={data.markPrice ?? 0}
        lastPrice={data.middlePrice ?? []}
        depth={allDepths ?? []}
        activeDepth={depth ?? 0}
        base={symbolInfo('base')}
        quote={symbolInfo('quote')}
        isLoading={isLoading}
        onItemClick={onItemClick}
        onDepthChange={onDepthChange}
        cellHeight={22}
      /> */}
    </div>
  );
};
