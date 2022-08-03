import { createAction } from '@reduxjs/toolkit';

export const toggleAnalyticsVersion = createAction(
  'analytics/toggleAnalyticsVersion',
);

export const setAnalyticsLoaded = createAction<boolean>(
  'analytics/setAnalyticsLoaded',
);
