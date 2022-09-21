import { CurrencyAmount, Token, WETH9 } from '@uniswap/sdk-core';

import { nearestUsableTick } from '../utils/nearestUsableTick';
import { TickMath } from '../utils/tickMath';
import { Pool } from './pool';
import { encodeSqrtRatioX96 } from '../utils/encodeSqrtRatioX96';
import JSBI from 'jsbi';
// import { NEGATIVE_ONE } from '../internalConstants'
import { FeeAmount, NEGATIVE_ONE, TICK_SPACINGS } from 'v3lib/utils';

const ONE_ETHER = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));

describe('Pool', () => {
  const USDC = new Token(
    1,
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    6,
    'USDC',
    'USD Coin',
  );
  const DAI = new Token(
    1,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'DAI',
    'DAI Stablecoin',
  );

  describe('constructor', () => {
    it('cannot be used for tokens on different chains', () => {
      expect(() => {
        new Pool(
          USDC,
          WETH9[3],
          FeeAmount.MEDIUM,
          encodeSqrtRatioX96(1, 1),
          0,
          0,
          [],
        );
      }).toThrow('CHAIN_IDS');
    });

    it('fee must be integer', () => {
      expect(() => {
        new Pool(
          USDC,
          WETH9[1],
          FeeAmount.MEDIUM + 0.5,
          encodeSqrtRatioX96(1, 1),
          0,
          0,
          [],
        );
      }).toThrow('FEE');
    });

    it('fee cannot be more than 1e6', () => {
      expect(() => {
        new Pool(USDC, WETH9[1], 1e6, encodeSqrtRatioX96(1, 1), 0, 0, []);
      }).toThrow('FEE');
    });

    it('cannot be given two of the same token', () => {
      expect(() => {
        new Pool(
          USDC,
          USDC,
          FeeAmount.MEDIUM,
          encodeSqrtRatioX96(1, 1),
          0,
          0,
          [],
        );
      }).toThrow('ADDRESSES');
    });

    it('price must be within tick price bounds', () => {
      expect(() => {
        new Pool(
          USDC,
          WETH9[1],
          FeeAmount.MEDIUM,
          encodeSqrtRatioX96(1, 1),
          0,
          1,
          [],
        );
      }).toThrow('PRICE_BOUNDS');
      expect(() => {
        new Pool(
          USDC,
          WETH9[1],
          FeeAmount.MEDIUM,
          JSBI.add(encodeSqrtRatioX96(1, 1), JSBI.BigInt(1)),
          0,
          -1,
          [],
        );
      }).toThrow('PRICE_BOUNDS');
    });

    it('works with valid arguments for empty pool medium fee', () => {
      new Pool(
        USDC,
        WETH9[1],
        FeeAmount.MEDIUM,
        encodeSqrtRatioX96(1, 1),
        0,
        0,
        [],
      );
    });

    it('works with valid arguments for empty pool low fee', () => {
      new Pool(
        USDC,
        WETH9[1],
        FeeAmount.LOW,
        encodeSqrtRatioX96(1, 1),
        0,
        0,
        [],
      );
    });

    it('works with valid arguments for empty pool high fee', () => {
      new Pool(
        USDC,
        WETH9[1],
        FeeAmount.HIGH,
        encodeSqrtRatioX96(1, 1),
        0,
        0,
        [],
      );
    });
  });

  describe('#getAddress', () => {
    it('matches an example', () => {
      const result = Pool.getAddress(USDC, DAI, FeeAmount.LOW);
      expect(result).toEqual('0x6c6Bc977E13Df9b0de53b251522280BB72383700');
    });
  });

  describe('#token0', () => {
    it('always is the token that sorts before', () => {
      let pool = new Pool(
        USDC,
        DAI,
        FeeAmount.LOW,
        encodeSqrtRatioX96(1, 1),
        0,
        0,
        [],
      );
      expect(pool.token0).toEqual(DAI);
      pool = new Pool(
        DAI,
        USDC,
        FeeAmount.LOW,
        encodeSqrtRatioX96(1, 1),
        0,
        0,
        [],
      );
      expect(pool.token0).toEqual(DAI);
    });
  });
  describe('#token1', () => {
    it('always is the token that sorts after', () => {
      let pool = new Pool(
        USDC,
        DAI,
        FeeAmount.LOW,
        encodeSqrtRatioX96(1, 1),
        0,
        0,
        [],
      );
      expect(pool.token1).toEqual(USDC);
      pool = new Pool(
        DAI,
        USDC,
        FeeAmount.LOW,
        encodeSqrtRatioX96(1, 1),
        0,
        0,
        [],
      );
      expect(pool.token1).toEqual(USDC);
    });
  });

  describe('#token0Price', () => {
    it('returns price of token0 in terms of token1', () => {
      expect(
        new Pool(
          USDC,
          DAI,
          FeeAmount.LOW,
          encodeSqrtRatioX96(101e6, 100e18),
          0,
          TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
          [],
        ).token0Price.toSignificant(5),
      ).toEqual('1.01');
      expect(
        new Pool(
          DAI,
          USDC,
          FeeAmount.LOW,
          encodeSqrtRatioX96(101e6, 100e18),
          0,
          TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
          [],
        ).token0Price.toSignificant(5),
      ).toEqual('1.01');
    });
  });

  describe('#token1Price', () => {
    it('returns price of token1 in terms of token0', () => {
      expect(
        new Pool(
          USDC,
          DAI,
          FeeAmount.LOW,
          encodeSqrtRatioX96(101e6, 100e18),
          0,
          TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
          [],
        ).token1Price.toSignificant(5),
      ).toEqual('0.9901');
      expect(
        new Pool(
          DAI,
          USDC,
          FeeAmount.LOW,
          encodeSqrtRatioX96(101e6, 100e18),
          0,
          TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(101e6, 100e18)),
          [],
        ).token1Price.toSignificant(5),
      ).toEqual('0.9901');
    });
  });

  describe('#priceOf', () => {
    const pool = new Pool(
      USDC,
      DAI,
      FeeAmount.LOW,
      encodeSqrtRatioX96(1, 1),
      0,
      0,
      [],
    );
    it('returns price of token in terms of other token', () => {
      expect(pool.priceOf(DAI)).toEqual(pool.token0Price);
      expect(pool.priceOf(USDC)).toEqual(pool.token1Price);
    });

    it('throws if invalid token', () => {
      expect(() => pool.priceOf(WETH9[1])).toThrow('TOKEN');
    });
  });

  describe('#chainId', () => {
    it('returns the token0 chainId', () => {
      let pool = new Pool(
        USDC,
        DAI,
        FeeAmount.LOW,
        encodeSqrtRatioX96(1, 1),
        0,
        0,
        [],
      );
      expect(pool.chainId).toEqual(1);
      pool = new Pool(
        DAI,
        USDC,
        FeeAmount.LOW,
        encodeSqrtRatioX96(1, 1),
        0,
        0,
        [],
      );
      expect(pool.chainId).toEqual(1);
    });
  });

  describe('#involvesToken', () => {
    const pool = new Pool(
      USDC,
      DAI,
      FeeAmount.LOW,
      encodeSqrtRatioX96(1, 1),
      0,
      0,
      [],
    );
    expect(pool.involvesToken(USDC)).toEqual(true);
    expect(pool.involvesToken(DAI)).toEqual(true);
    expect(pool.involvesToken(WETH9[1])).toEqual(false);
  });

  describe('swaps', () => {
    let pool: Pool;

    beforeEach(() => {
      pool = new Pool(
        USDC,
        DAI,
        FeeAmount.LOW,
        encodeSqrtRatioX96(1, 1),
        ONE_ETHER,
        0,
        [
          {
            index: nearestUsableTick(
              TickMath.MIN_TICK,
              TICK_SPACINGS[FeeAmount.LOW],
            ),
            liquidityNet: ONE_ETHER,
            liquidityGross: ONE_ETHER,
          },
          {
            index: nearestUsableTick(
              TickMath.MAX_TICK,
              TICK_SPACINGS[FeeAmount.LOW],
            ),
            liquidityNet: JSBI.multiply(ONE_ETHER, NEGATIVE_ONE),
            liquidityGross: ONE_ETHER,
          },
        ],
      );
    });

    describe('#getOutputAmount', () => {
      it('USDC -> DAI', async () => {
        const inputAmount = CurrencyAmount.fromRawAmount(USDC, 100);
        const [outputAmount] = await pool.getOutputAmount(inputAmount);
        expect(outputAmount.currency.equals(DAI)).toBe(true);
        expect(outputAmount.quotient).toEqual(JSBI.BigInt(98));
      });

      it('DAI -> USDC', async () => {
        const inputAmount = CurrencyAmount.fromRawAmount(DAI, 100);
        const [outputAmount] = await pool.getOutputAmount(inputAmount);
        expect(outputAmount.currency.equals(USDC)).toBe(true);
        expect(outputAmount.quotient).toEqual(JSBI.BigInt(98));
      });
    });

    describe('#getInputAmount', () => {
      it('USDC -> DAI', async () => {
        const outputAmount = CurrencyAmount.fromRawAmount(DAI, 98);
        const [inputAmount] = await pool.getInputAmount(outputAmount);
        expect(inputAmount.currency.equals(USDC)).toBe(true);
        expect(inputAmount.quotient).toEqual(JSBI.BigInt(100));
      });

      it('DAI -> USDC', async () => {
        const outputAmount = CurrencyAmount.fromRawAmount(USDC, 98);
        const [inputAmount] = await pool.getInputAmount(outputAmount);
        expect(inputAmount.currency.equals(DAI)).toBe(true);
        expect(inputAmount.quotient).toEqual(JSBI.BigInt(100));
      });
    });
  });
});
