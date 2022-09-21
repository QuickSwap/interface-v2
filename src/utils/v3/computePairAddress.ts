import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';
import {
  BigintIsh,
  CurrencyAmount,
  Price,
  sqrt,
  Token,
} from '@uniswap/sdk-core';
import invariant from 'tiny-invariant';
import JSBI from 'jsbi';
import { V2_FACTORY_ADDRESSES } from 'constants/v3/addresses';
import { ChainId } from '@uniswap/sdk';

export const FACTORY_ADDRESS = V2_FACTORY_ADDRESSES[ChainId.MATIC];
export const INIT_CODE_HASH =
  '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f';
export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000);

// exports for internal consumption
export const ZERO = JSBI.BigInt(0);
export const ONE = JSBI.BigInt(1);
export const FIVE = JSBI.BigInt(5);
export const _997 = JSBI.BigInt(997);
export const _1000 = JSBI.BigInt(1000);

import {
  EXCHANGE_FACTORY_ADDRESS_MAPS,
  EXCHANGE_PAIR_INIT_HASH_MAPS,
  V2Exchanges,
} from 'constants/v3/addresses';

type ExchangeDetails = {
  [exchange in V2Exchanges]: { decimals: number; symbol: string; name: string };
};

//TODO: Move to where the other V2Exchanges Information is
export const EXCHANGE_DETAIL_MAP: ExchangeDetails = {
  [V2Exchanges.Quickswap]: {
    decimals: 18,
    symbol: 'QUICK-V2',
    name: 'Quickswap V2',
  },
  [V2Exchanges.SushiSwap]: {
    decimals: 18,
    symbol: 'SLP',
    name: 'SushiSwap LP Token',
  },
};

export function toV2LiquidityToken({
  tokens: [tokenA, tokenB],
  exchange,
}: {
  tokens: [Token, Token];
  exchange: V2Exchanges;
}): Token {
  const exchangeDetail = EXCHANGE_DETAIL_MAP[exchange];
  return new Token(
    tokenA.chainId,
    computePairAddress({ tokenA, tokenB, exchange }),
    exchangeDetail.decimals,
    exchangeDetail.symbol,
    exchangeDetail.name,
  );
}

export const computePairAddress = ({
  tokenA,
  tokenB,
  exchange,
}: {
  tokenA: Token;
  tokenB: Token;
  exchange: V2Exchanges;
}): string => {
  const factoryAddress = EXCHANGE_FACTORY_ADDRESS_MAPS[exchange][137];
  const initHash = EXCHANGE_PAIR_INIT_HASH_MAPS[exchange][137];
  const [token0, token1] = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA]; // does safety checks
  return getCreate2Address(
    factoryAddress,
    keccak256(
      ['bytes'],
      [pack(['address', 'address'], [token0.address, token1.address])],
    ),
    initHash,
  );
};

export class Pair {
  public readonly liquidityToken: Token;
  private readonly tokenAmounts: [CurrencyAmount<Token>, CurrencyAmount<Token>];
  private readonly exchange: V2Exchanges;

  public get reserveAmount0(): CurrencyAmount<Token> {
    return this.tokenAmounts[0];
  }

  public get reserveAmount1(): CurrencyAmount<Token> {
    return this.tokenAmounts[1];
  }

  public constructor(
    currencyAmountA: CurrencyAmount<Token>,
    tokenAmountB: CurrencyAmount<Token>,
    exchange: V2Exchanges,
  ) {
    const tokenAmounts = currencyAmountA.currency.sortsBefore(
      tokenAmountB.currency,
    ) // does safety checks
      ? [currencyAmountA, tokenAmountB]
      : [tokenAmountB, currencyAmountA];

    this.exchange = exchange;
    this.liquidityToken = toV2LiquidityToken({
      tokens: [tokenAmounts[0].currency, tokenAmounts[1].currency],
      exchange,
    });

    this.tokenAmounts = tokenAmounts as [
      CurrencyAmount<Token>,
      CurrencyAmount<Token>,
    ];
  }

  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */
  public get token0Price(): Price<Token, Token> {
    const result = this.tokenAmounts[1].divide(this.tokenAmounts[0]);
    return new Price(
      this.token0,
      this.token1,
      result.denominator,
      result.numerator,
    );
  }

  /**
   * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
   */
  public get token1Price(): Price<Token, Token> {
    const result = this.tokenAmounts[0].divide(this.tokenAmounts[1]);
    return new Price(
      this.token1,
      this.token0,
      result.denominator,
      result.numerator,
    );
  }

  /**
   * Returns the chain ID of the tokens in the pair.
   */
  public get chainId(): number {
    return this.token0.chainId;
  }

  public get token0(): Token {
    return this.tokenAmounts[0].currency;
  }

  public get token1(): Token {
    return this.tokenAmounts[1].currency;
  }

  public get reserve0(): CurrencyAmount<Token> {
    return this.tokenAmounts[0];
  }

  public get reserve1(): CurrencyAmount<Token> {
    return this.tokenAmounts[1];
  }

  public static getAddress(
    tokenA: Token,
    tokenB: Token,
    exchange: V2Exchanges,
  ): string {
    return computePairAddress({
      tokenA,
      tokenB,
      exchange,
    });
  }

  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */
  public involvesToken(token: Token): boolean {
    return token.equals(this.token0) || token.equals(this.token1);
  }

  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  public priceOf(token: Token): Price<Token, Token> {
    invariant(this.involvesToken(token), 'TOKEN');
    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  }

  public reserveOf(token: Token): CurrencyAmount<Token> {
    invariant(this.involvesToken(token), 'TOKEN');
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  }

  public getOutputAmount(
    inputAmount: CurrencyAmount<Token>,
  ): [CurrencyAmount<Token>, Pair] {
    invariant(this.involvesToken(inputAmount.currency), 'TOKEN');
    if (
      JSBI.equal(this.reserve0.quotient, ZERO) ||
      JSBI.equal(this.reserve1.quotient, ZERO)
    ) {
      // throw new InsufficientReservesError()
      throw new Error();
    }
    const inputReserve = this.reserveOf(inputAmount.currency);
    const outputReserve = this.reserveOf(
      inputAmount.currency.equals(this.token0) ? this.token1 : this.token0,
    );
    const inputAmountWithFee = JSBI.multiply(inputAmount.quotient, _997);
    const numerator = JSBI.multiply(inputAmountWithFee, outputReserve.quotient);
    const denominator = JSBI.add(
      JSBI.multiply(inputReserve.quotient, _1000),
      inputAmountWithFee,
    );
    const outputAmount = CurrencyAmount.fromRawAmount(
      inputAmount.currency.equals(this.token0) ? this.token1 : this.token0,
      JSBI.divide(numerator, denominator),
    );
    if (JSBI.equal(outputAmount.quotient, ZERO)) {
      // throw new InsufficientInputAmountError()
      throw new Error();
    }
    return [
      outputAmount,
      new Pair(
        inputReserve.add(inputAmount),
        outputReserve.subtract(outputAmount),
        this.exchange,
      ),
    ];
  }

  public getInputAmount(
    outputAmount: CurrencyAmount<Token>,
  ): [CurrencyAmount<Token>, Pair] {
    invariant(this.involvesToken(outputAmount.currency), 'TOKEN');
    if (
      JSBI.equal(this.reserve0.quotient, ZERO) ||
      JSBI.equal(this.reserve1.quotient, ZERO) ||
      JSBI.greaterThanOrEqual(
        outputAmount.quotient,
        this.reserveOf(outputAmount.currency).quotient,
      )
    ) {
      // throw new InsufficientReservesError()
      throw new Error();
    }

    const outputReserve = this.reserveOf(outputAmount.currency);
    const inputReserve = this.reserveOf(
      outputAmount.currency.equals(this.token0) ? this.token1 : this.token0,
    );
    const numerator = JSBI.multiply(
      JSBI.multiply(inputReserve.quotient, outputAmount.quotient),
      _1000,
    );
    const denominator = JSBI.multiply(
      JSBI.subtract(outputReserve.quotient, outputAmount.quotient),
      _997,
    );
    const inputAmount = CurrencyAmount.fromRawAmount(
      outputAmount.currency.equals(this.token0) ? this.token1 : this.token0,
      JSBI.add(JSBI.divide(numerator, denominator), ONE),
    );
    return [
      inputAmount,
      new Pair(
        inputReserve.add(inputAmount),
        outputReserve.subtract(outputAmount),
        this.exchange,
      ),
    ];
  }

  public getLiquidityMinted(
    totalSupply: CurrencyAmount<Token>,
    tokenAmountA: CurrencyAmount<Token>,
    tokenAmountB: CurrencyAmount<Token>,
  ): CurrencyAmount<Token> {
    invariant(totalSupply.currency.equals(this.liquidityToken), 'LIQUIDITY');
    const tokenAmounts = tokenAmountA.currency.sortsBefore(
      tokenAmountB.currency,
    ) // does safety checks
      ? [tokenAmountA, tokenAmountB]
      : [tokenAmountB, tokenAmountA];
    invariant(
      tokenAmounts[0].currency.equals(this.token0) &&
        tokenAmounts[1].currency.equals(this.token1),
      'TOKEN',
    );

    let liquidity: JSBI;
    if (JSBI.equal(totalSupply.quotient, ZERO)) {
      liquidity = JSBI.subtract(
        sqrt(JSBI.multiply(tokenAmounts[0].quotient, tokenAmounts[1].quotient)),
        MINIMUM_LIQUIDITY,
      );
    } else {
      const amount0 = JSBI.divide(
        JSBI.multiply(tokenAmounts[0].quotient, totalSupply.quotient),
        this.reserve0.quotient,
      );
      const amount1 = JSBI.divide(
        JSBI.multiply(tokenAmounts[1].quotient, totalSupply.quotient),
        this.reserve1.quotient,
      );
      liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
    }
    if (!JSBI.greaterThan(liquidity, ZERO)) {
      // throw new InsufficientInputAmountError()
      throw new Error();
    }
    return CurrencyAmount.fromRawAmount(this.liquidityToken, liquidity);
  }

  public getLiquidityValue(
    token: Token,
    totalSupply: CurrencyAmount<Token>,
    liquidity: CurrencyAmount<Token>,
    feeOn = false,
    kLast?: BigintIsh,
  ): CurrencyAmount<Token> {
    invariant(this.involvesToken(token), 'TOKEN');
    invariant(totalSupply.currency.equals(this.liquidityToken), 'TOTAL_SUPPLY');
    invariant(liquidity.currency.equals(this.liquidityToken), 'LIQUIDITY');
    invariant(
      JSBI.lessThanOrEqual(liquidity.quotient, totalSupply.quotient),
      'LIQUIDITY',
    );

    let totalSupplyAdjusted: CurrencyAmount<Token>;
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply;
    } else {
      invariant(!!kLast, 'K_LAST');
      const kLastParsed = JSBI.BigInt(kLast);
      if (!JSBI.equal(kLastParsed, ZERO)) {
        const rootK = sqrt(
          JSBI.multiply(this.reserve0.quotient, this.reserve1.quotient),
        );
        const rootKLast = sqrt(kLastParsed);
        if (JSBI.greaterThan(rootK, rootKLast)) {
          const numerator = JSBI.multiply(
            totalSupply.quotient,
            JSBI.subtract(rootK, rootKLast),
          );
          const denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast);
          const feeLiquidity = JSBI.divide(numerator, denominator);
          totalSupplyAdjusted = totalSupply.add(
            CurrencyAmount.fromRawAmount(this.liquidityToken, feeLiquidity),
          );
        } else {
          totalSupplyAdjusted = totalSupply;
        }
      } else {
        totalSupplyAdjusted = totalSupply;
      }
    }

    return CurrencyAmount.fromRawAmount(
      token,
      JSBI.divide(
        JSBI.multiply(liquidity.quotient, this.reserveOf(token).quotient),
        totalSupplyAdjusted.quotient,
      ),
    );
  }
}
