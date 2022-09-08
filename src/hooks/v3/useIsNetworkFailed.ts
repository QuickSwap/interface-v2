import React from 'react';
import { useActiveWeb3React } from 'hooks';
import { useState } from 'react';
import useInterval from 'hooks/useInterval';
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp';

const DEFAULT_MS_BEFORE_WARNING = 300_000;
const NETWORK_HEALTH_CHECK_MS = 10_000;

const useMachineTimeMs = (updateInterval: number): number => {
  const [now, setNow] = useState(Date.now());

  useInterval(() => {
    setNow(Date.now());
  }, updateInterval);
  return now;
};

export function useIsNetworkFailed() {
  const machineTime = useMachineTimeMs(NETWORK_HEALTH_CHECK_MS);
  const blockTime = useCurrentBlockTimestamp();

  const warning = Boolean(
    !!blockTime &&
      machineTime - blockTime.mul(1000).toNumber() > DEFAULT_MS_BEFORE_WARNING,
  );

  return warning;
}

export function useIsNetworkFailedImmediate() {
  const machineTime = useMachineTimeMs(1000);
  const blockTime = useCurrentBlockTimestamp();

  const warning = Boolean(
    !!blockTime && machineTime - blockTime.mul(1000).toNumber(),
  );

  return !warning;
}
