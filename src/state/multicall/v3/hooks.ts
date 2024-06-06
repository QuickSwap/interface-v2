import React from 'react';
import { FunctionFragment, Interface } from '@ethersproject/abi';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { useActiveWeb3React } from 'hooks';
import {
  addV3MulticallListeners,
  V3ListenerOptions,
  removeV3MulticallListeners,
} from './actions';
import { Call, parseCallKey, toCallKey } from './utils';
import { useBlockNumber } from 'state/application/hooks';
import { getConfig } from '../../../config/index';

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any;
}

type MethodArg = string | number | BigNumber;
type MethodArgs = Array<MethodArg | MethodArg[]>;

type OptionalMethodInputs =
  | Array<MethodArg | MethodArg[] | undefined>
  | undefined;

function isMethodArg(x: unknown): x is MethodArg {
  return (
    BigNumber.isBigNumber(x) || ['string', 'number'].indexOf(typeof x) !== -1
  );
}

function isValidMethodArgs(x: unknown): x is MethodArgs | undefined {
  return (
    x === undefined ||
    (Array.isArray(x) &&
      x.every(
        (xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg)),
      ))
  );
}

interface CallResult {
  readonly valid: boolean;
  readonly data: string | undefined;
  readonly blockNumber: number | undefined;
}

const INVALID_RESULT: CallResult = {
  valid: false,
  blockNumber: undefined,
  data: undefined,
};

// use this options object
export const NEVER_RELOAD: V3ListenerOptions = {
  blocksPerFetch: Infinity,
};

// the lowest level call for subscribing to contract data
function useCallsData(
  calls: (Call | undefined)[],
  { blocksPerFetch }: V3ListenerOptions = { blocksPerFetch: 1 },
  methodName?: string,
): CallResult[] {
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const localBlocksPerFetch = config['blocksPerFetch'] ?? 20;
  if (blocksPerFetch && blocksPerFetch === 1) {
    blocksPerFetch = localBlocksPerFetch;
  }
  const callResults = useAppSelector((state) => state.multicallV3.callResults);
  const dispatch = useAppDispatch();

  const serializedCallKeys: string = useMemo(
    () =>
      JSON.stringify(
        calls
          ?.filter((c): c is Call => Boolean(c))
          ?.map(toCallKey)
          ?.sort() ?? [],
      ),
    [calls],
  );

  // update listeners when there is an actual change that persists for at least 100ms
  useEffect(() => {
    const callKeys: string[] = JSON.parse(serializedCallKeys);
    if (!chainId || callKeys.length === 0) return undefined;
    const calls = callKeys.map((key) => parseCallKey(key));

    dispatch(
      addV3MulticallListeners({
        chainId,
        calls,
        options: { blocksPerFetch },
      }),
    );

    return () => {
      dispatch(
        removeV3MulticallListeners({
          chainId,
          calls,
          options: { blocksPerFetch },
        }),
      );
    };
  }, [chainId, dispatch, blocksPerFetch, serializedCallKeys]);

  return useMemo(
    () =>
      calls.map<CallResult>((call) => {
        if (!chainId || !call) return INVALID_RESULT;

        const result = callResults[chainId]?.[toCallKey(call)];
        let data;

        if (result?.data && result?.data !== '0x') {
          data = result.data;
        } else {
          // console.error(result, result?.data, call)
        }

        return { valid: true, data, blockNumber: result?.blockNumber };
      }),
    [callResults, calls, chainId],
  );
}

interface CallState {
  readonly valid: boolean;
  // the result, or undefined if loading or errored/no data
  readonly result: Result | undefined;
  // true if the result has never been fetched
  readonly loading: boolean;
  // true if the result is not for the latest block
  readonly syncing: boolean;
  // true if the call was made and is synced, but the return data is invalid
  readonly error: boolean;
}

const INVALID_CALL_STATE: CallState = {
  valid: false,
  result: undefined,
  loading: false,
  syncing: false,
  error: false,
};
const LOADING_CALL_STATE: CallState = {
  valid: true,
  result: undefined,
  loading: true,
  syncing: true,
  error: false,
};

function toCallState(
  callResult: CallResult | undefined,
  contractInterface: Interface | undefined,
  fragment: FunctionFragment | undefined,
  latestBlockNumber: number | undefined,
): CallState {
  if (!callResult) return INVALID_CALL_STATE;
  const { valid, data, blockNumber } = callResult;
  if (!valid) return INVALID_CALL_STATE;
  if (valid && !blockNumber) return LOADING_CALL_STATE;
  if (!contractInterface || !fragment || !latestBlockNumber)
    return LOADING_CALL_STATE;
  const success = data && data.length > 2;
  const syncing = (blockNumber ?? 0) < latestBlockNumber;
  let result: Result | undefined = undefined;

  if (success && data) {
    try {
      result = contractInterface.decodeFunctionResult(fragment, data);
    } catch (error) {
      console.debug('Result data parsing failed', fragment, data);
      return {
        valid: true,
        result,
        loading: false,
        syncing,
        error: true,
      };
    }
  }

  return {
    valid: true,
    result: result,
    loading: false,
    syncing,
    error: !success,
  };
}

export function useSingleContractMultipleData(
  contract: Contract | null | undefined,
  methodName: string,
  callInputs: OptionalMethodInputs[],
  options: Partial<V3ListenerOptions> & { gasRequired?: number } = {},
): CallState[] {
  const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [
    contract,
    methodName,
  ]);

  const blocksPerFetch = options?.blocksPerFetch;
  const gasRequired = options?.gasRequired;

  const calls = useMemo(
    () =>
      contract &&
      fragment &&
      callInputs?.length > 0 &&
      callInputs.every((inputs) => isValidMethodArgs(inputs))
        ? callInputs.map<Call>((inputs) => {
            return {
              address: contract.address,
              callData: contract.interface.encodeFunctionData(fragment, inputs),
              ...(gasRequired ? { gasRequired } : {}),
            };
          })
        : [],
    [contract, fragment, callInputs, gasRequired],
  );

  const results = useCallsData(
    calls,
    blocksPerFetch ? { blocksPerFetch } : undefined,
    methodName,
  );

  const latestBlockNumber = useBlockNumber();

  return useMemo(() => {
    return results.map((result) =>
      toCallState(result, contract?.interface, fragment, latestBlockNumber),
    );
  }, [fragment, contract, results, latestBlockNumber]);
}

export function useMultipleContractMultipleData(
  contracts: (Contract | null | undefined)[],
  methodName: string,
  callInputsArr: OptionalMethodInputs[][],
  options: Partial<V3ListenerOptions> & { gasRequired?: number } = {},
): CallState[][] {
  const blocksPerFetch = options?.blocksPerFetch;
  const gasRequired = options?.gasRequired;

  const calls = useMemo(() => {
    let i = 0;
    return contracts.reduce<
      {
        call: Call | undefined;
        contract: Contract | null | undefined;
        fragment: FunctionFragment | undefined;
        callIndex: number;
        contractIndex: number;
      }[]
    >((memo, contract, index) => {
      const callInputs = callInputsArr[index];
      if (callInputs.length > 0) {
        for (const inputs of callInputs) {
          const fragment = contract
            ? contract.interface.getFunction(methodName)
            : undefined;
          const call =
            contract && fragment && isValidMethodArgs(inputs)
              ? {
                  address: contract.address,
                  callData: contract.interface.encodeFunctionData(
                    fragment,
                    inputs,
                  ),
                  ...(gasRequired ? { gasRequired } : {}),
                }
              : undefined;
          memo.push({
            call,
            contract,
            fragment,
            callIndex: i,
            contractIndex: index,
          });
          i++;
        }
      }
      return memo;
    }, []);
  }, [callInputsArr, contracts, gasRequired, methodName]);

  const results = useCallsData(
    calls.map((call) => call.call),
    blocksPerFetch ? { blocksPerFetch } : undefined,
    methodName,
  );

  const latestBlockNumber = useBlockNumber();

  return useMemo(() => {
    return contracts.map((_, ind) => {
      const filteredCalls = calls.filter((call) => call.contractIndex === ind);
      return filteredCalls.map((call) =>
        toCallState(
          results[call.callIndex],
          call.contract?.interface,
          call.fragment,
          latestBlockNumber,
        ),
      );
    });
  }, [contracts, calls, results, latestBlockNumber]);
}

export function useMultipleContractsMultipleData(
  contracts: (Contract | null | undefined)[],
  methodNames: string[],
  callInputsArr: OptionalMethodInputs[][],
  options: Partial<V3ListenerOptions> & { gasRequired?: number } = {},
): CallState[][] {
  const blocksPerFetch = options?.blocksPerFetch;
  const gasRequired = options?.gasRequired;

  const calls = useMemo(() => {
    let i = 0;
    return contracts.reduce<
      {
        call: Call | undefined;
        contract: Contract | null | undefined;
        fragment: FunctionFragment | undefined;
        callIndex: number;
        contractIndex: number;
      }[]
    >((memo, contract, index) => {
      const callInputs = callInputsArr[index];
      if (callInputs.length > 0) {
        for (const inputs of callInputs) {
          const fragment = contract
            ? contract.interface.getFunction(methodNames[index])
            : undefined;
          const call =
            contract && fragment && isValidMethodArgs(inputs)
              ? {
                  address: contract.address,
                  callData: contract.interface.encodeFunctionData(
                    fragment,
                    inputs,
                  ),
                  ...(gasRequired ? { gasRequired } : {}),
                }
              : undefined;
          memo.push({
            call,
            contract,
            fragment,
            callIndex: i,
            contractIndex: index,
          });
          i++;
        }
      }
      return memo;
    }, []);
  }, [callInputsArr, contracts, gasRequired, methodNames]);

  const results = useCallsData(
    calls.map((call) => call.call),
    blocksPerFetch ? { blocksPerFetch } : undefined,
  );

  const latestBlockNumber = useBlockNumber();

  return useMemo(() => {
    return contracts.map((_, ind) => {
      const filteredCalls = calls.filter((call) => call.contractIndex === ind);
      return filteredCalls.map((call) =>
        toCallState(
          results[call.callIndex],
          call.contract?.interface,
          call.fragment,
          latestBlockNumber,
        ),
      );
    });
  }, [contracts, calls, results, latestBlockNumber]);
}

export function useMultipleContractSingleData(
  addresses: (string | undefined)[],
  contractInterface: Interface,
  methodName: string,
  callInputs?: OptionalMethodInputs,
  options?: Partial<V3ListenerOptions> & { gasRequired?: number },
): CallState[] {
  const fragment = useMemo(() => contractInterface.getFunction(methodName), [
    contractInterface,
    methodName,
  ]);

  const blocksPerFetch = options?.blocksPerFetch;
  const gasRequired = options?.gasRequired;

  const callData: string | undefined = useMemo(
    () =>
      fragment && isValidMethodArgs(callInputs)
        ? contractInterface.encodeFunctionData(fragment, callInputs)
        : undefined,
    [callInputs, contractInterface, fragment],
  );

  const calls = useMemo(
    () =>
      fragment && addresses && addresses.length > 0 && callData
        ? addresses.map<Call | undefined>((address) => {
            return address && callData
              ? {
                  address,
                  callData,
                  ...(gasRequired ? { gasRequired } : {}),
                }
              : undefined;
          })
        : [],
    [addresses, callData, fragment, gasRequired],
  );

  const results = useCallsData(
    calls,
    blocksPerFetch ? { blocksPerFetch } : undefined,
  );

  const latestBlockNumber = useBlockNumber();

  return useMemo(() => {
    return results.map((result) =>
      toCallState(result, contractInterface, fragment, latestBlockNumber),
    );
  }, [fragment, results, contractInterface, latestBlockNumber]);
}

export function useSingleCallResult(
  contract: Contract | null | undefined,
  methodName: string,
  inputs?: OptionalMethodInputs,
  options?: Partial<V3ListenerOptions> & { gasRequired?: number },
): CallState {
  const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [
    contract,
    methodName,
  ]);

  const blocksPerFetch = options?.blocksPerFetch;
  const gasRequired = options?.gasRequired;

  const calls = useMemo<Call[]>(() => {
    return contract && fragment && isValidMethodArgs(inputs)
      ? [
          {
            address: contract.address,
            callData: contract.interface.encodeFunctionData(fragment, inputs),
            ...(gasRequired ? { gasRequired } : {}),
          },
        ]
      : [];
  }, [contract, fragment, inputs, gasRequired]);

  const result = useCallsData(
    calls,
    blocksPerFetch ? { blocksPerFetch } : undefined,
  )[0];
  const latestBlockNumber = useBlockNumber();

  return useMemo(() => {
    return toCallState(
      result,
      contract?.interface,
      fragment,
      latestBlockNumber,
    );
  }, [result, contract, fragment, latestBlockNumber]);
}

export async function getCallsDataImmediately(
  contract: Contract,
  blockNumber: number,
  calls: (Call | undefined)[],
): Promise<CallResult[]> {
  try {
    const { returnData } = await contract.callStatic.multicall(
      calls
        .filter((call: Call | undefined) => {
          return call !== undefined;
        })
        .map((obj) => ({
          target: obj?.address,
          callData: obj?.callData,
          gasLimit: obj?.gasRequired ?? 10_000_000,
        })),
      { blockTag: blockNumber },
    );
    return returnData.map((data: { success: boolean; returnData: string }) => {
      return {
        valid: data.success,
        data: data.returnData,
        blockNumber,
      } as CallResult;
    });
  } catch (error) {
    console.error('Failed to fetch chunk', error);
    return [];
  }
}

export async function getSingleContractMultipleDataImmediately(
  contract: Contract,
  methodName: string,
  callInputs: OptionalMethodInputs[],
  latestBlockNumber: number,
): Promise<CallState[]> {
  const fragment = contract.interface?.getFunction(methodName);
  const calls =
    contract &&
    fragment &&
    callInputs &&
    callInputs.length > 0 &&
    callInputs.every((inputs) => isValidMethodArgs(inputs))
      ? callInputs.map<Call>((inputs) => {
          return {
            address: contract.address,
            callData: contract.interface.encodeFunctionData(fragment, inputs),
          };
        })
      : [];

  const results = await getCallsDataImmediately(
    contract,
    latestBlockNumber,
    calls,
  );

  return results.map((result) =>
    toCallState(result, contract.interface, fragment, latestBlockNumber),
  );
}

export async function getMultipleContractMultipleDataImmediately(
  contracts: Contract[],
  latestBlockNumber: number,
  methodName: string,
  callInputsArr: OptionalMethodInputs[][],
): Promise<CallState[][]> {
  const multicalls: Call[][] = contracts.map((contract, index) => {
    const callInputs = callInputsArr[index];
    const calls: Call[] = [];
    if (callInputs.length > 0) {
      for (const inputs of callInputs) {
        const fragment = contract
          ? contract.interface.getFunction(methodName)
          : undefined;
        const call =
          contract && fragment && isValidMethodArgs(inputs)
            ? {
                address: contract.address,
                callData: contract.interface.encodeFunctionData(
                  fragment,
                  inputs,
                ),
              }
            : undefined;
        if (call) calls.push(call);
      }
    } else {
      return [];
    }
    return calls;
  });
  const callResults = await Promise.all(
    multicalls.map(async (calls, index) => {
      return await getCallsDataImmediately(
        contracts[index],
        latestBlockNumber,
        calls,
      );
    }),
  );

  return callResults.map((results: CallResult[], index) => {
    return results.map((result) => {
      return toCallState(
        result,
        contracts[index].contractInterface,
        contracts[index]
          ? contracts[index].interface.getFunction(methodName)
          : undefined,
        latestBlockNumber,
      );
    });
  });
}

export async function getMultipleContractSingleDataImmediately(
  contract: Contract,
  addresses: (string | undefined)[],
  contractInterface: Interface,
  latestBlockNumber: number,
  methodName: string,
  callInputs?: OptionalMethodInputs,
): Promise<CallState[]> {
  const fragment = contractInterface.getFunction(methodName);

  const callData: string | undefined =
    fragment && isValidMethodArgs(callInputs)
      ? contractInterface.encodeFunctionData(fragment, callInputs)
      : undefined;
  const calls: (Call | undefined)[] =
    fragment && addresses && addresses.length > 0 && callData
      ? addresses.map<Call | undefined>((address) => {
          return address && callData
            ? {
                address,
                callData,
              }
            : undefined;
        })
      : [];
  const results = await getCallsDataImmediately(
    contract,
    latestBlockNumber,
    calls,
  );

  return results.map((result) =>
    toCallState(result, contractInterface, fragment, latestBlockNumber),
  );
}
