import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useV3Positions } from 'hooks/v3/useV3Positions';
import { useActiveWeb3React } from 'hooks';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { useWalletModalToggle } from 'state/application/hooks';
import { Helmet } from 'react-helmet';
import Loader from '../../components/Loader';
import FilterPanelItem from './FilterPanelItem';
import { PositionPool } from '../../models/interfaces';
import './index.scss';
import usePrevious, { usePreviousNonEmptyArray } from '../../hooks/usePrevious';
import { EthereumWindow } from 'models/types';
import { useShowNewestPosition } from 'state/mint/v3/hooks';
import { AlertCircle } from 'react-feather';
import Card from 'components/v3/Card/Card';
import { AutoColumn } from 'components/v3/Column';
import { SwapPoolTabs } from 'components/v3/NavigationTabs/SwapPoolTabs';
import PositionList from 'components/v3/PositionList';
import VersionToggle from 'components/Toggle/VersionToggle';
import { Box, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { SupplyLiquidityV3 } from './SupplyLiquidityV3';

export default function Pool() {
  const [userHideClosedPositions, setUserHideClosedPositions] = useState(false);
  const [hideFarmingPositions, setHideFarmingPositions] = useState(false);
  const { account, chainId } = useActiveWeb3React();
  const toggleWalletModal = useWalletModalToggle();
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
      title: `Closed`,
      method: setUserHideClosedPositions,
      checkValue: userHideClosedPositions,
    },
    {
      title: `Farming`,
      method: setHideFarmingPositions,
      checkValue: hideFarmingPositions,
    },
  ];

  const farmingPositions = useMemo(
    () => positions?.filter((el) => el.onFarming),
    [positions, account, prevAccount],
  );
  const inRangeWithOutFarmingPositions = useMemo(
    () => openPositions.filter((el) => !el.onFarming),
    [openPositions, account, prevAccount],
  );

  const filteredPositions = useMemo(
    () => [
      ...(hideFarmingPositions || !farmingPositions ? [] : farmingPositions),
      ...inRangeWithOutFarmingPositions,
      ...(userHideClosedPositions ? [] : closedPositions),
    ],
    [
      inRangeWithOutFarmingPositions,
      userHideClosedPositions,
      hideFarmingPositions,
      account,
      prevAccount,
    ],
  );

  const prevFilteredPositions = usePreviousNonEmptyArray(filteredPositions);

  const _filteredPositions = useMemo(() => {
    if (account !== prevAccount) return filteredPositions;

    if (filteredPositions.length === 0 && prevFilteredPositions) {
      return prevFilteredPositions;
    }
    return filteredPositions;
  }, [filteredPositions, account, prevAccount]);

  const showNewestPosition = useShowNewestPosition();

  const newestPosition = useMemo(() => {
    return Math.max(..._filteredPositions.map((position) => +position.tokenId));
  }, [showNewestPosition, _filteredPositions]);

  const showConnectAWallet = Boolean(!account);

  let chainSymbol;

  if (chainId === 137) {
    chainSymbol = 'MATIC';
  }

  const reload = useCallback(() => window.location.reload(), []);

  useEffect(() => {
    const _window = window as EthereumWindow;

    if (!_window.ethereum) return;

    _window.ethereum.on('accountsChanged', reload);
    return () => _window.ethereum.removeListener('accountsChanged', reload);
  }, []);

  const { t } = useTranslation();
  const history = useHistory();
  const handleToggleAction = useCallback(
    (isV3: boolean) => {
      const url = isV3 ? '/v3Pools' : '/pools';
      history.push(url);
    },
    [history],
  );

  return (
    <>
      <Box width='100%' mb={3}>
        <Box className='pageHeading'>
          <Box className='flex row items-center'>
            <h4>{t('pool')}</h4>
            <VersionToggle isV3={true} onToggleV3={handleToggleAction} />
          </Box>

          <Box className='helpWrapper' style={{ alignSelf: 'flex-end' }}>
            <small>{t('help')}</small>
            <HelpIcon />
          </Box>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={5}>
            <Box className='wrapper'>
              <SupplyLiquidityV3 />
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={7}>
            <Box className='wrapper'>
              <AutoColumn gap='1'>
                <div className={'pool__header flex-s-between'}>
                  <span className={'fs-125'}>Pools Overview</span>
                  <div className={'flex-s-between mxs_mv-05'}>
                    <NavLink
                      className={'btn primary p-05 br-8 mr-1'}
                      id='join-pool-button'
                      to={`/migrate`}
                    >
                      Migrate Pool
                    </NavLink>
                    <NavLink
                      className={'btn primary p-05 br-8'}
                      id='join-pool-button'
                      to={`/add`}
                    >
                      + New Position
                    </NavLink>
                  </div>
                </div>
                {account && (
                  <div className={'f mb-05 rg-2 cg-2 mxs_f-jc'}>
                    {filters.map((item, key) => (
                      <FilterPanelItem item={item} key={key} />
                    ))}
                  </div>
                )}
                <main className={'f c f-ac'}>
                  {positionsLoading ? (
                    <Loader
                      style={{ margin: 'auto' }}
                      stroke='white'
                      size={'2rem'}
                    />
                  ) : _filteredPositions && _filteredPositions.length > 0 ? (
                    <PositionList
                      positions={_filteredPositions.sort((posA, posB) =>
                        Number(+posA.tokenId < +posB.tokenId),
                      )}
                      newestPosition={newestPosition}
                    />
                  ) : (
                    <div className={'f c f-ac f-jc h-400 w-100 maw-300'}>
                      You do not have any liquidity positions.
                      {showConnectAWallet && (
                        <button
                          className={'btn primary pv-05 ph-1 mt-1 w-100'}
                          onClick={toggleWalletModal}
                        >
                          Connect Wallet
                        </button>
                      )}
                    </div>
                  )}
                </main>
              </AutoColumn>
            </Box>
          </Grid>
        </Grid>
        {/* <Card classes={'br-24 ph-2 pv-1 mxs_ph-1 w-100'}>
          <SwapPoolTabs active={'pool'} />
          <AutoColumn gap='1'>
            <div className={'pool__header flex-s-between'}>
              <span className={'fs-125'}>Pools Overview</span>
              <div className={'flex-s-between mxs_mv-05'}>
                <NavLink
                  className={'btn primary p-05 br-8 mr-1'}
                  id='join-pool-button'
                  to={`/migrate`}
                >
                  Migrate Pool
                </NavLink>
                <NavLink
                  className={'btn primary p-05 br-8'}
                  id='join-pool-button'
                  to={`/add`}
                >
                  + New Position
                </NavLink>
              </div>
            </div>
            {account && (
              <div className={'f mb-05 rg-2 cg-2 mxs_f-jc'}>
                {filters.map((item, key) => (
                  <FilterPanelItem item={item} key={key} />
                ))}
              </div>
            )}
            <main className={'f c f-ac'}>
              {positionsLoading ? (
                <Loader
                  style={{ margin: 'auto' }}
                  stroke='white'
                  size={'2rem'}
                />
              ) : _filteredPositions && _filteredPositions.length > 0 ? (
                <PositionList
                  positions={_filteredPositions.sort((posA, posB) =>
                    Number(+posA.tokenId < +posB.tokenId),
                  )}
                  newestPosition={newestPosition}
                />
              ) : (
                <div className={'f c f-ac f-jc h-400 w-100 maw-300'}>
                  You do not have any liquidity positions.
                  {showConnectAWallet && (
                    <button
                      className={'btn primary pv-05 ph-1 mt-1 w-100'}
                      onClick={toggleWalletModal}
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>
              )}
            </main>
          </AutoColumn>
        </Card> */}
      </Box>
    </>
  );
}
