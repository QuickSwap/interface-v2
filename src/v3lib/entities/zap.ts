import {
  Percent,
  Token,
  validateAndParseAddress,
  WETH9,
} from '@uniswap/sdk-core';
import { ZapType } from '~/constants/index';
import { MergedZap } from '~/state/zap/actions';
import invariant from 'tiny-invariant';

// Options for producing the arguments to send call to zap.
export interface ZapOptions {
  allowedSlippage: Percent;
  ttl: number;
  recipient: string;
  deadline: number;
  zapType: ZapType;

  // When zapping into a contract we need to pass it
  stakingContractAddress?: string;

  // PID for when staking into chef contracts
  stakingPid?: string;

  // This is the max price for a bill to be zapped
  maxPrice?: string;
}

export interface ZapParameters {
  // The method to call the V2 Router
  methodName: string;

  // The arguments to pass to the method, all hex encoded.
  args: (string | string[] | number[])[];

  // The amount of wei to send in hex.
  value: string;
}

const ZERO_HEX = '0x0';

export abstract class Zap {
  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param zap get zap values
   * @param options options for the call parameters
   */
  public static zapCallParameters(
    zap: MergedZap,
    options: ZapOptions,
  ): ZapParameters {
    invariant(zap, 'null Zap');

    const { chainId, currencyIn, currencyOut1, currencyOut2, pairOut } = zap;
    const { zapType, deadline } = options;

    invariant(chainId !== undefined, 'CHAIN_ID');
    invariant(currencyIn.currency !== undefined, 'Missing currency in');
    invariant(
      currencyOut1.outputCurrency !== undefined &&
        currencyOut2.outputCurrency !== undefined,
      'Missing currency out',
    );

    const etherIn = currencyIn.currency.isNative;

    const path1 = currencyOut1.path.map((token: Token) => token.address);
    const path2 = currencyOut2.path.map((token: Token) => token.address);
    const currencyInToken: Token = etherIn
      ? WETH9[chainId]
      : (currencyIn?.currency as Token);
    const to: string = validateAndParseAddress(options.recipient);

    const zapDeadline =
      'ttl' in options
        ? `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(
            16,
          )}`
        : `0x${deadline.toString(16)}`;

    let methodName = '';
    let args: (string | string[] | number[])[] = [];
    let value = '';

    invariant(
      pairOut.minInAmount.token1 !== undefined,
      'Missing pair out token1',
    );
    invariant(
      pairOut.minInAmount.token2 !== undefined,
      'Missing pair out token2',
    );
    invariant(
      currencyOut1.minOutputAmount !== undefined &&
        currencyOut2.minOutputAmount !== undefined,
      'Missing currency out amount',
    );

    switch (zapType) {
      case ZapType.ZAP:
        if (etherIn) {
          methodName = 'zapNative';
          args = [
            [
              currencyOut1.outputCurrency.address,
              currencyOut2.outputCurrency.address,
            ],
            path1,
            path2,
            [currencyOut1.minOutputAmount, currencyOut2.minOutputAmount],
            [pairOut.minInAmount.token1, pairOut.minInAmount.token2],
            to,
            zapDeadline,
          ];
          value = currencyIn.inputAmount.toString();
        } else {
          methodName = 'zap';
          args = [
            currencyInToken.address,
            currencyIn.inputAmount.toString(),
            [
              currencyOut1.outputCurrency.address,
              currencyOut2.outputCurrency.address,
            ],
            path1,
            path2,
            [currencyOut1.minOutputAmount, currencyOut2.minOutputAmount],
            [pairOut.minInAmount.token1, pairOut.minInAmount.token2],
            to,
            zapDeadline,
          ];
          value = ZERO_HEX;
        }
        break;
    }

    return { methodName, args, value };
  }
}
