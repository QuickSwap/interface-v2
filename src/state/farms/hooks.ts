import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'state';
import { updateV3Stake } from './actions';
import { FarmingType } from 'models/enums';

export function useV3StakeData() {
  const v3Stake = useSelector<AppState, AppState['farms']['v3Stake']>(
    (state) => state.farms.v3Stake,
  );

  const dispatch = useDispatch();
  const _updateV3Stake = useCallback(
    (v3Stake: {
      txType?: string;
      txHash?: string;
      txConfirmed?: boolean;
      selectedTokenId?: string;
      selectedFarmingType?: FarmingType | null;
      txError?: string;
    }) => {
      dispatch(updateV3Stake(v3Stake));
    },
    [dispatch],
  );

  return { v3Stake, updateV3Stake: _updateV3Stake };
}
