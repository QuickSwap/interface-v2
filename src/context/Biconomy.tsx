import { biconomyAPIKey } from '../constants';
import { NETWORK_URL } from '../connectors';

const { Biconomy } = require('@biconomy/mexa');

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useActiveWeb3React } from 'hooks';
import { ethers } from 'ethers';
import { useGasPrice } from './GasPrice';

interface IBiconomyContext {
  biconomy: undefined | any;
  isBiconomyReady: boolean;
  isGaslessAllowed: boolean;
}

const BiconomyContext = createContext<IBiconomyContext | null>(null);

const BiconomyProvider: React.FC = (props) => {
  const { library } = useActiveWeb3React();
  const [isBiconomyReady, setIsBiconomyReady] = useState(false);
  const { gasPrice } = useGasPrice();
  const isGaslessAllowed = useMemo(() => (gasPrice ?? 0) <= 50, [gasPrice]);

  // reinitialize biconomy everytime library is changed
  const biconomy: any = useMemo(() => {
    return new Biconomy(new ethers.providers.JsonRpcProvider(NETWORK_URL), {
      apiKey: biconomyAPIKey,
      debug: true,
      walletProvider: library?.provider,
    });
  }, [library?.provider]);

  useEffect(() => {
    if (!biconomy) return;

    biconomy
      .onEvent(biconomy.READY, () => {
        // Initialize your dapp here like getting user accounts etc
        setIsBiconomyReady(true);
        console.log('BICONOMY READY');
      })
      .onEvent(biconomy.ERROR, (error: any, message: any) => {
        // Handle error while initializing mexa
        console.log(error);
        console.log(message);
        setIsBiconomyReady(false);
      });
  }, [biconomy]);

  return (
    <BiconomyContext.Provider
      value={{
        isBiconomyReady,
        isGaslessAllowed,
        biconomy,
      }}
      {...props}
    />
  );
};

const useBiconomy = () => {
  const hookData = useContext(BiconomyContext);
  if (!hookData) throw new Error('Hook used without provider');
  return hookData;
};
export { BiconomyProvider, useBiconomy };
