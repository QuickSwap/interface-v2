import { useMutation, useQueryClient } from '@tanstack/react-query';
import useGetWidoApprove from './useGetWidoApprove';
import { useSignTransaction } from 'state/transactions/hooks';
import { BOND_QUERY_KEYS } from 'constants/index';
import { NATIVE_TOKEN_ADDRESS } from 'constants/v3/addresses';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useTranslation } from 'next-i18next';

const useApproveWidoSpender = ({
  inputTokenAddress,
  toTokenAddress,
  fromChainId,
  toChainId,
  amountToApprove,
  spenderAddress,
}: {
  inputTokenAddress: string;
  toTokenAddress: string;
  fromChainId: ChainId;
  toChainId: ChainId;
  amountToApprove: string;
  spenderAddress: string;
}) => {
  const queryClient = useQueryClient();
  const { account, isActive } = useActiveWeb3React();

  const isEnabled =
    isActive &&
    !!inputTokenAddress &&
    !!toTokenAddress &&
    inputTokenAddress !== NATIVE_TOKEN_ADDRESS &&
    Number(amountToApprove) > 0;

  const { signTransaction } = useSignTransaction();
  const { data: widoSpenderData } = useGetWidoApprove({
    fromToken: inputTokenAddress,
    toToken: toTokenAddress,
    amount: amountToApprove,
    isEnabled,
    fromChainId,
    toChainId,
  });

  const { data, to } = widoSpenderData || {};
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => {
      console.log('Signing Wido permission Tx');
      return signTransaction({
        dataToSign: { to, data },
        txInfo: {
          summary: `${t('approve')} ${toTokenAddress}`,
          approval: { tokenAddress: toTokenAddress, spender: spenderAddress },
        },
      });
    },
    onSuccess: () => {
      // will wait for query invalidation to finish,
      // mutation state will stay loading while related queries update
      return queryClient.invalidateQueries({
        queryKey: [
          BOND_QUERY_KEYS.WIDO_ALLOWANCE,
          { account },
          { fromToken: inputTokenAddress },
          { toTokenAddress },
          { amountToApprove },
        ],
      });
    },
  });
};

export default useApproveWidoSpender;
