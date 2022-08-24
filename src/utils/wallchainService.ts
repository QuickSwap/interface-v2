import { Contract } from '@ethersproject/contracts';
import { DataResponse } from 'state/swap/actions';

const txnIsUpgradedAndValid = (
  dataResonse: DataResponse,
  value: string,
  account: string,
  contractAddress: string,
) => {
  if (!dataResonse.pathFound) {
    // Opportunity was not found -> response should be ignored.
    return false;
  }
  return (
    dataResonse.transactionArgs.destination.toLowerCase() ===
      contractAddress.toLowerCase() &&
    dataResonse.transactionArgs.value.toLowerCase() === value.toLowerCase() &&
    dataResonse.transactionArgs.sender.toLowerCase() === account.toLowerCase()
  );
};

/**
 * Call Wallchain API to analyze the expected opportunity.
 * @param methodName function to execute in transaction
 * @param args arguments for the function
 * @param value value parameter for the transaction
 * @param account account address from sender
 * @param contract Quickswap Router contract
 */
export default function callWallchainAPI(
  methodName: string,
  args: (string | string[])[],
  value: string,
  account: string,
  contract: Contract,
): Promise<any> {
  const encodedData = contract.interface.encodeFunctionData(methodName, args);
  // Allowing transactions to be checked even if no user is connected
  const activeAccount = account || '0x0000000000000000000000000000000000000000';

  // If the intiial call fails APE router will be the default router
  return fetch(
    `https://matic.wallchains.com/upgrade_txn/?key=50eaf751-196d-4fe0-9506-b983f7c83735`,
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
      return null;
    })
    .then((responseJson) => {
      if (responseJson) {
        const dataResonse: DataResponse = responseJson;
        console.log('Wallchain Log', dataResonse);

        if (
          txnIsUpgradedAndValid(
            dataResonse,
            value,
            activeAccount,
            contract.address,
          )
        ) {
          console.log('Wallchain txn upgrade');
          // Use dataResonse to capture profit.
        } else {
          console.log('Wallchain txn not upgraded');
        }
      } else {
        console.log('Wallchain No responseJson');
      }
      return null;
    })
    .catch((error) => {
      console.error('Wallchain Error', error);
    });
}
