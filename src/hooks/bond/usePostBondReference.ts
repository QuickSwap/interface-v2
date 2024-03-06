import axios from 'axios';
import { bondAPIV2BaseURL, BOND_QUERY_KEYS } from '~/constants/index';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActiveWeb3React } from '~/hooks';

export interface BillReferenceData {
  chainId: number;
  transactionHash: string;
  referenceId: string;
  billContract: string;
}

export interface BillReferenceResponse {
  chainId: number;
  transactionHash: string;
  referenceId: string;
  createdAt: number;
}

export const postBillReference = async (
  data: BillReferenceData,
): Promise<BillReferenceResponse> => {
  try {
    const response = await axios.post(`${bondAPIV2BaseURL}/bills/widget`, data);
    const billReferenceResp = await response.data;

    if (response.status !== 201) {
      if (response.status === 409) {
        throw new Error(
          `postBillReference: 409 tx-hash already exists for data ${data}`,
        );
      }
      throw new Error(
        `postBillReference: Status not 201 for data ${data}. Status: ${response.status}`,
      );
    }

    return billReferenceResp;
  } catch (error) {
    throw new Error(`postBillReference: error posting data ${data}`);
  }
};

export const usePostBillReference = () => {
  const queryClient = useQueryClient();
  const { chainId: currentChainId } = useActiveWeb3React();

  return useMutation({
    mutationFn: ({
      chainId,
      transactionHash,
      referenceId,
      billContract,
    }: Partial<BillReferenceData>) => {
      chainId = chainId || currentChainId;
      if (!chainId || !transactionHash || !referenceId || !billContract) {
        return Promise.resolve(null);
      }
      return postBillReference({
        chainId,
        transactionHash,
        referenceId,
        billContract,
      });
    },
    onError: (error, variables, context) => {
      console.error(
        `usePostBillReference: error posting data ${variables}, context: ${context} error: ${error}`,
      );
    },
    onSuccess: () => {
      // will wait for query invalidation to finish,
      // mutation state will stay loading while related queries update
      return queryClient.invalidateQueries({
        queryKey: [BOND_QUERY_KEYS.BOND_POST_REFERENCE],
      });
    },
  });
};
