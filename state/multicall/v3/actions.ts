import { createAction } from '@reduxjs/toolkit';
import { Call } from './utils';

export interface V3ListenerOptions {
  // how often this data should be fetched, by default 1
  readonly blocksPerFetch: number;
}

export const addV3MulticallListeners = createAction<{
  chainId: number;
  calls: Call[];
  options: V3ListenerOptions;
}>('multicallV3/addMulticallListeners');
export const removeV3MulticallListeners = createAction<{
  chainId: number;
  calls: Call[];
  options: V3ListenerOptions;
}>('multicallV3/removeMulticallListeners');
export const fetchingV3MulticallResults = createAction<{
  chainId: number;
  calls: Call[];
  fetchingBlockNumber: number;
}>('multicallV3/fetchingMulticallResults');
export const errorFetchingV3MulticallResults = createAction<{
  chainId: number;
  calls: Call[];
  fetchingBlockNumber: number;
}>('multicallV3/errorFetchingMulticallResults');
export const updateV3MulticallResults = createAction<{
  chainId: number;
  blockNumber: number;
  results: {
    [callKey: string]: string | null;
  };
}>('multicallV3/updateMulticallResults');
