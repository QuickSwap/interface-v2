import { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { LPType } from '@soulsolidity/soul-zap-trpc-client';
import { getChainParam } from './utils';
import { Bond } from 'types/bond';
import { SoulZapApiClient } from 'utils/soulZapTrpcClient';
import { useActiveWeb3React } from 'hooks';

const useFetchLPApiQuote = (
  inputAddress?: string,
  inputDecimals?: number,
  amount?: string,
  contractAddress?: string,
  slippage?: string,
  bond?: Bond,
  //TODO: remove this any
): { loading: boolean; zapData: any } => {
  // Hooks
  const { account } = useActiveWeb3React();
  const getZapDetailsMutation = SoulZapApiClient.zap.useMutation();

  // Validates that the user did not pass an amount with 19 decimals or more
  const validated18DecimalAmount = new BigNumber(amount ?? '0').toFixed(18, 5);

  const bigishInputAmount = new BigNumber(validated18DecimalAmount ?? '0')
    .times(new BigNumber(10).pow(inputDecimals ?? 18))
    .toString();

  const vault = bond?.lpToken?.address?.[bond.chainId] ?? '';
  const chain = getChainParam(bond?.chainId);
  const ichiUnderlyingDex = bond?.lpToken?.ichiUnderlyingDex;

  useEffect(() => {
    const fetchZapData = async () => {
      try {
        if (
          inputDecimals &&
          bigishInputAmount !== 'NaN' &&
          bigishInputAmount !== '0' &&
          contractAddress &&
          inputAddress &&
          chain &&
          ichiUnderlyingDex
        ) {
          const zapInputData = {
            chain,
            recipient: account ?? '',
            user: account ?? '',
            lpData: {
              lpType: LPType.Ichi,
              fromToken: inputAddress,
              fromAmount: bigishInputAmount,
              underlyingDex: ichiUnderlyingDex,
              vault,
              slippage: parseFloat(slippage ?? '0.5'),
            },
          };
          console.log('making soulZap LP call!');
          console.log('soulZap LP Data', zapInputData);
          //@ts-ignore
          getZapDetailsMutation.mutate(zapInputData);
        }
      } catch (error) {
        console.error('Error fetching SoulZap data:', error);
      }
    };
    fetchZapData();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [
    bigishInputAmount,
    contractAddress,
    account,
    inputAddress,
    inputDecimals,
    slippage,
    ichiUnderlyingDex,
    vault,
  ]);

  return {
    loading: getZapDetailsMutation.isLoading,
    zapData: getZapDetailsMutation.data,
  };
};

export default useFetchLPApiQuote;
