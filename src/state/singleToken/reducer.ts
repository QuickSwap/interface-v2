import { createReducer } from '@reduxjs/toolkit';
import { selectVault, typeInput } from './actions';

export interface SingleTokenState {
  readonly typedValue: string;
  readonly selectedVault: string | undefined;
}

const initialState: SingleTokenState = {
  typedValue: '',
  selectedVault: '',
};

export default createReducer<SingleTokenState>(initialState, (builder) =>
  builder
    .addCase(selectVault, (state, { payload: { vault } }) => {
      return {
        ...state,
        selectedVault: vault,
      };
    })
    .addCase(typeInput, (state, { payload: { typedValue } }) => {
      return {
        ...state,
        typedValue,
      };
    }),
);
