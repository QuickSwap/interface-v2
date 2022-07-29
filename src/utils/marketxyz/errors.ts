import { CTokenError, ComptrollerError, MarketSDK } from 'market-sdk';
import { fetchGasForCall } from '.';

export async function testForCTokenErrorAndSend(
  txObject: any,
  caller: string,
  failMessage: string,
  sdk: MarketSDK,
) {
  let response = await txObject.call({ from: caller });

  // For some reason `response` will be `["0"]` if no error but otherwise it will return a string of a number.
  if (response[0] !== '0') {
    response = parseInt(response);

    let err;

    if (response >= 1000) {
      const comptrollerResponse = response - 1000;

      let msg = ComptrollerError[comptrollerResponse];

      if (msg === 'BORROW_BELOW_MIN') {
        msg =
          'As part of our guarded launch, you cannot borrow less than 0.05 ETH worth of tokens at the moment.';
      }

      // This is a comptroller error:
      err = new Error(failMessage + ' Comptroller Error: ' + msg);
    } else {
      // This is a standard token error:
      err = new Error(failMessage + ' CToken Code: ' + CTokenError[response]);
    }
    throw err;
  }

  const { gasPrice, estimatedGas } = await fetchGasForCall(
    txObject,
    undefined,
    caller,
    sdk,
  );

  const txRes = await txObject.send({
    from: caller,
    gasPrice,
    estimatedGas,
  });

  return txRes;
}

export async function testForComptrollerErrorAndSend(
  txObject: any,
  caller: string,
  failMessage: string,
  sdk: MarketSDK,
) {
  const response = await txObject.call({ from: caller });

  // For some reason `response` will be `["0"]` if no error but otherwise it will return a string number.
  if (response[0] !== '0') {
    throw new Error(failMessage + ' Code: ' + ComptrollerError[response]);
  }

  const { gasPrice, estimatedGas } = await fetchGasForCall(
    txObject,
    undefined,
    caller,
    sdk,
  );

  const txRes = await txObject.send({
    from: caller,
    gasPrice,
    estimatedGas,
  });
  return txRes;
}
