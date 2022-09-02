import { createReducer } from '@reduxjs/toolkit';
import { setAnalyticsLoaded } from './actions';

export interface AnalyticsState {
  readonly isLoaded: boolean;
}

const initialState: AnalyticsState = {
  isLoaded: false,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(setAnalyticsLoaded, (state, { payload: isLoaded }) => {
    state.isLoaded = isLoaded;
  }),
);
