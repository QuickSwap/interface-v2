import { configureStore } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import {
  gelatoReducers,
  GELATO_PERSISTED_KEYS,
} from '@gelatonetwork/limit-orders-react';

import application from 'state/application/reducer';
import { updateVersion } from './global/actions';
import user from './user/reducer';
import transactions from './transactions/reducer';
import swap from './swap/reducer';
import mint from './mint/reducer';
import mintV3 from './mint/v3/reducer';
import lists from './lists/reducer';
import farms from './farms/reducer';
import dualFarms from './dualfarms/reducer';
import syrups from './syrups/reducer';
import burn from './burn/reducer';
import multicall from './multicall/reducer';
import multicallV3 from './multicall/v3/reducer';
import swapV3 from './swap/v3/reducer';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const PERSISTED_KEYS: string[] = [
  'user',
  'transactions',
  'lists',
  'farms',
  'dualFarms',
  'syrups',
  ...GELATO_PERSISTED_KEYS,
];

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    swap,
    swapV3,
    mint,
    mintV3,
    burn,
    multicall,
    multicallV3,
    lists,
    farms,
    dualFarms,
    syrups,
    ...gelatoReducers,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({ serializableCheck: false, thunk: false }),
    save({ states: PERSISTED_KEYS }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
});

store.dispatch(updateVersion());

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
