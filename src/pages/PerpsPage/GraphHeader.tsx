import React, { useState, useEffect } from 'react';
import { Flex, Text, DropdownMenu, Button } from '@radix-ui/themes';
import { useMarketsStream } from '@orderly.network/hooks';
interface MarketData {
  symbol: string;
  index_price: number;
  mark_price: number;
  sum_unitary_funding: number;
  est_funding_rate: number;
  last_funding_rate: number;
  next_funding_time: number;
  open_interest: number;
  '24h_open': number;
  '24h_close': number;
  '24h_high': number;
  '24h_low': number;
  '24h_volume': number;
  '24h_amount': number;
  '24h_volumn': number;
  change: number;
}

export const GraphHeader: React.FC = () => {
  const { data } = useMarketsStream();
  const [token, setToken] = useState<MarketData | null>(null);
  console.log(token);
  const handleTokenSelect = (token: MarketData) => {
    setToken(token);
  };

  return (
    <Flex direction='row' justify='between' align='center'>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button style={{ backgroundColor: 'transparent' }}>
            {token ? token.symbol : 'Options'}
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          style={{
            position: 'absolute',
            top: '100%',
            backgroundColor: '#1b1e29',
            color: '#c7cad9',
            borderRadius: '4px',
            WebkitBackdropFilter: 'blur(30px)',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {data ? (
            data.map((item, index) => (
              <DropdownMenu.Item
                key={index}
                onSelect={() => handleTokenSelect(item)}
              >
                {item.symbol}
              </DropdownMenu.Item>
            ))
          ) : (
            <DropdownMenu.Item>No data available</DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <Text
        style={{
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: 500,
          color: ' #51b29f',
        }}
      >
        {token?.mark_price}
      </Text>
      <Flex direction='column' justify='center' align={'center'}>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 11,
            fontWeight: 500,
            color: '#61657a',
          }}
        >
          24h Change
        </Text>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: 500,
            color: '#51b29f',
          }}
        >
          {token?.change}
        </Text>
      </Flex>
      <Flex direction='column' justify='center' align={'center'}>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 11,
            fontWeight: 500,
            color: '#61657a',
          }}
        >
          Mark
        </Text>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: 500,
            color: '#c7cad9',
          }}
        >
          {token?.mark_price}
        </Text>
      </Flex>
      <Flex direction='column' justify='center' align={'center'}>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 11,
            fontWeight: 500,
            color: '#61657a',
          }}
        >
          Index
        </Text>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: 500,
            color: '#c7cad9',
          }}
        >
          {token?.index_price}
        </Text>
      </Flex>
      <Flex direction='column' justify='center' align={'center'}>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 11,
            fontWeight: 500,
            color: '#61657a',
          }}
        >
          24h Volume
        </Text>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: 500,
            color: '#c7cad9',
          }}
        >
          {token?.['24h_volume']}
        </Text>
      </Flex>
      <Flex direction='column' justify='center' align={'center'}>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 11,
            fontWeight: 500,
            color: '#61657a',
          }}
        >
          Funding Rate
        </Text>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: 500,
            color: '#c7cad9',
          }}
        >
          {token?.est_funding_rate}
        </Text>
      </Flex>
      <Flex direction='column' justify='center' align={'center'}>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 11,
            fontWeight: 500,
            color: '#61657a',
          }}
        >
          Open Interest
        </Text>
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: 500,
            color: '#c7cad9',
          }}
        >
          {token?.open_interest}
        </Text>
      </Flex>
    </Flex>
  );
};
