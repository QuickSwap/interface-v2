import { useCurrency } from 'hooks/v3/Tokens';
import { useUserZapSlippageTolerance } from 'state/user/hooks';
import { useZapActionHandlers } from '../hooks';
import { useEffect } from 'react';
import useFetchLPApiQuote from './useFetchLPApiQuote';
import BigNumber from 'bignumber.js';
import { Bond } from 'types/bond';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';

export const useSoulZapLPApiQuote = (
  typedValue: string,
  inputCurrencyId: string | undefined,
  contractAddress: string,
  bond?: Bond,
): { loading: boolean; response: any; estimateOutput: string } => {
  const inputCurrency = useCurrency(inputCurrencyId);
  const { onSetOutputValue } = useZapActionHandlers();
  const [allowedSlippage] = useUserZapSlippageTolerance();

  const inputCurrencyString =
    inputCurrencyId === 'ETH'
      ? '0x0000000000000000000000000000000000000000'
      : inputCurrencyId;

  const { loading, zapData: response } = useFetchLPApiQuote(
    inputCurrencyString,
    inputCurrency?.decimals,
    typedValue,
    contractAddress,
    allowedSlippage.toFixed(),
    bond,
  );
  const toToken0 = useCurrency(response?.lpQuote?.token0?.address);
  const outputTokenPrice = useUSDCPriceFromAddress(
    response?.lpQuote?.token0?.address ?? '',
  );

  const swapOutPutEstimate: string | undefined =
    response?.lpQuote?.token0.fromAmountEstimate;
  const estimateOutput = new BigNumber(swapOutPutEstimate ?? '0')
    ?.div(new BigNumber(10).pow(toToken0?.decimals ?? 18)) // this is amount of swap output
    ?.times(new BigNumber(outputTokenPrice.price ?? 0)) // convert it to usd price
    ?.div(bond?.tokenPrice ?? 0) // then we divide the lp USD price to get the amount of LP tokens
    ?.toFixed(18);

  const typedValueNotEmpty = !!typedValue && Number(typedValue) > 0;
  // Effects
  useEffect(() => {
    if (loading) {
      onSetOutputValue('0');
    } else {
      onSetOutputValue(estimateOutput ?? '0');
    }
  }, [typedValueNotEmpty, estimateOutput, loading, onSetOutputValue]);

  return { loading, response, estimateOutput };
};
