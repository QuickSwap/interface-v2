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
  const toToken0Estimate: string | undefined =
    response?.lpQuote?.token0?.fromAmountEstimate;
  const toToken0 = useCurrency(response?.lpQuote?.token0?.address);
  const toToken0Price = useUSDCPriceFromAddress(
    response?.lpQuote?.token0?.address ?? '',
  );

  const toToken1Estimate: string | undefined =
    response?.lpQuote?.token1?.fromAmountEstimate;
  const toToken1 = useCurrency(response?.lpQuote?.token1?.address);
  const toToken1Price = useUSDCPriceFromAddress(
    response?.lpQuote?.token1?.address ?? '',
  );

  const toToken0USD = new BigNumber(toToken0Estimate ?? '0')
    ?.div(new BigNumber(10).pow(toToken0?.decimals ?? 18))
    .times(new BigNumber(toToken0Price.price ?? 0));

  const toToken1USD = new BigNumber(toToken1Estimate ?? '0')
    ?.div(new BigNumber(10).pow(toToken1?.decimals ?? 18))
    .times(new BigNumber(toToken1Price.price ?? 0));

  const estimateOutput = toToken0USD
    .plus(toToken1USD)
    ?.div(bond?.lpPrice ?? 0)
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
