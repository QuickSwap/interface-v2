import React, { useMemo } from 'react';
import { Box, Button } from '@material-ui/core';
import { useV3Positions } from 'hooks/v3/useV3Positions';
import { useActiveWeb3React } from 'hooks';
import Loader from 'components/Loader';
import PositionList from './components/PositionList';
import { PositionPool } from 'models/interfaces';
import { useTranslation } from 'react-i18next';
import { useWeb3Modal } from '@web3modal/ethers5/react';

const MyQuickswapPoolsV3: React.FC<{
  hideFarmingPositions: boolean;
  userHideClosedPositions: boolean;
}> = ({ hideFarmingPositions, userHideClosedPositions }) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const { positions, loading: positionsLoading } = useV3Positions(
    account,
    userHideClosedPositions,
    hideFarmingPositions,
  );

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

  const newestPosition = useMemo(() => {
    return Math.max(...filteredPositions.map((position) => +position.tokenId));
  }, [filteredPositions]);

  const showConnectAWallet = Boolean(!account);

  const { open } = useWeb3Modal();

  return (
    <Box>
      <Box mt={2}>
        {positionsLoading ? (
          <Box className='flex justify-center'>
            <Loader stroke='white' size={'2rem'} />
          </Box>
        ) : filteredPositions && filteredPositions.length > 0 ? (
          <PositionList
            positions={filteredPositions.sort((posA, posB) =>
              Number(+posA.tokenId < +posB.tokenId),
            )}
            newestPosition={newestPosition}
          />
        ) : (
          <Box textAlign='center'>
            <p>{t('noLiquidityPositions')}.</p>
            {showConnectAWallet && (
              <Box maxWidth={250} margin='20px auto 0'>
                <Button fullWidth onClick={() => open()}>
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
