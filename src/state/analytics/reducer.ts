import { createReducer } from '@reduxjs/toolkit';
import { setAnalyticsLoaded, toggleAnalyticsVersion } from './actions';

export interface AnalyticsState {
  readonly isV3: boolean;
  readonly isLoaded: boolean;
}

const initialState: AnalyticsState = {
  isV3: true,
  isLoaded: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(toggleAnalyticsVersion, (state) => {
      state.isV3 = !state.isV3;
    })
    .addCase(setAnalyticsLoaded, (state, { payload: isLoaded }) => {
      state.isLoaded = isLoaded;
    }),
);
