import { useCurrency } from 'hooks/v3/Tokens';
import { useUserZapSlippageTolerance } from '../../user/hooks';
import { useZapActionHandlers } from '../hooks';
import { useEffect } from 'react';
import useFetchBondApiQuote from './useFetchBondApiQuote';
import BigNumber from 'bignumber.js';
import { Bond } from 'types/bond';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';

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

  const lpAmount = toToken0USD.plus(toToken1USD)?.div(bond?.lpPrice ?? 0); // then we divide the lp USD price to get the amount of LP tokens

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
