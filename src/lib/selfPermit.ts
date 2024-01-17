import { BigintIsh, Token } from '@uniswap/sdk-core';
import { Interface } from '@ethersproject/abi';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import abi from 'constants/abis/v3/ISelfPermit.json';
import { toHex } from './utils/calldata';

export interface StandardPermitArguments {
  v: 0 | 1 | 27 | 28;
  r: string;
  s: string;
  amount: BigintIsh;
  deadline: BigintIsh;
}

export interface AllowedPermitArguments {
  v: 0 | 1 | 27 | 28;
  r: string;
  s: string;
  nonce: BigintIsh;
  expiry: BigintIsh;
}

export type PermitOptions = StandardPermitArguments | AllowedPermitArguments;

function isAllowedPermit(
  permitOptions: PermitOptions,
): permitOptions is AllowedPermitArguments {
  return 'nonce' in permitOptions;
}

export abstract class SelfPermit {
  public static INTERFACE: Interface = new Interface(abi.abi);

  protected static encodePermit(token: Token, options: PermitOptions) {
    return isAllowedPermit(options)
      ? SelfPermit.INTERFACE.encodeFunctionData('selfPermitAllowed', [
          token.address,
          toHex(options.nonce),
          toHex(options.expiry),
          options.v,
          options.r,
          options.s,
        ])
      : SelfPermit.INTERFACE.encodeFunctionData('selfPermit', [
          token.address,
          toHex(options.amount),
          toHex(options.deadline),
          options.v,
          options.r,
          options.s,
        ]);
  }
}
