import { configureStore } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';
import application from 'state/application/reducer';
import { updateVersion } from './global/actions';
import user from './user/reducer';
import transactions from './transactions/reducer';
import swap from './swap/reducer';
import twap from './swap/twap/reducer';
import mint from './mint/reducer';
import mintV3 from './mint/v3/reducer';
import lists from './lists/reducer';
import farms from './farms/reducer';
import syrups from './syrups/reducer';
import burn from './burn/reducer';
import burnV3 from './burn/v3/reducer';
import multicall from './multicall/reducer';
import multicallV3 from './multicall/v3/reducer';
import swapV3 from './swap/v3/reducer';
import zap from './zap/reducer';
import singleToken from './singleToken/reducer';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userBalance from './balance/reducer';

const PERSISTED_KEYS: string[] = [
  'user',
  'transactions',
  'lists',
  'farms',
  'syrups',
];

const store = configureStore({
  reducer: {
    application,
    user,
    transactions,
    swap,
    twap,
    userBalance,
    swapV3,
    mint,
    mintV3,
    burn,
    burnV3,
    multicall,
    multicallV3,
    lists,
    farms,
    syrups,
    zap,
    singleToken,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({ serializableCheck: false, thunk: true }),
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
