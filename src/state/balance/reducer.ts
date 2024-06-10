import { createReducer } from '@reduxjs/toolkit';
import { updateUserBalance } from './actions';

export interface BalanceState {
  flag: boolean;
}
const initialState: BalanceState = {
  flag: false,
};

export default createReducer(initialState, (builder) =>
  builder.addCase(updateUserBalance, (state) => {
    return {
      ...state,
      flag: !state.flag,
    };
  }),
);
