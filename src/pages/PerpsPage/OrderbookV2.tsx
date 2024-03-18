import { useState } from 'react';
import { OrderBook } from '@orderly.network/react';
import { useOrderbookStream, useSymbolsInfo } from '@orderly.network/hooks';
import '@orderly.network/react/dist/styles.css';
export const OrderbookV2 = ({ token }) => {
  const [symbol, setSymbol] = useState('PERP_ETH_USDC');
  const config = useSymbolsInfo();
  const symbolInfo = config ? config[token] : {};

  const [
    data,
    { onDepthChange, isLoading, onItemClick, depth, allDepths },
  ] = useOrderbookStream(token || 'PERP_ETH_USDC', undefined, {
    level: 7,
  });

  return (
    <div>
      <OrderBook
        level={7}
        asks={data.asks}
        bids={data.bids}
        markPrice={data.markPrice}
        lastPrice={data.middlePrice!}
        depth={allDepths}
        activeDepth={depth}
        base={symbolInfo('base')}
        quote={symbolInfo('quote')}
        isLoading={isLoading}
        onItemClick={onItemClick}
        onDepthChange={onDepthChange}
        cellHeight={22}
      />
    </div>
  );
};
