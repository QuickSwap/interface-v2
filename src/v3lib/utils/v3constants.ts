export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export const POOL_INIT_CODE_HASH =
  '0x6ec6c9c8091d160c0aa74b2b14ba9c1717e95093bd3ac085cee99a49aab294a4';

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  LOW = 500,
  MEDIUM = 500,
  HIGH = 500,
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOW]: 60,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 60,
};
