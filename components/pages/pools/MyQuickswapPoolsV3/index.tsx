import React, { useMemo } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { useV3Positions } from 'hooks/v3/useV3Positions';
import { useActiveWeb3React } from 'hooks';
import usePrevious, { usePreviousNonEmptyArray } from 'hooks/usePrevious';
import PositionList from './PositionList';
import { PositionPool } from 'models/interfaces';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';

const MyQuickswapPoolsV3: React.FC<{
  hideFarmingPositions: boolean;
  userHideClosedPositions: boolean;
}> = ({ hideFarmingPositions, userHideClosedPositions }) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const { positions, loading: positionsLoading } = useV3Positions(account);
  const prevAccount = usePrevious(account);

  const [openPositions, closedPositions] = positions?.reduce<
    [PositionPool[], PositionPool[]]
  >(
    (acc, p) => {
      acc[p.liquidity?.isZero() ? 1 : 0].push(p);
      return acc;
    },
    [[], []],
  ) ?? [[], []];

  const farmingPositions = useMemo(
    () => positions?.filter((el) => el.onFarming),
    [positions],
  );
  const inRangeWithOutFarmingPositions = useMemo(
    () => openPositions.filter((el) => !el.onFarming),
    [openPositions],
  );

  const filteredPositions = useMemo(
    () => [
      ...(hideFarmingPositions || !farmingPositions ? [] : farmingPositions),
      ...inRangeWithOutFarmingPositions,
      ...(userHideClosedPositions ? [] : closedPositions),
    ],
    [
      hideFarmingPositions,
      farmingPositions,
      inRangeWithOutFarmingPositions,
      userHideClosedPositions,
      closedPositions,
    ],
  );

  const prevFilteredPositions = usePreviousNonEmptyArray(filteredPositions);
  const _filteredPositions = useMemo(() => {
    if (account !== prevAccount) return filteredPositions;

    if (filteredPositions.length === 0 && prevFilteredPositions) {
      return prevFilteredPositions;
    }
    return filteredPositions;
  }, [prevFilteredPositions, filteredPositions, account, prevAccount]);

  const newestPosition = useMemo(() => {
    return Math.max(..._filteredPositions.map((position) => +position.tokenId));
  }, [_filteredPositions]);

  const showConnectAWallet = Boolean(!account);

  const toggleWalletModal = useWalletModalToggle();

  return (
    <Box>
      <Box mt={2}>
        {positionsLoading ? (
          <Box className='flex justify-center'>
            <CircularProgress size={'2rem'} />
          </Box>
        ) : _filteredPositions && _filteredPositions.length > 0 ? (
          <PositionList
            positions={_filteredPositions.sort((posA, posB) =>
              Number(+posA.tokenId < +posB.tokenId),
            )}
            newestPosition={newestPosition}
          />
        ) : (
          <Box textAlign='center'>
            <p>{t('noLiquidityPositions')}.</p>
            {showConnectAWallet && (
              <Box maxWidth={250} margin='20px auto 0'>
                <Button fullWidth onClick={toggleWalletModal}>
                  {t('connectWallet')}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MyQuickswapPoolsV3;
