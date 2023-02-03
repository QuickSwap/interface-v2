import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, Menu } from '@material-ui/core';
import { ReactComponent as SettingsIcon } from 'assets/images/SettingsIcon.svg';
import { useIsProMode, useIsV2 } from 'state/application/hooks';
import { Swap, SettingsModal, ToggleSwitch } from 'components';
import {
  GelatoLimitOrderPanel,
  GelatoLimitOrdersHistoryPanel,
} from '@gelatonetwork/limit-orders-react';
import { Trans, useTranslation } from 'react-i18next';
import { SwapBestTrade } from 'components/Swap';
import SwapV3Page from './V3/Swap';
import { useHistory, useParams } from 'react-router-dom';
import useParsedQueryString from 'hooks/useParsedQueryString';
import SwapCrossChain from './SwapCrossChain';

const SWAP_BEST_TRADE = '0';
const SWAP_NORMAL = '1';
const SWAP_V3 = '2';
const SWAP_LIMIT = '3';
const SWAP_CROSS_CHAIN = '4';

const SwapDropdownTabs = [
  { name: 'bestTrade', key: SWAP_BEST_TRADE },
  { name: 'market', key: SWAP_NORMAL },
  { name: 'marketV3', key: SWAP_V3 },
];

const SwapOtherTabs = [
  { name: 'bestTrade', subTitle: 'Comming Soon!', key: SWAP_CROSS_CHAIN },
  { name: 'limit', key: SWAP_LIMIT },
];

const SwapMain: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const parsedQs = useParsedQueryString();
  const swapType = parsedQs.swapIndex;
  const history = useHistory();
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const { isProMode, updateIsProMode } = useIsProMode();

  const { updateIsV2 } = useIsV2();
  const params: any = useParams();
  const isOnV3 = params ? params.version === 'v3' : false;
  const isOnV2 = params ? params.version === 'v2' : false;

  const { t } = useTranslation();

  const redirectWithSwapType = (swapTypeTo: string) => {
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

  const swapTabClass = (currentSwapType: string) => {
    return `${
      swapType === currentSwapType ? 'activeSwap' : ''
    } swapItem headingItem
    `;
  };

  useEffect(() => {
    updateIsV2(!isOnV2 && !isOnV3 ? true : isOnV2);
    if (!swapType) {
      if (!isOnV3 && isOnV2) {
        redirectWithSwapType(SWAP_NORMAL);
      } else {
        redirectWithSwapType(SWAP_BEST_TRADE);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnV3, isOnV2, swapType]);

  useEffect(() => {
    if (swapType) {
      if (swapType === SWAP_V3) {
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
          <List component='nav' aria-label='Swap Selection'>
            <ListItem button id='swap-menu'></ListItem>
          </List>
          <Menu id='swap-menu' open={false}></Menu>
          <Box
            //TODO: Active class resolution should come from from a func
            className={swapTabClass(SWAP_BEST_TRADE)}
            onClick={() => {
              redirectWithSwapType(SWAP_BEST_TRADE);
            }}
          >
            <p>{t('bestTrade')}</p>
          </Box>
          <Box
            className={swapTabClass(SWAP_NORMAL)}
            onClick={() => {
              redirectWithSwapType(SWAP_NORMAL);
            }}
          >
            <p>{t('market')}</p>
          </Box>
          <Box
            className={swapTabClass(SWAP_V3)}
            onClick={() => {
              redirectWithSwapType(SWAP_V3);
            }}
          >
            <p>{t('marketV3')}</p>
          </Box>
          <Box
            className={swapTabClass(SWAP_CROSS_CHAIN)}
            onClick={() => {
              redirectWithSwapType(SWAP_CROSS_CHAIN);
            }}
          >
            <p>{t('crossChain2')}</p>
          </Box>
          <Box
            className={swapTabClass(SWAP_LIMIT)}
            onClick={() => {
              redirectWithSwapType(SWAP_LIMIT);
            }}
          >
            <p>{t('limit')}</p>
          </Box>
          {
            <Box
              style={{
                marginLeft: 'auto',
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              <Box margin='0 16px' className='flex items-center'>
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
                      updateIsProMode(!isProMode);
                    }}
                  />
                </Box>
                <Box className='headingItem'>
                  <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
                </Box>
              </Box>
            </Box>
          }
        </Box>
        {/* {!isProMode && (
          <Box margin='8px 16px 0' className='flex items-center'>
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
                  updateIsProMode(true);
                }}
              />
            </Box>
            <Box className='headingItem'>
              <SettingsIcon onClick={() => setOpenSettingsModal(true)} />
            </Box>
          </Box>
        )} */}
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
        {swapType === SWAP_BEST_TRADE && <SwapBestTrade />}
        {swapType === SWAP_NORMAL && <Swap />}
        {swapType === SWAP_V3 && <SwapV3Page />}
        {swapType === SWAP_CROSS_CHAIN && <SwapCrossChain />}
        {swapType === SWAP_LIMIT && (
          <Box className='limitOrderPanel'>
            <GelatoLimitOrderPanel />
            <GelatoLimitOrdersHistoryPanel />
            <Box mt={2} textAlign='center'>
              <small>
                <Trans
                  i18nKey='limitOrderDisclaimer'
                  components={{
                    bold: <b />,
                    alink: (
                      <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href='https://www.certik.org/projects/gelato'
                      />
                    ),
                  }}
                />
              </small>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default SwapMain;
