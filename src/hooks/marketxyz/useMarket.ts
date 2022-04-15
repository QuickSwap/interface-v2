import { useEffect, useMemo, useState } from 'react';
import { useActiveWeb3React } from '../index';
import { MarketSDK } from 'market-sdk';
import Web3 from 'web3';

export const useMarket = () => {
  const { library } = useActiveWeb3React();
  const [sdk, setSDK] = useState<MarketSDK>();

  useEffect(() => {
    MarketSDK
      // @ts-ignore
      .init(new Web3(library.provider))
      .then(setSDK);
  }, []);

  return { sdk };
};
