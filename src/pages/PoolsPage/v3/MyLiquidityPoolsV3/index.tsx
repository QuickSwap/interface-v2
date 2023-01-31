import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Button } from '@material-ui/core';
import { useV3Positions } from 'hooks/v3/useV3Positions';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import Loader from 'components/Loader';
import usePrevious, { usePreviousNonEmptyArray } from 'hooks/usePrevious';
import PositionList from './components/PositionList';
import FilterPanelItem from '../FilterPanelItem';
import { PositionPool } from 'models/interfaces';
import { useWalletModalToggle } from 'state/application/hooks';
import { useTranslation } from 'react-i18next';

export default function MyLiquidityPoolsV3() {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const history = useHistory();
  const [userHideClosedPositions, setUserHideClosedPositions] = useState(true);
  const [hideFarmingPositions, setHideFarmingPositions] = useState(false);
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

  const filters = [
    {
      title: t('closed'),
      method: setUserHideClosedPositions,
      checkValue: userHideClosedPositions,
    },
    {
      title: t('farming'),
      method: setHideFarmingPositions,
      checkValue: hideFarmingPositions,
    },
  ];

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

  const { pairs: allV2PairsWithLiquidity } = useV2LiquidityPools(
    account ?? undefined,
  );

  return (
    <Box>
      <p className='weight-600'>{t('myQuickSwapLP')}</p>
      {account && (
        <Box mt={2} className='flex justify-between items-center'>
          <Box className='flex'>
            {filters.map((item, key) => (
              <Box mr={1} key={key}>
                <FilterPanelItem item={item} />
              </Box>
            ))}
          </Box>
          {/* {allV2PairsWithLiquidity.length > 0 && (
            <Box
              className='v3-manage-v2liquidity-button'
              onClick={() => history.push('/migrate')}
            >
              <small className='text-primary'>Migrate V2 Liquidity</small>
            </Box>
          )} */}
        </Box>
      )}
      <Box mt={2}>
        {positionsLoading ? (
          <Box className='flex justify-center'>
            <Loader stroke='white' size={'2rem'} />
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
}
