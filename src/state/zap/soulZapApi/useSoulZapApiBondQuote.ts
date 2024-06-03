import { useCurrency } from 'hooks/v3/Tokens';
import { useUserZapSlippageTolerance } from '../../user/hooks';
import { useZapActionHandlers } from '../hooks';
import { useEffect } from 'react';
import useFetchBondApiQuote from './useFetchBondApiQuote';
import BigNumber from 'bignumber.js';
import { Bond } from 'types/bond';

export const useSoulZapBondApiQuote = (
  typedValue: string,
  inputCurrencyId: string | undefined,
  bond?: Bond,
): { loading: boolean; response: any; estimateOutput: string } => {
  const inputCurrency = useCurrency(inputCurrencyId);
  const { onSetOutputValue } = useZapActionHandlers();
  const [allowedSlippage] = useUserZapSlippageTolerance();

  const inputCurrencyString =
    inputCurrencyId === 'ETH'
      ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      : inputCurrencyId;
  const { loading, zapData: response } = useFetchBondApiQuote(
    inputCurrencyString,
    inputCurrency?.decimals,
    typedValue,
    bond,
    allowedSlippage.toFixed(),
  );

  const outputTokenPrice = bond?.tokenPrice ?? 0;
  // Effects
  const swapOutPutEstimate: string | undefined =
    response?.lpQuote?.token0.fromAmountEstimate;
  const lpAmount = new BigNumber(swapOutPutEstimate ?? '0')
    ?.div(new BigNumber(10).pow(bond?.token?.decimals?.[bond?.chainId] ?? 18)) // this is amount of swap output
    ?.times(new BigNumber(outputTokenPrice ?? 0)) // convert it to usd price
    ?.div(bond?.lpPrice ?? 0); // then we divide the lp USD price to get the amount of LP tokens

  const estimateOutput = lpAmount.times(new BigNumber(10).pow(18)).toFixed(0);
  console.log('soulzap API response', response);
  useEffect(() => {
    if (loading) {
      onSetOutputValue('0');
    } else {
      onSetOutputValue(estimateOutput ?? '0');
    }
  }, [estimateOutput, loading, onSetOutputValue]);

  return { loading, response, estimateOutput };
};
