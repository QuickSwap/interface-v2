import { createAction } from '@reduxjs/toolkit';

export interface SerializedToken {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface SerializedPair {
  token0: SerializedToken;
  token1: SerializedToken;
}

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>(
  'user/updateMatchesDarkMode',
);
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>(
  'user/updateUserDarkMode',
);
export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>(
  'user/updateUserExpertMode',
);
export const updateUserSlippageTolerance = createAction<{
  userSlippageTolerance: number;
}>('user/updateUserSlippageTolerance');
export const updateSlippageManuallySet = createAction<{
  slippageManuallySet: boolean;
}>('user/updateSlippageManuallySet');
export const updateUserDeadline = createAction<{ userDeadline: number }>(
  'user/updateUserDeadline',
);
export const addSerializedToken = createAction<{
  serializedToken: SerializedToken;
}>('user/addSerializedToken');
export const removeSerializedToken = createAction<{
  chainId: number;
  address: string;
}>('user/removeSerializedToken');
export const addSerializedPair = createAction<{
  serializedPair: SerializedPair;
}>('user/addSerializedPair');
export const removeSerializedPair = createAction<{
  chainId: number;
  tokenAAddress: string;
  tokenBAddress: string;
}>('user/removeSerializedPair');
export const toggleURLWarning = createAction<void>('app/toggleURLWarning');
// v3 actions
export const updateUserSingleHopOnly = createAction<{
  userSingleHopOnly: boolean;
}>('user/updateUserSingleHopOnly');
export const updateUserBonusRouter = createAction<{
  userBonusRouterDisabled: boolean;
}>('user/updateUserBonusRouter');
