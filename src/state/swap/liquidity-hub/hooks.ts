import { useAppSelector } from 'state/hooks';
import { AppState, useAppDispatch } from 'state';
import { resetLiquidityHubState, setLiquidityHubState } from './actions';
import { LiquidityHubState } from './reducer';
import { useCallback } from 'react';

export function useLiquidityHubState(): AppState['liquidityHub'] {
  return useAppSelector((state) => {
    return state.liquidityHub;
  });
}

export const useLiquidityHubActionHandlers = () => {
  const dispatch = useAppDispatch();

  const onSetLiquidityHubState = useCallback(
    (payload: Partial<LiquidityHubState>) => {
      dispatch(setLiquidityHubState(payload));
    },
    [dispatch],
  );

  const onResetLiquidityHubState = useCallback(() => {
    dispatch(resetLiquidityHubState());
  }, [dispatch]);

  return {
    onSetLiquidityHubState,
    onResetLiquidityHubState,
  };
};
