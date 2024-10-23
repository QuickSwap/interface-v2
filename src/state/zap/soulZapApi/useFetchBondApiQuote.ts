import { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { LPType } from '@soulsolidity/soul-zap-trpc-client';
import { getChainParam } from './utils';
import { useActiveWeb3React } from 'hooks';
import { SoulZapApiClient } from 'utils/soulZapTrpcClient';
import { Bond } from 'types/bond';

const useFetchBondApiQuote = (
  inputAddress?: string,
  inputDecimals?: number,
  amount?: string,
  bond?: Bond,
  slippage?: string,
): { loading: boolean; zapData: any } => {
  // Hooks
  const { account } = useActiveWeb3React();
  const getZapDetailsMutation = SoulZapApiClient.zap.useMutation();

  // Validates that the user did not pass an amount with 19 decimals or more
  const validated18DecimalAmount = new BigNumber(amount ?? '0').toFixed(18, 5);

  const bigishInputAmount = new BigNumber(validated18DecimalAmount ?? '0')
    .times(new BigNumber(10).pow(inputDecimals ?? 18))
    .toString();

  const vault = bond?.lpToken?.address?.[bond.chainId];
  const bondContractAddress = bond?.contractAddress?.[bond.chainId];
  const chain = getChainParam(bond?.chainId);
  const ichiUnderlyingDex = bond?.lpToken?.ichiUnderlyingDex;

  useEffect(() => {
    const fetchZapData = async () => {
      try {
        if (
          vault &&
          inputDecimals &&
          bondContractAddress &&
          bigishInputAmount !== 'NaN' &&
          bigishInputAmount !== '0' &&
          inputAddress &&
          chain &&
          ichiUnderlyingDex
        ) {
          const zapInputData = {
            chain: chain,
            recipient: account ?? null,
            user: account ?? null,
            lpData: {
              lpType: LPType.Ichi,
              fromToken: inputAddress,
              fromAmount: bigishInputAmount,
              underlyingDex: ichiUnderlyingDex,
              vault,
              slippage: parseFloat(slippage ?? '0.5'),
            },
            protocolData: {
              protocol: 'ApeBond',
              bond: bondContractAddress,
              depositer: account ?? null,
            },
          };
          console.log(
            `Fetching soulZap routes for Bond Contract: ${bondContractAddress}`,
          );
          console.log('Zap Input Data ', zapInputData);
          //@ts-ignore
          getZapDetailsMutation.mutate(zapInputData);
        }
      } catch (error) {
        console.error('Error fetching SoulZapApi data:', error);
      }
    };
    fetchZapData();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [
    bigishInputAmount,
    account,
    inputAddress,
    inputDecimals,
    slippage,
    ichiUnderlyingDex,
    vault,
    bondContractAddress,
  ]);

  return {
    loading: getZapDetailsMutation.isLoading,
    zapData: getZapDetailsMutation.data,
  };
};

export default useFetchBondApiQuote;
