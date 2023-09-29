import { getBondNftBatchData } from './getBondNftData';
import { ChainId } from '@uniswap/sdk';
import { Bond } from 'types/bond';

/**
 * Fetches user-owned bill NFT data for a given set of owned bills data, chain ID, and bills.
 * @param ownedBillsData An array of objects containing the ID, bill NFT address, and contract address of the owned bills.
 * @param chainId The ID of the blockchain network.
 * @param bills An array of objects containing the contract address and user-owned bill NFT data.
 * @returns An array of objects containing the ID and data of the user-owned bill NFTs.
 */
export const fetchUserOwnedBillNftData = async (
  ownedBillsData: {
    id: string;
    billNftAddress: string;
    contractAddress: string;
  }[],
  chainId: ChainId,
  bills: Bond[],
) => {
  // Initialize empty arrays for bills to fetch and bills already fetched
  const billsToFetch: any[] = [];
  const billsFetched: any[] = [];

  // Loop through each owned bill and check if it exists in the bills array
  ownedBillsData?.forEach(async ({ id, billNftAddress, contractAddress }) => {
    const bill = bills
      .find((b) => b.contractAddress[chainId] === contractAddress)
      ?.userOwnedBillsNftData?.find((u) => +u.tokenId === +id);

    // If the bill exists in the bills array, add it to the billsFetched array
    if (bill) {
      billsFetched.push({ id, data: bill });
    }

    // If the bill doesn't exist in the bills array, add it to the billsToFetch array
    billsToFetch.push({ id, billNftAddress, chainId });
  });

  // Group the billsToFetch array by bill NFT address and chain ID
  const groupedBillsToFetch: Record<
    string,
    { billNftAddress: string; chainId: ChainId; ids: string[] }
  > = billsToFetch.reduce((acc, bill) => {
    const key = `${bill.billNftAddress}-${bill.chainId}`;
    if (!acc[key]) {
      acc[key] = {
        billNftAddress: bill.billNftAddress,
        chainId: bill.chainId,
        ids: [],
      };
    }
    acc[key].ids.push(bill.id);
    return acc;
  }, {});

  // Convert the groupedBillsToFetch object into an array
  const groupedBillsToFetchArray = Object.values(groupedBillsToFetch);

  // Fetch the bill NFT data for each group of bills using Promise.all
  const billNftData = await Promise.all(
    groupedBillsToFetchArray.map(async ({ billNftAddress, chainId, ids }) => {
      return getBondNftBatchData(ids, billNftAddress, chainId);
    }),
  );

  // Flatten the resulting array of arrays into a single array
  const billNftDataFlat = billNftData.flat();

  // Concatenate the billsFetched array with the flattened billNftDataFlat array to create the final result array
  const result = billsFetched.concat(
    billNftDataFlat.map((data) => ({ id: data.tokenId, data })),
  );

  return result;
};
