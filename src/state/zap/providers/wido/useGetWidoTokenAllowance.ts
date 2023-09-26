import { useSelector } from 'react-redux';
import { ZapVersion } from '@ape.swap/apeswap-lists';
import { ChainId } from '@uniswap/sdk';
import { AppState } from 'state';
import useGetWidoAllowance from './useGetWidoAllowance';
import useApproveWidoSpender from './useApproveWidoSpender';
import { convertToTokenValue } from 'utils';
import { NATIVE_TOKEN_ADDRESS } from 'constants/v3/addresses';

const useGetWidoTokenAllowance = ({
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
}) => {
  // TODO: Pass typedValue as a prop instead of consuming Redux state
  const { typedValue: amountInput } = useSelector<AppState, AppState['zap']>(
    (state) => state.zap,
  );

  const amountToApprove = convertToTokenValue(
    amountInput ? amountInput : tokenAmount || '0',
    inputTokenDecimals,
  ).toString();
  const isNative = inputTokenAddress === NATIVE_TOKEN_ADDRESS;
  const isEnabled =
    !isNative &&
    Number(amountToApprove) > 0 &&
    !!toTokenAddress &&
    zapVersion === ZapVersion.Wido;

  const {
    data: widoAllowance,
    isLoading: isWidoAllowanceLoading,
  } = useGetWidoAllowance({
    fromToken: inputTokenAddress,
    toToken: toTokenAddress,
    isEnabled,
    fromChainId,
    toChainId,
  });
  const { allowance, spender: spenderAddress = '' } = widoAllowance ?? {};

  let requiresApproval: boolean = isNative ? !isNative : isWidoAllowanceLoading;

  if (!isNative && !isWidoAllowanceLoading && !!allowance) {
    requiresApproval = Number(amountToApprove) > Number(allowance);
  }

  const {
    mutate: approveWidoSpender,
    isLoading: isApproveWidoSpenderLoading,
  } = useApproveWidoSpender({
    inputTokenAddress,
    toTokenAddress,
    fromChainId,
    toChainId,
    amountToApprove,
    spenderAddress,
  });

  return {
    requiresApproval,
    isWidoAllowanceLoading,
    approveWidoSpender,
    isApproveWidoSpenderLoading,
  };
};

export default useGetWidoTokenAllowance;
