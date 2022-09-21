import { Interface } from '@ethersproject/abi';
import {
  BigintIsh,
  Currency,
  CurrencyAmount,
  Percent,
  Token,
  TradeType,
  validateAndParseAddress,
} from '@uniswap/sdk-core';
import invariant from 'tiny-invariant';
import { MethodParameters, toHex } from './calldata';
import abi from 'constants/abis/v3/swap-router.json';
import { encodeRouteToPath } from 'lib/src/utils/encodeRouteToPath';
import { Trade } from 'lib/src/trade';
import { ADDRESS_ZERO } from 'v3lib/utils';

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

// type guard
function isAllowedPermit(
  permitOptions: PermitOptions,
): permitOptions is AllowedPermitArguments {
  return 'nonce' in permitOptions;
}

export abstract class SelfPermit {
  public static INTERFACE: Interface = new Interface(abi);

  // protected constructor() { }

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

export interface FeeOptions {
  /**
   * The percent of the output that will be taken as a fee.
   */
  fee: Percent;

  /**
   * The recipient of the fee.
   */
  recipient: string;
}

/**
 * Options for producing the arguments to send calls to the router.
 */
export interface SwapOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  slippageTolerance: Percent;

  /**
   * The account that should receive the output.
   */
  recipient: string;

  /**
   * When the transaction expires, in epoch seconds.
   */
  deadline: BigintIsh;

  /**
   * The optional permit parameters for spending the input.
   */
  inputTokenPermit?: PermitOptions;

  /**
   * The optional price limit for the trade.
   */
  sqrtPriceLimitX96?: BigintIsh;

  /**
   * Optional information for taking a fee on output.
   */
  fee?: FeeOptions;
}

/**
 * Represents the Uniswap V2 SwapRouter, and has static methods for helping execute trades.
 */
export abstract class SwapRouter extends SelfPermit {
  public static INTERFACE: Interface = new Interface(abi);

  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapCallParameters(
    trades:
      | Trade<Currency, Currency, TradeType>
      | Trade<Currency, Currency, TradeType>[],
    options: SwapOptions,
  ): MethodParameters {
    if (!Array.isArray(trades)) {
      trades = [trades];
    }

    const sampleTrade = trades[0];
    const tokenIn = sampleTrade.route.tokenPath[0];
    const tokenOut =
      sampleTrade.route.tokenPath[sampleTrade.route.tokenPath.length - 1];

    // All trades should have the same starting and ending token.
    invariant(
      trades.every((trade) => trade.route.tokenPath[0].equals(tokenIn)),
      'TOKEN_IN_DIFF',
    );
    invariant(
      trades.every((trade) =>
        trade.route.tokenPath[trade.route.tokenPath.length - 1].equals(
          tokenOut,
        ),
      ),
      'TOKEN_OUT_DIFF',
    );

    const calldatas: string[] = [];

    const ZERO_IN: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(
      trades[0].inputAmount.currency,
      0,
    );
    const ZERO_OUT: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(
      trades[0].outputAmount.currency,
      0,
    );

    const totalAmountOut: CurrencyAmount<Currency> = trades.reduce(
      (sum, trade) =>
        sum.add(trade.minimumAmountOut(options.slippageTolerance)),
      ZERO_OUT,
    );

    // flag for whether a refund needs to happen
    const mustRefund =
      sampleTrade.inputAmount.currency.isNative &&
      sampleTrade.tradeType === TradeType.EXACT_OUTPUT;
    const inputIsNative = sampleTrade.inputAmount.currency.isNative;
    // flags for whether funds should be send first to the router
    const outputIsNative = sampleTrade.outputAmount.currency.isNative;
    const routerMustCustody = outputIsNative || !!options.fee;

    const totalValue: CurrencyAmount<Currency> = inputIsNative
      ? trades.reduce(
          (sum, trade) =>
            sum.add(trade.maximumAmountIn(options.slippageTolerance)),
          ZERO_IN,
        )
      : ZERO_IN;

    // encode permit if necessary
    if (options.inputTokenPermit) {
      invariant(sampleTrade.inputAmount.currency.isToken, 'NON_TOKEN_PERMIT');
      calldatas.push(
        SwapRouter.encodePermit(
          sampleTrade.inputAmount.currency,
          options.inputTokenPermit,
        ),
      );
    }

    const recipient: string = validateAndParseAddress(options.recipient);
    const deadline = toHex(options.deadline);

    for (const trade of trades) {
      const amountIn: string = toHex(
        trade.maximumAmountIn(options.slippageTolerance).quotient,
      );
      const amountOut: string = toHex(
        trade.minimumAmountOut(options.slippageTolerance).quotient,
      );

      // flag for whether the trade is single hop or not
      const singleHop = trade.route.pools.length === 1;

      if (singleHop) {
        if (trade.tradeType === TradeType.EXACT_INPUT) {
          const exactInputSingleParams = {
            tokenIn: trade.route.tokenPath[0].address,
            tokenOut: trade.route.tokenPath[1].address,
            fee: trade.route.pools[0].fee,
            recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
            deadline,
            amountIn,
            amountOutMinimum: amountOut,
            sqrtPriceLimitX96: toHex(options.sqrtPriceLimitX96 ?? 0),
          };

          calldatas.push(
            SwapRouter.INTERFACE.encodeFunctionData('exactInputSingle', [
              exactInputSingleParams,
            ]),
          );
        } else {
          const exactOutputSingleParams = {
            tokenIn: trade.route.tokenPath[0].address,
            tokenOut: trade.route.tokenPath[1].address,
            fee: trade.route.pools[0].fee,
            recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
            deadline,
            amountOut,
            amountInMaximum: amountIn,
            sqrtPriceLimitX96: toHex(options.sqrtPriceLimitX96 ?? 0),
          };

          calldatas.push(
            SwapRouter.INTERFACE.encodeFunctionData('exactOutputSingle', [
              exactOutputSingleParams,
            ]),
          );
        }
      } else {
        invariant(
          options.sqrtPriceLimitX96 === undefined,
          'MULTIHOP_PRICE_LIMIT',
        );

        const path: string = encodeRouteToPath(
          trade.route,
          trade.tradeType === TradeType.EXACT_OUTPUT,
        );

        if (trade.tradeType === TradeType.EXACT_INPUT) {
          const exactInputParams = {
            path,
            recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
            deadline,
            amountIn,
            amountOutMinimum: amountOut,
          };

          calldatas.push(
            SwapRouter.INTERFACE.encodeFunctionData('exactInput', [
              exactInputParams,
            ]),
          );
        } else {
          const exactOutputParams = {
            path,
            recipient: routerMustCustody ? ADDRESS_ZERO : recipient,
            deadline,
            amountOut,
            amountInMaximum: amountIn,
          };

          calldatas.push(
            SwapRouter.INTERFACE.encodeFunctionData('exactOutput', [
              exactOutputParams,
            ]),
          );
        }
      }
    }

    // unwrap
    if (routerMustCustody) {
      if (!!options.fee) {
        const feeRecipient: string = validateAndParseAddress(
          options.fee.recipient,
        );
        const fee = toHex(options.fee.fee.multiply(10_000).quotient);

        if (outputIsNative) {
          calldatas.push(
            SwapRouter.INTERFACE.encodeFunctionData(
              'unwrapWNativeTokenWithFee',
              [toHex(totalAmountOut.quotient), recipient, fee, feeRecipient],
            ),
          );
        } else {
          calldatas.push(
            SwapRouter.INTERFACE.encodeFunctionData('sweepTokenWithFee', [
              sampleTrade.route.tokenPath[
                sampleTrade.route.tokenPath.length - 1
              ].address,
              toHex(totalAmountOut.quotient),
              recipient,
              fee,
              feeRecipient,
            ]),
          );
        }
      } else {
        calldatas.push(
          SwapRouter.INTERFACE.encodeFunctionData('unwrapWNativeToken', [
            toHex(totalAmountOut.quotient),
            recipient,
          ]),
        );
      }
    }

    // refund
    if (mustRefund) {
      calldatas.push(
        SwapRouter.INTERFACE.encodeFunctionData('refundNativeToken'),
      );
    }

    return {
      calldata:
        calldatas.length === 1
          ? calldatas[0]
          : SwapRouter.INTERFACE.encodeFunctionData('multicall', [calldatas]),
      value: toHex(totalValue.quotient),
    };
  }
}
