import { createReducer } from '@reduxjs/toolkit';
import { resetLiquidityHubState, setLiquidityHubState } from './actions';

export interface LiquidityHubState {
  isWon: boolean;
  isLoading: boolean;
  isFailed?: boolean;
  outAmount?: string;
  waitingForApproval?: boolean;
  waitingForSignature?: boolean;
  waitingForWrap?: boolean;
}

const initialState = {
  isWon: false,
  isLoading: false,
  isFailed: false,
};

export default createReducer<LiquidityHubState>(initialState, (builder) =>
  builder
    .addCase(setLiquidityHubState, (state, { payload }) => {
      return { ...state, ...payload };
    })
    .addCase(resetLiquidityHubState, () => {
      return initialState;
    }),
);
