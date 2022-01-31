import { biconomyAPIKey } from '../constants';
import { NETWORK_URL } from '../connectors';

const { Biconomy } = require('@biconomy/mexa');

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useActiveWeb3React } from 'hooks';
import { ethers } from 'ethers';
import { useGasPrice } from './GasPrice';
import fetch from 'cross-fetch';

interface IBiconomyContext {
  biconomy: undefined | any;
  isBiconomyReady: boolean;
  isGaslessAllowed: boolean;
  isGaslessEnabled: boolean;
  toggleGasless: () => void;
  toggleGaslessStatus: ToggleGaslessStatus;
  toggleGaslessError: undefined | Error;
}

export enum ToggleGaslessStatus {
  IDLE,
  PENDING,
  ERROR,
  SUCCESS,
}

const BiconomyContext = createContext<IBiconomyContext | null>(null);

const BiconomyProvider: React.FC = (props) => {
  const { library, account } = useActiveWeb3React();
  const { gasPrice } = useGasPrice();

  const [isBiconomyReady, setIsBiconomyReady] = useState(false);
  const [isGaslessEnabled, setIsGaslessEnabled] = useState<boolean>(false);
  const [toggleGaslessStatus, setToggleGaslessStatus] = useState<
    ToggleGaslessStatus
  >(ToggleGaslessStatus.IDLE);
  const [toggleGaslessError, setToggleGaslessError] = useState<Error>();

  const isGaslessAllowed = useMemo(() => (gasPrice ?? 0) <= 50, [gasPrice]);

  const toggleGasless = useCallback(async () => {
    setToggleGaslessStatus(ToggleGaslessStatus.PENDING);
    // if enabled, then disabled without checks
    if (isGaslessEnabled) {
      setIsGaslessEnabled(false);
      setToggleGaslessStatus(ToggleGaslessStatus.SUCCESS);
      return;
    }

    if (!isGaslessAllowed) {
      setToggleGaslessStatus(ToggleGaslessStatus.SUCCESS);
      return;
    }

    try {
      // if disabled, then before enabling perform checks
      if (!account && !biconomyAPIKey) {
        throw new Error('Cannot get user details');
      }
      let checkLimitsResponse: any;
      try {
        const response = await fetch(
          //TODO: replace with apiId from config
          `https://api.biconomy.io/api/v1/dapp/checkLimits?userAddress=${account}&apiId=${'b72dcef4-35f4-413b-810f-d46ecfd18c7f'}`,
          { headers: { 'x-api-key': biconomyAPIKey } },
        );
        checkLimitsResponse = await response.json();
      } catch (err) {
        throw new Error('Cannot get response from Biconomy');
      }

      if (checkLimitsResponse?.allowed === true) {
        setIsGaslessEnabled(true);
        setToggleGaslessStatus(ToggleGaslessStatus.SUCCESS);
      } else if (checkLimitsResponse?.allowed === false) {
        // let resetTime = new Date(checkLimitsResponse?.resetTime);
        throw new Error(
          'Gasless limits exhausted by user. Please try again after 24 hours',
        );
      } else {
        // let resetTime = new Date(checkLimitsResponse?.resetTime);
        throw new Error(
          'Cannot enable gasless at this time. Please try again later.',
        );
      }
      setToggleGaslessError(undefined);
    } catch (err) {
      const error: any = err;
      setToggleGaslessStatus(ToggleGaslessStatus.ERROR);
      setToggleGaslessError(error);
    }
  }, [isGaslessEnabled, account, isGaslessAllowed]);

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
        toggleGaslessStatus,
        isBiconomyReady,
        isGaslessAllowed,
        isGaslessEnabled,
        toggleGasless,
        biconomy,
        toggleGaslessError,
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
