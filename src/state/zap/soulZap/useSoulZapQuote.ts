import { Field } from 'state/zap/actions';
import { useUserZapSlippageTolerance } from 'state/user/hooks';
import useSoulZap from './useFetchQuote';
import { DEX } from '@soulsolidity/soulzap-v1';
import { useZapState } from 'state/zap/hooks';
import { ZapDataBond, ZapData } from '@soulsolidity/soulzap-v1/dist/src/types';
import { useCurrency } from 'hooks/v3/Tokens';

export const useSoulZapQuote = (
  contractAddress: string,
  liquidityDex: DEX,
  isBond: boolean,
): { loading: boolean; response: ZapDataBond | ZapData | null } => {
  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
  } = useZapState();

  const inputCurrency = useCurrency(inputCurrencyId);

  const [allowedSlippage] = useUserZapSlippageTolerance();

  const inputCurrencyString =
    inputCurrencyId === 'ETH'
      ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      : inputCurrencyId;

  const { loading, response } = useSoulZap(
    liquidityDex,
    inputCurrencyString,
    inputCurrency?.decimals,
    typedValue,
    contractAddress,
    isBond,
    allowedSlippage.toFixed(),
  );

  return { loading, response };
};
