import { createAction } from '@reduxjs/toolkit';
import { SupportedLocale } from 'constants/v3/locales';

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
  'userV3/updateMatchesDarkMode',
);
export const updateArbitrumAlphaAcknowledged = createAction<{
  arbitrumAlphaAcknowledged: boolean;
}>('userV3/updateArbitrumAlphaAcknowledged');
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>(
  'userV3/updateUserDarkMode',
);
export const updateUserExpertMode = createAction<{ userExpertMode: boolean }>(
  'userV3/updateUserExpertMode',
);
export const updateUserLocale = createAction<{ userLocale: SupportedLocale }>(
  'userV3/updateUserLocale',
);
export const updateUserSingleHopOnly = createAction<{
  userSingleHopOnly: boolean;
}>('userV3/updateUserSingleHopOnly');
export const updateHideClosedPositions = createAction<{
  userHideClosedPositions: boolean;
}>('userV3/hideClosedPositions');
export const updateHideFarmingPositions = createAction<{
  userHideFarmingPositions: boolean;
}>('userV3/hideFarmingPositions');
export const updateUserSlippageTolerance = createAction<{
  userSlippageTolerance: number | 'auto';
}>('userV3/updateUserSlippageTolerance');
export const updateUserDeadline = createAction<{ userDeadline: number }>(
  'userV3/updateUserDeadline',
);
export const addSerializedToken = createAction<{
  serializedToken: SerializedToken;
}>('userV3/addSerializedToken');
export const removeSerializedToken = createAction<{
  chainId: number;
  address: string;
}>('userV3/removeSerializedToken');
export const addSerializedPair = createAction<{
  serializedPair: SerializedPair;
}>('userV3/addSerializedPair');
export const removeSerializedPair = createAction<{
  chainId: number;
  tokenAAddress: string;
  tokenBAddress: string;
}>('userV3/removeSerializedPair');
export const toggleOntoWrongChainModal = createAction<{ toggled: boolean }>(
  'userV3/toggleOntoWrongChainModal',
);
