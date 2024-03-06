export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export const POOL_INIT_CODE_HASH =
  import.meta.env.VITE_POOL_INIT_CODE_HASH ?? '';
export const UNI_POOL_INIT_CODE_HASH =
  import.meta.env.VITE_UNI_POOL_INIT_CODE_HASH ?? '';
/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  LOWEST = 100,
  LOW = 500,
  MEDIUM = 3000,
  HIGH = 10000,
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOWEST]: 1,
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 200,
};
