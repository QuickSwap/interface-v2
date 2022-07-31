import { createReducer } from '@reduxjs/toolkit';
import { toggleAnalyticsVersion } from './actions';

export interface AnalyticsState {
  readonly isV3: boolean;
}

const initialState: AnalyticsState = {
  isV3: true,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(toggleAnalyticsVersion, (state) => {
    state.isV3 = !state.isV3;
  }),
);
