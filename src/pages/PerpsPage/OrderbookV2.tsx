import React, { useState } from 'react';
import { OrderBook } from '@orderly.network/react';
import { useOrderbookStream, useSymbolsInfo } from '@orderly.network/hooks';
import '@orderly.network/react/dist/styles.css';
import { Box } from '@material-ui/core';

export const OrderbookV2: React.FC<{
  token: any;
  setOrderQuantity: (item: number[]) => void;
}> = ({ token, setOrderQuantity }) => {
  const [symbol, setSymbol] = useState('PERP_ETH_USDC');
  const config = useSymbolsInfo();
  const symbolInfo = config[token];

  const [
    data,
    { onDepthChange, isLoading, onItemClick, depth, allDepths },
  ] = useOrderbookStream(token || 'PERP_ETH_USDC', undefined, {
    level: 7,
  });

  const handleItemClick = (item: number[]) => {
    setOrderQuantity(item);
  };

  return (
    <Box padding='7px 10px'>
      <OrderBook
        level={7}
        asks={data.asks ?? []}
        bids={data.bids ?? []}
        markPrice={data?.markPrice ?? 0}
        lastPrice={data.middlePrice ?? []}
        depth={allDepths ?? []}
        activeDepth={depth ?? 0}
        base={symbolInfo('base')}
        quote={symbolInfo('quote')}
        isLoading={isLoading}
        onItemClick={handleItemClick}
        onDepthChange={onDepthChange}
        cellHeight={22}
      />
    </Box>
  );
};
