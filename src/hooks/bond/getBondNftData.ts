import axios from 'axios';
import { bondAPIV2BaseURL } from '~/constants/index';

const getBondNftData = async (
  billNftId: string,
  billNftAddress: string,
  chainId: number,
) => {
  try {
    const response = await axios.get(
      `${bondAPIV2BaseURL}/bills/single/${chainId}/${billNftAddress}/${billNftId}`,
    );
    const billNftDataResp = await response.data;
    if (billNftDataResp.statusCode === 500) {
      return null;
    }
    return billNftDataResp;
  } catch (error) {
    return null;
  }
};

/**
 * Retrieves batch data for a list of bill NFT IDs from the API.
 * @param billNftIds - An array of bill NFT IDs to retrieve data for.
 * @param billNftAddress - The address of the bill NFT contract.
 * @param chainId - The ID of the blockchain network to retrieve data from.
 * @returns A Promise that resolves to the batch data for the specified bill NFT IDs, or null if an error occurs.
 */
export const getBondNftBatchData = async (
  billNftIds: string[],
  billNftAddress: string,
  chainId: number,
): Promise<any> => {
  try {
    // If no bill NFT IDs are provided, return null
    if (!billNftIds || billNftIds.length === 0) {
      return null;
    }

    // Make a GET request to the API to retrieve the batch data for the specified bill NFT IDs
    const response = await axios.get(
      `${bondAPIV2BaseURL}/bills/batch/${chainId}/${billNftAddress}/?billIds[]=${billNftIds.join(
        '&billIds[]=',
      )}`,
    );

    // If the response status code is 500, return null
    const billNftDataResp = await response.data;
    if (billNftDataResp.statusCode === 500) {
      return null;
    }

    // Return the batch data for the specified bill NFT IDs
    return billNftDataResp;
  } catch (error) {
    // If an error occurs, return null
    return null;
  }
};

/**
 * @deprecated API doesn't support it any more and its not used
 */
export const getNewBondNftData = async (
  billNftId: string,
  transactionHash: string,
  chainId: number,
) => {
  try {
    const response = await axios.get(
      `${bondAPIV2BaseURL}/bills/${chainId}/${billNftId}/${transactionHash}`,
    );
    const billNftDataResp = await response.data;
    if (billNftDataResp.statusCode === 500) {
      return null;
    }
    return billNftDataResp;
  } catch (error) {
    return null;
  }
};

export default getBondNftData;
