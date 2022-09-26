import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { OtherFarmListInfo } from 'types';

export const fetchOtherFarmList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>;
  fulfilled: ActionCreatorWithPayload<{
    url: string;
    farmList: OtherFarmListInfo;
    requestId: string;
  }>;
  rejected: ActionCreatorWithPayload<{
    url: string;
    errorMessage: string;
    requestId: string;
  }>;
}> = {
  pending: createAction('lists/fetchOtherFarmList/pending'),
  fulfilled: createAction('lists/fetchOtherFarmList/fulfilled'),
  rejected: createAction('lists/fetchOtherFarmList/rejected'),
};

export const acceptFarmUpdate = createAction<string>(
  'lists/acceptOtherFarmListUpdate',
);
