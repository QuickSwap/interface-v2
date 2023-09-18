import { createAction } from '@reduxjs/toolkit';
import { LiquidityHubState } from './reducer';

export const setLiquidityHubState = createAction<Partial<LiquidityHubState>>(
  'liquidityHub/setLiquidityHubState',
);

export const resetLiquidityHubState = createAction(
  'liquidityHub/resetLiquidityHubState',
);
