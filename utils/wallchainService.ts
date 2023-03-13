import { ChainId } from '@uniswap/sdk';
import {
  RouterTypes,
  SmartRouter,
  BONUS_CUTOFF_AMOUNT,
  WALLCHAIN_PARAMS,
} from 'constants/index';
import { Contract } from 'ethers';
import { SwapDelay, RouterTypeParams, DataResponse } from 'state/swap/actions';

const wallchainResponseIsValid = (
  dataResponse: DataResponse,
  value: string,
  account: string,
  contractAddress: string,
  chainId: ChainId,
) => {
  if (!dataResponse.pathFound) {
    // Opportunity was not found -> response should be ignored -> valid.
    return false;
  }
  if (
    dataResponse &&
    dataResponse.summary &&
    dataResponse.summary.searchSummary &&
    dataResponse.summary.searchSummary.expectedUsdProfit &&
    BONUS_CUTOFF_AMOUNT[chainId] >
      dataResponse.summary.searchSummary.expectedUsdProfit * 0.3
  ) {
    return false;
  }
  return (
    dataResponse &&
    dataResponse.transactionArgs &&
    dataResponse.transactionArgs.destination &&
    dataResponse.transactionArgs.value &&
    dataResponse.transactionArgs.sender &&
    contractAddress &&
    value &&
    account &&
    dataResponse.transactionArgs.destination.toLowerCase() ===
      contractAddress.toLowerCase() &&
    dataResponse.transactionArgs.value.toLowerCase() === value.toLowerCase() &&
    dataResponse.transactionArgs.sender.toLowerCase() === account.toLowerCase()
  );
};

/**
 * Call Wallchain API to analyze the expected opportunity.
 * @param methodName function to execute in transaction
 * @param args arguments for the function
 * @param value value parameter for the transaction
 * @param chainId chainId of the blockchain
 * @param account account address from sender
 * @param contract ApeSwap Router contract
 * @param smartRouter The type of router the trade will go through
 * @param routerType The router that the trade will go through
 * @param onBestRoute Callback function to set the best route
 * @param onSetSwapDelay Callback function to set the swap delay state
 */
export default function callWallchainAPI(
  methodName: string,
  args: string | (string | string[])[],
  value: string,
  chainId: ChainId,
  account: string,
  contract: Contract,
  smartRouter: SmartRouter,
  routerType: RouterTypes,
  onBestRoute: (bestRoute: RouterTypeParams) => void,
  onSetSwapDelay: (swapDelay: SwapDelay) => void,
  priority?: number,
): Promise<DataResponse | null> {
  onSetSwapDelay(SwapDelay.FETCHING_BONUS);
  const encodedData =
    typeof args === 'string'
      ? args
      : contract.interface.encodeFunctionData(
          methodName,
          args as (string | string[])[],
        );
  // Allowing transactions to be checked even if no user is connected
  const activeAccount = account || '0x0000000000000000000000000000000000000000';

  // If the intiial call fails APE router will be the default router
  return fetch(
    `${WALLCHAIN_PARAMS[chainId][smartRouter].apiURL}?key=${
      WALLCHAIN_PARAMS[chainId][smartRouter].apiKey
    }${priority ? `&priority=${priority}` : ''}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value,
        sender: activeAccount,
        data: encodedData,
        destination: contract.address,
      }),
    },
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      console.error('Wallchain Error', response.status, response.statusText);
      onBestRoute({ routerType, smartRouter });
      onSetSwapDelay(SwapDelay.SWAP_REFRESH);
      return null;
    })
    .then((responseJson) => {
      if (responseJson) {
        const dataResponse: DataResponse = responseJson;
        if (
          wallchainResponseIsValid(
            dataResponse,
            value,
            activeAccount,
            contract.address,
            chainId,
          )
        ) {
          onBestRoute({
            routerType: RouterTypes.BONUS,
            smartRouter,
            bonusRouter: dataResponse,
          });
          onSetSwapDelay(SwapDelay.SWAP_REFRESH);
        } else {
          onBestRoute({ routerType, smartRouter });
          onSetSwapDelay(SwapDelay.SWAP_REFRESH);
        }
        return dataResponse;
      }
      onSetSwapDelay(SwapDelay.SWAP_REFRESH);
      return null;
    })
    .catch((error) => {
      onBestRoute({ routerType, smartRouter });
      onSetSwapDelay(SwapDelay.SWAP_REFRESH);
      console.error('Wallchain Error', error);
      return null;
    });
}
