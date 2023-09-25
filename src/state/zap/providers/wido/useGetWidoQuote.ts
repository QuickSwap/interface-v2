import { useQuery } from '@tanstack/react-query';
import { quote, QuoteResult } from 'wido';
import { useSelector } from 'react-redux';
import { ChainId } from '@uniswap/sdk';
import { ZapVersion } from 'constants/index';
import { convertToTokenValue } from 'utils';
import { AppState } from 'state';
import { BOND_QUERY_KEYS } from 'constants/index';
import { useActiveWeb3React } from 'hooks';

export const getWidoQuote = async ({
  inputTokenAddress,
  amount,
  toTokenAddress,
  slippagePercentage,
  account,
  fromChainId,
  toChainId,
}: {
  inputTokenAddress: string;
  amount: string;
  toTokenAddress: string;
  slippagePercentage: number;
  account: string;
  fromChainId: ChainId;
  toChainId: ChainId;
}): Promise<QuoteResult | null> => {
  try {
    const quoteResult = await quote({
      fromChainId,
      toChainId,
      fromToken: inputTokenAddress,
      toToken: toTokenAddress,
      user: account,
      amount,
      slippagePercentage,
    });
    return quoteResult;
  } catch (e) {
    console.error({ e });
    return null;
  }
};

export default function useGetWidoQuote({
  inputTokenAddress,
  inputTokenDecimals,
  toTokenAddress,
  zapVersion,
  fromChainId,
  toChainId,
  tokenAmount,
}: {
  inputTokenAddress: string;
  inputTokenDecimals: number;
  toTokenAddress: string;
  zapVersion: ZapVersion;
  fromChainId: ChainId;
  toChainId: ChainId;
  tokenAmount?: string;
}) {
  const { chainId, account = '' } = useActiveWeb3React();
  // TODO: Pass typedValue as a prop instead of consuming Redux state
  const { typedValue: amountInput } = useSelector<AppState, AppState['zap']>(
    (state) => state.zap,
  );
  const { userZapSlippage } = useSelector<AppState, AppState['user']>(
    (state) => state.user,
  );

  const amount = convertToTokenValue(
    amountInput ? amountInput : tokenAmount || '0',
    inputTokenDecimals,
  ).toString();
  const slippagePercentage = userZapSlippage / 100 || 0.05;
  const isEnabled =
    !!inputTokenAddress && !!toTokenAddress && zapVersion === ZapVersion.Wido;

  return useQuery({
    queryKey: [
      BOND_QUERY_KEYS.WIDO_QUOTE,
      { inputTokenAddress },
      { amount },
      { toTokenAddress },
      { slippagePercentage },
      { account },
      { chainId },
      { zapVersion },
    ],
    queryFn: () =>
      getWidoQuote({
        inputTokenAddress,
        amount,
        toTokenAddress,
        slippagePercentage,
        account,
        fromChainId,
        toChainId,
      }),
    enabled: isEnabled && !!chainId && !!account,
  });
}
