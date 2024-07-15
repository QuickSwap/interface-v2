import { createAction } from '@reduxjs/toolkit';

export const updateUserBalance = createAction<void>(
  'balance/updateUserBalance',
);
