import { useEffect, useState } from 'react';
import { MarketSDK } from 'market-sdk';
import Web3 from 'web3';
import { useActiveWeb3React } from 'hooks';

export const useMarket = () => {
  const { library } = useActiveWeb3React();
  const [sdk, setSDK] = useState<MarketSDK>();

  useEffect(() => {
    if (library) {
      MarketSDK.init(new Web3(library.provider as any)).then(setSDK);
    }
  }, [library]);

  return { sdk };
};

export const useReadOnlyMarket = () => {
  const [sdk, setSDK] = useState<MarketSDK>();
  const marketPRC = process.env.REACT_APP_MARKET_RPC;

  useEffect(() => {
    if (marketPRC) {
      MarketSDK.init(new Web3(marketPRC as any)).then(setSDK);
    }
  }, [marketPRC]);

  return { sdk };
};
