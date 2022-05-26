import { useEffect, useMemo, useState } from 'react';
import { useActiveWeb3React } from '../index';
import { MarketSDK } from 'market-sdk';
import Web3 from 'web3';

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
