import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit';
import { AdsListInfo } from 'types';

export const fetchAdsList: Readonly<{
  pending: ActionCreatorWithPayload<{ url: string; requestId: string }>;
  fulfilled: ActionCreatorWithPayload<{
    url: string;
    adsList: AdsListInfo;
    requestId: string;
  }>;
  rejected: ActionCreatorWithPayload<{
    url: string;
    errorMessage: string;
    requestId: string;
  }>;
}> = {
  pending: createAction('lists/fetchAdsList/pending'),
  fulfilled: createAction('lists/fetchAdsList/fulfilled'),
  rejected: createAction('lists/fetchAdsList/rejected'),
};

export const acceptAdsUpdate = createAction<string>(
  'lists/acceptAdsListUpdate',
);
