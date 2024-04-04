import { createAction } from '@reduxjs/toolkit';
import { FarmingType } from 'models/enums';

export const updateV3Stake = createAction<{
  txType?: string;
  txHash?: string;
  txConfirmed?: boolean;
  selectedTokenId?: string;
  selectedFarmingType?: FarmingType | null;
  txError?: string;
}>('farms/updateV3Stake');
