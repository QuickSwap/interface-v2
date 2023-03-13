import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { CNTFarmListInfo } from 'types';

export const fetchCNTFarmList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>;
  fulfilled: ActionCreatorWithPayload<{
    url: string;
    farmList: CNTFarmListInfo;
    requestId: string;
  }>;
  rejected: ActionCreatorWithPayload<{
    url: string;
    errorMessage: string;
    requestId: string;
  }>;
}> = {
  pending: createAction('lists/fetchCNTFarmList/pending'),
  fulfilled: createAction('lists/fetchCNTFarmList/fulfilled'),
  rejected: createAction('lists/fetchCNTFarmList/rejected'),
};

export const acceptCNTFarmUpdate = createAction<string>(
  'lists/acceptCNTFarmUpdate',
);
