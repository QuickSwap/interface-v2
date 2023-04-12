import { Box, Button, Menu, MenuItem } from '@material-ui/core';
import { KeyboardArrowDown } from '@material-ui/icons';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { SettingsModal, Swap, ToggleSwitch } from 'components';
import { SwapBestTrade } from 'components/Swap';
import { getConfig } from 'config';
import { useActiveWeb3React, useIsProMode } from 'hooks';
import useParsedQueryString from 'hooks/useParsedQueryString';
import useSwapRedirects from 'hooks/useSwapRedirect';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useIsV2 } from 'state/application/hooks';
import SwapCrossChain from './SwapCrossChain';
import SwapLimitOrder from './SwapLimitOrder';
import SwapV3Page from './V3/Swap';

const SWAP_BEST_TRADE = 0;
const SWAP_NORMAL = 1;
const SWAP_V3 = 2;
const SWAP_LIMIT = 3;
const SWAP_CROSS_CHAIN = 4;

const SwapMain: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const parsedQs = useParsedQueryString();
  const swapType = parsedQs.swapIndex;
  const isProMode = useIsProMode();
  const history = useHistory();
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
    if (showLimitOrder) {
      tabs.push({ name: 'limit', key: SWAP_LIMIT });
    }
    if (showCrossChain) {
      tabs.push({
        name: 'crossChain',
        key: SWAP_CROSS_CHAIN,
        visible: false,
      });
    }
    return tabs;
  }, [showBestTrade, showLimitOrder, v2, v3, showCrossChain]);

  const dropDownMenuText = useMemo(() => {
    if (!swapType) return;
    const dropdownTab = SwapDropdownTabs.find(
      (item) =>
        item.key ===
        (Number(swapType) === SWAP_CROSS_CHAIN ? 0 : Number(swapType)),
    );
    if (!dropdownTab) return;
    return dropdownTab.name;
  }, [SwapDropdownTabs, swapType]);

  const [selectedIndex, setSelectedIndex] = React.useState(
    parseInt(swapType?.toString() || '0', 0),
  );

  const redirectWithSwapType = (swapTypeTo: number) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath = '';
    if (swapType) {
      redirectPath = currentPath.replace(
        `swapIndex=${swapType}`,
        `swapIndex=${swapTypeTo}`,
      );
    } else {
      redirectPath = `${currentPath}${
        Object.values(parsedQs).length > 0 ? '&' : '?'
      }swapIndex=${swapTypeTo}`;
    }
    history.push(redirectPath);
  };

  const swapTabClass = (currentSwapType: number) => {
    return `${
      swapType === currentSwapType.toString() ? 'activeSwap' : ''
    } swapItem headingItem
    `;
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setSelectedIndex(index);
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
      (Number(swapType) === SWAP_LIMIT && !showLimitOrder)
    ) {
      const availableSwapTypes = [
        SWAP_BEST_TRADE,
        SWAP_NORMAL,
        SWAP_V3,
        SWAP_LIMIT,
      ].filter((sType) =>
        sType === SWAP_BEST_TRADE
          ? showBestTrade
          : sType === SWAP_NORMAL
          ? v2
          : sType === SWAP_V3
          ? v3
          : showLimitOrder,
      );
      if (availableSwapTypes.length > 0) {
        const aSwapType = availableSwapTypes[0];
        if (aSwapType === SWAP_V3) {
          updateIsV2(false);
        } else {
          updateIsV2(true);
        }
        redirectWithSwapType(availableSwapTypes[0]);
      } else {
        history.push('/');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapType, v2, v3, showBestTrade, showLimitOrder]);

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

  return (
    <>
      {openSettingsModal && (
        <SettingsModal
          open={openSettingsModal}
          onClose={() => setOpenSettingsModal(false)}
        />
      )}
      <Box
        className={`flex flex-wrap items-center justify-between ${
          isProMode ? ' proModeWrapper' : ''
        }`}
      >
        <Box display='flex' width={1}>
          {!isProMode ? (
            <>
              {dropDownMenuText && (
                <Button
                  id='swap-button'
                  aria-controls={open ? 'swap-menu' : undefined}
                  aria-haspopup='true'
                  aria-expanded={open ? 'true' : undefined}
                  variant='text'
                  style={{ background: 'transparent' }}
                  disableElevation
                  onClick={handleClickListItem}
                  endIcon={<KeyboardArrowDown />}
                >
                  {t(dropDownMenuText)}
                </Button>
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
                      key={option.key}
                      disabled={option.key === selectedIndex}
                      selected={option.key === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {t(option.name)}
                    </MenuItem>
                  ),
                )}
              </Menu>
              {showCrossChain && (
                <Box
                  className={swapTabClass(SWAP_CROSS_CHAIN)}
                  onClick={() => {
                    setSelectedIndex(SWAP_CROSS_CHAIN);
                    setAnchorEl(null);
                    redirectWithSwapType(SWAP_CROSS_CHAIN);
                  }}
                >
                  <p>{t('crossChain')}</p>
                </Box>
              )}
            </>
          ) : (
            <>
              {SwapDropdownTabs.map((option, index) => (
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
          {
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
                <Box className='headingItem'>
                  <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
                </Box>
              </Box>
            </Box>
          }
        </Box>
      </Box>
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
        {showLimitOrder && Number(swapType) === SWAP_LIMIT && (
          <SwapLimitOrder />
        )}
      </Box>
    </>
  );
};

export default SwapMain;
