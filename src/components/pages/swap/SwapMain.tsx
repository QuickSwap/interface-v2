import { Box, Menu, MenuItem } from '@mui/material';
import { KeyboardArrowDown, Settings } from '@mui/icons-material';
import { SettingsModal, Swap, ToggleSwitch } from 'components';
import { SwapBestTrade } from 'components/Swap';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { getConfig } from 'config/index';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import useSwapRedirects from 'hooks/useSwapRedirect';
import React, { useEffect, useMemo, useState } from 'react';
import { useIsV2 } from 'state/application/hooks';
import { Limit, TWAP } from './LimitAndTWAP/LimitAndTWAP';
import SwapCrossChain from './SwapCrossChain';
import SwapV3Page from './SwapV3';
import styles from 'styles/pages/Swap.module.scss';

const SWAP_BEST_TRADE = 0;
const SWAP_NORMAL = 1;
const SWAP_V3 = 2;
const SWAP_LIMIT = 3;
const SWAP_TWAP = 4;
const SWAP_CROSS_CHAIN = 5;

const SwapMain: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const router = useRouter();
  const swapType = router.query.swapIndex
    ? (router.query.swapIndex as string)
    : undefined;
  const isProMode = useIsProMode();
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { chainId } = useActiveWeb3React();

  const { updateIsV2 } = useIsV2();
  const { redirectWithProMode } = useSwapRedirects();

  const { t } = useTranslation();
  const config = getConfig(chainId);
  const v2 = config['v2'];
  const v3 = config['v3'];
  const showBestTrade = config['swap']['bestTrade'];
  const showLimitOrder = config['swap']['limitOrder'];
  const showTwapOrder = config['swap']['twapOrder'];
  const showCrossChain = config['swap']['crossChain'];
  const showProMode = config['swap']['proMode'];

  const SwapDropdownTabs = useMemo(() => {
    const tabs = [];
    if (showBestTrade) {
      tabs.push({ name: 'bestTrade', key: SWAP_BEST_TRADE });
    }
    if (v2) {
      tabs.push({ name: 'market', key: SWAP_NORMAL });
    }
    if (v3) {
      tabs.push({ name: 'marketV3', key: SWAP_V3 });
    }
    if (showCrossChain) {
      tabs.push({
        name: 'crossChain',
        key: SWAP_CROSS_CHAIN,
        visible: false,
      });
    }
    return tabs;
  }, [showBestTrade, v2, v3, showCrossChain]);

  const dropDownMenuText = useMemo(() => {
    if (!swapType) return;
    const dropdownTab = SwapDropdownTabs.find(
      (item) =>
        item.key ===
        (Number(swapType) === SWAP_CROSS_CHAIN ? 0 : Number(swapType)),
    );
    if (!dropdownTab) return 'bestTrade';
    return dropdownTab.name;
  }, [SwapDropdownTabs, swapType]);

  const [selectedIndex, setSelectedIndex] = React.useState(
    Number(swapType?.toString() ?? '0'),
  );

  const redirectWithSwapType = (swapTypeTo: number) => {
    let redirectPath = '';
    if (router.asPath.includes('swapIndex=')) {
      redirectPath = router.asPath.replace(
        `swapIndex=${swapType}`,
        `swapIndex=${swapTypeTo}`,
      );
    } else {
      redirectPath = `${router.asPath}${
        router.asPath.includes('?') ? '&' : '?'
      }swapIndex=${swapTypeTo}`;
    }
    setSelectedIndex(swapTypeTo);
    router.push(redirectPath);
  };

  const swapTabClass = (currentSwapType: number) => {
    return `${
      swapType === currentSwapType.toString() ? styles.activeSwap : ''
    } ${styles.swapItem} ${styles.headingItem}
    `;
  };

  const handleMenuItemClick = (
    _: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setSelectedIndex(SwapDropdownTabs[index].key);
    setAnchorEl(null);
    redirectWithSwapType(SwapDropdownTabs[index].key);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    if (
      !swapType ||
      (Number(swapType) === SWAP_BEST_TRADE && !showBestTrade) ||
      (Number(swapType) === SWAP_NORMAL && !v2) ||
      (Number(swapType) === SWAP_V3 && !v3) ||
      (Number(swapType) === SWAP_LIMIT && !showLimitOrder) ||
      (Number(swapType) === SWAP_TWAP && !showTwapOrder)
    ) {
      const availableSwapTypes = [
        SWAP_BEST_TRADE,
        SWAP_V3,
        SWAP_NORMAL,
        SWAP_LIMIT,
        SWAP_TWAP,
      ].filter((sType) =>
        sType === SWAP_BEST_TRADE
          ? showBestTrade
          : sType === SWAP_NORMAL
          ? v2
          : sType === SWAP_V3
          ? v3
          : sType === SWAP_LIMIT
          ? showLimitOrder
          : showTwapOrder,
      );

      if (availableSwapTypes.length > 0) {
        const aSwapType = availableSwapTypes[0];
        if (aSwapType === SWAP_V3) {
          updateIsV2(false);
        } else {
          updateIsV2(true);
        }
        console.log(availableSwapTypes);

        redirectWithSwapType(availableSwapTypes[0]);
      } else {
        router.push('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapType, v2, v3, showBestTrade, showLimitOrder, showTwapOrder]);

  useEffect(() => {
    if (swapType) {
      if (Number(swapType) === SWAP_V3) {
        updateIsV2(false);
      } else {
        updateIsV2(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapType]);

  const swapTabs = useMemo(() => {
    const tabs = [];
    if (showLimitOrder || showTwapOrder) {
      tabs.push({ id: 'market', text: 'Market' });
    }
    if (showLimitOrder) {
      tabs.push({ id: SWAP_LIMIT.toString(), text: 'Limit' });
    }
    if (showTwapOrder) {
      tabs.push({ id: SWAP_TWAP.toString(), text: 'TWAP' });
    }
    return tabs;
  }, [showLimitOrder, showTwapOrder]);

  const isActiveSwapTab = (tabId: string) => {
    if (tabId === 'market') {
      return (
        Number(swapType) === SWAP_BEST_TRADE ||
        Number(swapType) === SWAP_NORMAL ||
        Number(swapType) === SWAP_V3
      );
    } else {
      return Number(tabId) === Number(swapType);
    }
  };

  return (
    <>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      {/* Header */}
      <Box display={'flex'} mb={2}>
        <Box my={'auto'}>
          <h6>{t('swap')}</h6>
        </Box>
        <Box display={'flex'} ml={'auto'}>
          {showProMode && (
            <Box className='flex items-center' mr={1}>
              <span
                className='text-secondary text-uppercase'
                style={{ marginRight: 8 }}
              >
                {t('proMode')}
              </span>
              <ToggleSwitch
                toggled={isProMode}
                onToggle={() => {
                  redirectWithProMode(!isProMode);
                }}
              />
            </Box>
          )}
          <Box>
            <Settings onClick={() => setOpenSettingsModal(true)} />
          </Box>
        </Box>
      </Box>
      <Box
        className={`flex flex-wrap items-center justify-between ${
          isProMode ? styles.proModeWrapper : ''
        }`}
      >
        <Box display='flex' width={1}>
          {!isProMode ? (
            <>
              <Box display='flex' className={styles.tabContainer}>
                {dropDownMenuText && (
                  <Box
                    id='swap-button'
                    onClick={handleClickListItem}
                    className={`${styles.tab} ${styles.tabMenu} ${
                      selectedIndex !== SWAP_CROSS_CHAIN ? styles.activeTab : ''
                    }`}
                  >
                    <p>{t(dropDownMenuText)}</p>
                    <KeyboardArrowDown />
                  </Box>
                )}
                <Menu
                  id='swap-menu'
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'swap-button',
                    role: 'listbox',
                  }}
                >
                  {SwapDropdownTabs.filter((d) => d.visible !== false).map(
                    (option, index) => (
                      <MenuItem
                        className={`swap-menu-item ${
                          option.key === selectedIndex
                            ? 'swap-menu-item-selected'
                            : ''
                        }`}
                        key={option.key}
                        disabled={option.key === selectedIndex}
                        selected={option.key === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        {t(option.name)}
                        {option.key === selectedIndex && (
                          <Box ml={5} className='selectedMenuDot' />
                        )}
                      </MenuItem>
                    ),
                  )}
                </Menu>

                {showCrossChain && (
                  <Box
                    className={`${styles.tab} ${
                      selectedIndex === SWAP_CROSS_CHAIN ? styles.activeTab : ''
                    }`}
                    onClick={() => {
                      setSelectedIndex(SWAP_CROSS_CHAIN);
                      setAnchorEl(null);
                      redirectWithSwapType(SWAP_CROSS_CHAIN);
                    }}
                  >
                    <Box pr={1}>
                      <picture>
                        <img
                          src='/assets/images/crossChainIcon.svg'
                          className='cross-chain-icon'
                          style={{ scale: 1.5 }}
                          alt='CrossChain Icon'
                        />
                      </picture>
                    </Box>
                    <Box className='trade-btn'>{t('crossChain')}</Box>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <>
              {SwapDropdownTabs.map((option) => (
                <Box
                  key={option.key}
                  style={{ textAlign: 'center' }}
                  className={swapTabClass(option.key)}
                  onClick={() => {
                    redirectWithSwapType(option.key);
                  }}
                >
                  <p>{t(option.name)}</p>
                </Box>
              ))}
            </>
          )}
          {/* {
            <Box
              style={{
                marginLeft: 'auto',
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              <Box margin='0 16px' className='flex items-center'>
                {showProMode && (
                  <Box className='flex items-center' mr={1}>
                    <span
                      className='text-secondary text-uppercase'
                      style={{ marginRight: 8 }}
                    >
                      {t('proMode')}
                    </span>
                    <ToggleSwitch
                      toggled={isProMode}
                      onToggle={() => {
                        redirectWithProMode(!isProMode);
                      }}
                    />
                  </Box>
                )}
                <Box className={styles.headingItem}>
                  <Settings onClick={() => setOpenSettingsModal(true)} />
                </Box>
              </Box>
            </Box>
          } */}
        </Box>
      </Box>
      {/* Tabs */}
      {swapTabs.length > 0 && (
        <Box
          margin={isProMode ? '28px 0' : '28px 0 0'}
          className={styles.swapLimitTabs}
          borderRadius={isProMode ? 0 : 10}
        >
          {swapTabs.map((tab) => (
            <Box
              className={`${styles.swapLimitTab} ${
                isActiveSwapTab(tab.id) ? styles.activeSwapLimitTab : ''
              }`}
              key={tab.id.toString()}
              borderRadius={isProMode ? 0 : 10}
              onClick={() => {
                if (tab.id === 'market') {
                  redirectWithSwapType(SWAP_BEST_TRADE);
                } else {
                  redirectWithSwapType(Number(tab.id));
                }
              }}
            >
              <small>{tab.text}</small>
            </Box>
          ))}
        </Box>
      )}
      {/* Widget Body */}
      <Box
        style={{
          backgroundImage: isProMode
            ? 'linear-gradient(to bottom, #282d3d, #1b1e29)'
            : '',
        }}
        padding={isProMode ? '0 24px 24px' : '0'}
        pt={3.5}
      >
        {showBestTrade && Number(swapType) === SWAP_BEST_TRADE && (
          <SwapBestTrade />
        )}
        {v2 && Number(swapType) === SWAP_NORMAL && <Swap />}
        {v3 && Number(swapType) === SWAP_V3 && <SwapV3Page />}
        {showCrossChain && Number(swapType) === SWAP_CROSS_CHAIN && (
          <SwapCrossChain />
        )}
        {showLimitOrder && Number(swapType) === SWAP_LIMIT && <Limit />}
        {swapType === SWAP_TWAP.toString() && <TWAP />}
      </Box>
    </>
  );
};

export default SwapMain;
