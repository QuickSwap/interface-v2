import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './index.scss';
import { EthereumWindow } from 'models/types';
import { AlertCircle } from 'react-feather';
import Card from 'components/v3/Card/Card';
import { AutoColumn } from 'components/v3/Column';
import { SwapPoolTabs } from 'components/v3/NavigationTabs/SwapPoolTabs';
import VersionToggle from 'components/Toggle/VersionToggle';
import { Box, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import { SupplyLiquidityV3 } from './SupplyLiquidityV3';
import { MyLiquidityPoolsV3 } from './MyLiquidityPoolsV3';

export default function Pool() {
  const { account, chainId } = useActiveWeb3React();

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
            <MyLiquidityPoolsV3 />
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
