import { useEffect, useState } from 'react';
import { MarketSDK } from 'market-sdk';
import Web3 from 'web3';

export const useMarket = () => {
  const [sdk, setSDK] = useState<MarketSDK>();
  const marketPRC = process.env.REACT_APP_MARKET_RPC;

  useEffect(() => {
    if (marketPRC) {
      MarketSDK.init(new Web3(marketPRC as any)).then(setSDK);
    }
  }, [marketPRC]);

  return { sdk };
};
