import React, { useState } from 'react';
import { useMarketsStream } from '@orderly.network/hooks';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import { FC } from 'react';
import {
  AppBar,
  Box,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from '@material-ui/core';

interface Ticker {
  symbol: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  count: number;
}
const tickers: Ticker[] = [
  {
    symbol: 'AAPL',
    open: 150,
    close: 155,
    high: 157,
    low: 149,
    volume: 100000,
    amount: 15000000,
    count: 12000,
  },
  {
    symbol: 'GOOGL',
    open: 120,
    close: 125,
    high: 130,
    low: 115,
    volume: 200000,
    amount: 25000000,
    count: 22000,
  },
  {
    symbol: 'MSFT',
    open: 210,
    close: 215,
    high: 220,
    low: 205,
    volume: 150000,
    amount: 32000000,
    count: 18000,
  },
];
export const Pairs: FC = () => {
  // const { ticker } = useMarketsStream();
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    tickers[0].symbol,
  );

  const handleChange = (event: any) => {
    setSelectedSymbol(event.target.value as string);
  };

  const selectedTicker = tickers.find(
    (ticker) => ticker.symbol === selectedSymbol,
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar>
          <Select
            value={selectedSymbol}
            onChange={handleChange}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginLeft: 4,
            }}
          >
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>
            {tickers.map((ticker) => (
              <MenuItem key={ticker.symbol} value={ticker.symbol}>
                {ticker.symbol}
              </MenuItem>
            ))}
          </Select>
          {selectedTicker && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginLeft: 4,
              }}
            >
              <Typography variant='body1' style={{ marginRight: 2 }}>
                Open: {selectedTicker.open}
              </Typography>
              <Typography variant='body1' style={{ marginRight: 2 }}>
                Close: {selectedTicker.close}
              </Typography>
              <Typography variant='body1' style={{ marginRight: 2 }}>
                High: {selectedTicker.high}
              </Typography>
              <Typography variant='body1' style={{ marginRight: 2 }}>
                Low: {selectedTicker.low}
              </Typography>
              <Typography variant='body1' style={{ marginRight: 2 }}>
                Volume: {selectedTicker.volume}
              </Typography>
              <Typography variant='body1' style={{ marginRight: 2 }}>
                Amount: {selectedTicker.amount}
              </Typography>
              <Typography variant='body1' style={{ marginRight: 2 }}>
                Count: {selectedTicker.count}
              </Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};
