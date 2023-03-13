import { createAction } from '@reduxjs/toolkit';
import { IPresetArgs } from 'pages/PoolsPage/v3/SupplyLiquidityV3/components/PresetRanges';
import { Presets } from './reducer';

export enum Field {
  CURRENCY_A = 'CURRENCY_A',
  CURRENCY_B = 'CURRENCY_B',
}

export enum Bound {
  LOWER = 'LOWER',
  UPPER = 'UPPER',
}

export const typeInput = createAction<{
  field: Field;
  typedValue: string;
  noLiquidity: boolean;
}>('mintV3/typeInputMint');
export const typeStartPriceInput = createAction<{ typedValue: string }>(
  'mintV3/typeStartPriceInput',
);
export const typeLeftRangeInput = createAction<{ typedValue: string }>(
  'mintV3/typeLeftRangeInput',
);
export const typeRightRangeInput = createAction<{ typedValue: string }>(
  'mintV3/typeRightRangeInput',
);
export const resetMintState = createAction<void>('mintV3/resetMintState');
export const setFullRange = createAction<void>('mintV3/setFullRange');
export const updateDynamicFee = createAction<{ dynamicFee: number }>(
  'mintV3/updateDynamicFee',
);
export const updateSelectedPreset = createAction<{ preset: Presets | null }>(
  'mintV3/updateSelectedPreset',
);
export const setAddLiquidityTxHash = createAction<{ txHash: string }>(
  'mintV3/setAddLiquidityTxHash',
);
export const setShowNewestPosition = createAction<{
  showNewestPosition: boolean;
}>('mintV3/setShowNewestPosition');
export const setInitialUSDPrices = createAction<{
  field: Field;
  typedValue: string;
}>('mintV3/setInitialUSDPrices');
export const setInitialTokenPrice = createAction<{ typedValue: string }>(
  'mintV3/setInitialTokenPrice',
);
export const updateCurrentStep = createAction<{ currentStep: number }>(
  'mintV3/setCurrentStep',
);
export const selectCurrency = createAction<{
  field: Field;
  currencyId: string;
}>('mintV3/selectCurrency');
export const updateLiquidityRangeType = createAction<{
  liquidityRangeType: string;
}>('mintV3/setliquidityRangeType');

export const updatePresetRange = createAction<{
  presetRange: IPresetArgs;
}>('mintV3/setPresetRange');
