import {
  Box,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { KeyboardArrowDown } from '@material-ui/icons';
import { ReactComponent as SettingsIcon } from 'assets/images/icons/cog-fill.svg';
import { SettingsModal } from 'components';
import { SwapBestTrade } from 'components/Swap';
import { getConfig } from 'config/index';
import { useActiveWeb3React } from 'hooks';
import useParsedQueryString from 'hooks/useParsedQueryString';
import useSwapRedirects from 'hooks/useSwapRedirect';
import React, { lazy, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useIsV2 } from 'state/application/hooks';
import { useUserSlippageTolerance } from 'state/user/hooks';
import '../styles/swap-main.scss';

const SwapTwap = lazy(() => import('components/Swap/orbs/Twap/Twap'));

const SwapV3Page = lazy(() => import('./V3/Swap'));
const Swap = lazy(() =>
  import('components').then((module) => ({ default: module.Swap })),
);
const SwapCrossChain = lazy(() => import('./SwapCrossChain'));

const SWAP_BEST_TRADE = 0;
const SWAP_NORMAL = 1;
const SWAP_V3 = 2;
const SWAP_LIMIT = 3;
const SWAP_TWAP = 4;
const SWAP_CROSS_CHAIN = 5;

const SwapMain: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const parsedQs = useParsedQueryString();
  const swapType = parsedQs.swapIndex;
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
  const showTwapOrder = config['swap']['twapOrder'];
  const showCrossChain = config['swap']['crossChain'];

  const [
    userSlippageTolerance,
    setUserslippageTolerance,
  ] = useUserSlippageTolerance();

  const SwapDropdownTabs = useMemo(() => {
    const tabs: any[] = [];
    if (showBestTrade) {
      tabs.push({
        name: 'bestTrade',
        key: SWAP_BEST_TRADE,
        tooltipContent: 'bestTradeTooltip',
      });
    }
    if (v2) {
      tabs.push({ name: 'marketV2', key: SWAP_NORMAL });
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
  console.log('🚀 ~ dropDownMenuText ~ dropDownMenuText:', dropDownMenuText);

  const [selectedIndex, setSelectedIndex] = React.useState(
    Number(swapType?.toString() ?? '0'),
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
    setSelectedIndex(swapTypeTo);
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
        history.push('/');
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
    const tabs: any[] = [];
    if (v2 || v3 || showBestTrade) {
      tabs.push({ id: 'market', text: 'Market' });
    }
    if (showLimitOrder) {
      tabs.push({ id: SWAP_LIMIT.toString(), text: 'Limit' });
    }
    if (showCrossChain) {
      tabs.push({ id: SWAP_CROSS_CHAIN.toString(), text: 'Cross-chain' });
    }
    if (showTwapOrder) {
      tabs.push({ id: SWAP_TWAP.toString(), text: 'TWAP' });
    }
    return tabs;
  }, [v2, v3, showBestTrade, showCrossChain, showLimitOrder, showTwapOrder]);

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
          defaultSlippage={userSlippageTolerance}
        />
      )}
      {/* Header */}
      <Box display={'flex'} mb={2}>
        <Box my={'auto'}>
          <Typography variant='h6'>{t('swap')}</Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gridGap: '20px',
        }}
      >
        {swapTabs.length > 0 && (
          <Box
            // margin={isProMode ? '28px 0' : '28px 0 0'}
            className='swapLimitTabs'
            sx={{ width: '100%' }}
            borderRadius={10}
          >
            {swapTabs.map((tab) => (
              <>
                <Box
                  className={`swapLimitTab ${
                    isActiveSwapTab(tab.id) ? 'activeSwapLimitTab' : ''
                  }`}
                  key={tab.id.toString()}
                  borderRadius={10}
                  onClick={() => {
                    if (tab.id === 'market') return;
                    redirectWithSwapType(Number(tab.id));
                  }}
                >
                  {tab.id === 'market' ? (
                    <>
                      {dropDownMenuText && (
                        <Button
                          id='swap-button'
                          aria-controls={open ? 'swap-menu' : undefined}
                          aria-haspopup='true'
                          aria-expanded={open ? 'true' : undefined}
                          variant='text'
                          disableElevation
                          onClick={handleClickListItem}
                          endIcon={<KeyboardArrowDown />}
                          style={{
                            fontSize: '14px',
                          }}
                          className={`tab tabMenu ${
                            selectedIndex !== SWAP_CROSS_CHAIN
                              ? 'activeTab'
                              : ''
                          }`}
                        >
                          {t(dropDownMenuText)}
                          {dropDownMenuText === 'bestTrade' && (
                            <Tooltip
                              style={{ margin: '0 4px' }}
                              title={
                                <Box
                                  sx={{
                                    padding: '16px',
                                    fontSize: '12px',
                                    color: '#c7cad9',
                                    bgcolor: '#0000003d',
                                    border:
                                      'solid 1px rgba(255, 255, 255, 0.04)',
                                    boxShadow: '0 0 16px 0 rgba(0, 0, 0, 0.24)',
                                    borderRadius: '12px',
                                  }}
                                  style={{ backdropFilter: 'blur(40px)' }}
                                >
                                  {t('bestTradeTooltip')}
                                </Box>
                              }
                            >
                              <img
                                src='/info.svg'
                                alt='question'
                                width={12}
                                height={12}
                              />
                            </Tooltip>
                          )}
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
                        {SwapDropdownTabs.filter(
                          (d) => d.visible !== false,
                        ).map((option, index) => (
                          <MenuItem
                            className={`swap-menu-item ${
                              option.key === selectedIndex
                                ? 'swap-menu-item-selected'
                                : ''
                            }`}
                            key={option.key}
                            disabled={option.key === selectedIndex}
                            selected={option.key === selectedIndex}
                            onClick={(event) =>
                              handleMenuItemClick(event, index)
                            }
                          >
                            {t(option.name)}

                            {option.key === selectedIndex && (
                              <Box ml={5} className='selectedMenuDot' />
                            )}
                          </MenuItem>
                        ))}
                      </Menu>
                    </>
                  ) : (
                    <small>{tab.text}</small>
                  )}
                </Box>
              </>
            ))}
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '32px',
            borderRadius: '50%',
            bgcolor: '#1e263d',
          }}
          className='flex items-center'
        >
          {/* <SlippageWrapper /> */}
          <SettingsIcon
            className='cursor-pointer'
            onClick={() => setOpenSettingsModal(true)}
          />
        </Box>
      </Box>
      {/* Widget Body */}
      <Box pt={3.5}>
        {showBestTrade && Number(swapType) === SWAP_BEST_TRADE && (
          <SwapBestTrade />
        )}
        {v2 && Number(swapType) === SWAP_NORMAL && <Swap />}
        {v3 && Number(swapType) === SWAP_V3 && <SwapV3Page />}
        {showCrossChain && Number(swapType) === SWAP_CROSS_CHAIN && (
          <SwapCrossChain />
        )}
        {showLimitOrder &&
          (Number(swapType) === SWAP_LIMIT ||
            Number(swapType) === SWAP_TWAP) && <SwapTwap />}
      </Box>
    </>
  );
};

export default SwapMain;
