import { createReducer } from '@reduxjs/toolkit';
import { selectVault, typeInput } from './actions';
import { ICHIVault } from 'hooks/useICHIData';

export interface SingleTokenState {
  readonly typedValue: string;
  readonly selectedVault: ICHIVault | undefined;
}

const initialState: SingleTokenState = {
  typedValue: '',
  selectedVault: undefined,
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
