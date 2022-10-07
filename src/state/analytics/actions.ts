import { createAction } from '@reduxjs/toolkit';

export const setAnalyticsLoaded = createAction<boolean>(
  'analytics/setAnalyticsLoaded',
);
