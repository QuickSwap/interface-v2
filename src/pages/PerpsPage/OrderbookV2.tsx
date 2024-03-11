import { useState } from 'react';
import { OrderBook } from '@orderly.network/react';
import { useOrderbookStream, useSymbolsInfo } from '@orderly.network/hooks';
import '@orderly.network/react/dist/styles.css';
export const OrderbookV2 = () => {
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
    <div style={{ width: 300, height: 480 }}>
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
