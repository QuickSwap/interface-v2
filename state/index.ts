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
import cntFarms from './cnt/reducer';
import dualFarms from './dualfarms/reducer';
import syrups from './syrups/reducer';
import burn from './burn/reducer';
import burnV3 from './burn/v3/reducer';
import multicall from './multicall/reducer';
import analytics from './analytics/reducer';
import ads from './ads/reducer';
import multicallV3 from './multicall/v3/reducer';
import swapV3 from './swap/v3/reducer';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { api as dataApi } from './data/slice';

const PERSISTED_KEYS: string[] = [
  'user',
  'transactions',
  'lists',
  'farms',
  'cntFarms',
  'dualFarms',
  'syrups',
  'analytics',
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
    burnV3,
    multicall,
    multicallV3,
    lists,
    farms,
    cntFarms,
    dualFarms,
    syrups,
    analytics,
    ads,
    [dataApi.reducerPath]: dataApi.reducer,
    ...gelatoReducers,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({ serializableCheck: false, thunk: true }).concat(
      dataApi.middleware,
    ),
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
