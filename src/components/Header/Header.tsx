import React, { useEffect, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Box, Button, useMediaQuery } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import { useSwitchNetwork, useWalletInfo } from '@web3modal/ethers5/react';
import { useActiveWeb3React, useConnectWallet } from 'hooks';
import QuickIcon from 'assets/images/quickIcon.svg';
import QuickLogo from 'assets/images/quickLogo.png';
import QuickLogoWebP from 'assets/images/quickLogo.webp';
import QuickPerpsLogo from 'assets/images/quickPerpsLogo.webp';
import { ReactComponent as ThreeDotIcon } from 'assets/images/ThreeDot.svg';
import 'components/styles/Header.scss';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'config/index';
import useDeviceWidth from 'hooks/useDeviceWidth';
import { NEW_QUICK, USDC, USDO, USDT } from 'constants/v3/addresses';
import { ChainId } from '@uniswap/sdk';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { HeaderListItem, HeaderMenuItem } from './HeaderListItem';
import { HeaderDesktopItem } from './HeaderDesktopItem';
import MobileHeader from './MobileHeader';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { NetworkSelection } from './NetworkSelection';
import { OrderlyPoints } from './OrderlyPoints';
import { shortenAddress, useIsSupportedNetwork } from 'utils';
import AccountDetailsModal from 'components/AccountDetails/AccountDetailsModal';

const Header: React.FC<{ onUpdateNewsletter: (val: boolean) => void }> = ({
  onUpdateNewsletter,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { chainId, account } = useActiveWeb3React();
  const { switchNetwork } = useSwitchNetwork();
  const { walletInfo } = useWalletInfo();
  const isSupportedNetwork = useIsSupportedNetwork();
  const { connectWallet } = useConnectWallet(isSupportedNetwork);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showAccountDetailsModal, setShowAccountDetailsModal] = useState(false);

  const theme = useTheme();

  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('sm'));
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('xs'));
  const deviceWidth = useDeviceWidth();
  const [headerClass, setHeaderClass] = useState('');

  const handleShowNewsletter = (val: boolean) => {
    setShowNewsletter(val);
    onUpdateNewsletter(val);
  };

  const changeHeaderBg = () => {
    if (window.scrollY > 0) {
      setHeaderClass('bg-palette');
    } else {
      setHeaderClass('');
    }
  };

  useEffect(() => {
    changeHeaderBg();
    window.addEventListener('scroll', changeHeaderBg);
  }, []);

  const menuItemCountToShow = useMemo(() => {
    if (deviceWidth > 1580) {
      return 8;
    } else if (deviceWidth > 1500) {
      return 7;
    } else if (deviceWidth > 1320) {
      return 5;
    } else if (deviceWidth > 1190) {
      return 4;
    } else if (deviceWidth > 1100) {
      return 3;
    } else if (deviceWidth > 1020) {
      return 2;
    }
    return 1;
  }, [deviceWidth]);

  const config = getConfig(chainId);
  const showSwap = config['swap']['available'];
  const showPool = config['pools']['available'];
  const showFarm = config['farm']['available'];
  const showLair = config['lair']['available'];
  const showConvert = config['convert']['available'];
  const showAnalytics = config['analytics']['available'];
  const showLending = config['lending']['available'];
  const showDappOs = config['dappos']['available'];
  const showGamingHub = config['gamingHub']['available'];
  const showLeaderboard = config['leaderboard']['available'];
  const showPerps = config['perps']['available'];
  const showHydra = config['hydra']['available'];
  const showPerpsV2 = config['perpsV2']['available'];
  const showBonds = config['bonds']['available'];
  const showEarn = showFarm && showBonds;
  const menuItems: Array<HeaderMenuItem> = [];
  const isPerpsDropdown =
    (showPerpsV2 && showPerps) ||
    (showHydra && showPerps) ||
    (showPerpsV2 && showHydra);

  const swapCurrencyStr = useMemo(() => {
    if (!chainId) return '';
    if (chainId === ChainId.ZKTESTNET)
      return `&currency1=${USDT[chainId].address}`;
    if (chainId === ChainId.DOGECHAIN)
      return `&currency1=${USDO[chainId].address}`;
    if (NEW_QUICK[chainId]) return `&currency1=${NEW_QUICK[chainId].address}`;
    if (USDC[chainId]) return `&currency1=${USDC[chainId].address}`;
    return '';
  }, [chainId]);

  if (showSwap) {
    menuItems.push({
      link: `/swap?currency0=ETH${swapCurrencyStr}`,
      text: t('swap'),
      id: 'swap-page-link',
    });
  }

  const perpsTab: HeaderMenuItem = {
    text: t('Perps'),
    id: 'earn-tab',
    link: '/',
    items: [],
    isNew: true,
  };
  if (isPerpsDropdown) {
    menuItems.push(perpsTab);
  }
  const perpsItem = {
    link: '/perps',
    text: 'Perps V1',
    id: 'perps-page-link',
    isExternal: true,
    externalLink: process?.env?.REACT_APP_PERPS_URL || '',
    onClick: async () => {
      if (chainId !== ChainId.ZKEVM) {
        switchNetwork(ChainId.ZKEVM);
      }
      if (process.env.REACT_APP_PERPS_URL) {
        window.open(process.env.REACT_APP_PERPS_URL, '_blank');
      }
    },
  };
  const hydraItem = {
    link: '/hydra',
    text: chainId === ChainId.ZKEVM ? 'Hydra' : 'Perps',
    id: 'hydra-page-link',
    isExternal: true,
    externalLink: process?.env?.REACT_APP_HYDRA_URL || '',
    onClick: async () => {
      if (!showHydra) {
        switchNetwork(ChainId.ZKEVM);
      }
      if (process.env.REACT_APP_HYDRA_URL) {
        window.open(process.env.REACT_APP_HYDRA_URL, '_blank');
      }
    },
  };
  if (showPerpsV2) {
    if (showPerps) {
      perpsTab.items?.push({
        link: `/falkor`,
        text: 'Perps',
        id: 'perps-page-link',
      });
    } else {
      menuItems.push({
        link: `/falkor`,
        text: 'Perps',
        id: 'perps-page-link',
        isNew: true,
      });
    }
  }
  if (showHydra) {
    if (showPerps || showPerpsV2) {
      perpsTab.items?.push(hydraItem);
    } else {
      menuItems.push(hydraItem);
    }
  }
  if (showPerps) {
    if (showHydra || showPerpsV2) {
      perpsTab.items?.push(perpsItem);
    } else {
      menuItems.push(perpsItem);
    }
  }

  if (showPool) {
    menuItems.push({
      link: `/pools`,
      text: t('pool'),
      id: 'pools-page-link',
    });
  }
  const earnTab: HeaderMenuItem = {
    text: t('Earn'),
    id: 'earn-tab',
    link: '/',
    items: [],
  };

  if (showEarn) {
    menuItems.push(earnTab);
  }
  if (showFarm) {
    if (showEarn) {
      earnTab.items?.push({
        link: `/farm`,
        text: t('farm') as string,
        id: 'farm-page-link',
      });
    } else {
      menuItems.push({
        link: `/farm`,
        text: t('farm') as string,
        id: 'farm-page-link',
      });
    }
  }
  if (showBonds) {
    if (showEarn) {
      earnTab.items?.push({
        link: `/bonds`,
        text: t('bonds'),
        id: 'bonds-page-link',
      });
    } else {
      menuItems.push({
        link: `/bonds`,
        text: t('bonds'),
        id: 'bonds-page-link',
      });
    }
  }
  if (chainId === ChainId.ZKEVM) {
    menuItems.push({
      link: '/safe',
      text: 'Safe',
      id: 'safe-page-link',
      isExternal: true,
      target: '_blank',
      externalLink: process?.env?.REACT_APP_SAFE_URL || '',
      isNew: true,
    });
  }
  if (showLair) {
    menuItems.push({
      link: '/dragons',
      text: t('dragonLair'),
      id: 'dragons-page-link',
    });
  }

  if (isSupportedNetwork)
    menuItems.push({
      link: '/bridge',
      text: t('Bridge'),
      id: 'bridge-page-link',
    });

  if (showGamingHub) {
    menuItems.push({
      link: '/gamehub',
      text: 'Gaming Hub',
      id: 'gamehub-page-link',
      isExternal: true,
      target: '_top',
      externalLink: process?.env?.REACT_APP_GAMEHUB_URL || '',
    });
  }
  if (showLeaderboard) {
    menuItems.push({
      link: '/leader-board',
      text: 'Leaderboard',
      id: 'contest-page-link',
      isNew: false,
    });
  }
  if (showConvert) {
    menuItems.push({
      link: '/convert',
      text: t('convert'),
      id: 'convert-quick',
    });
  }

  if (showDappOs) {
    menuItems.push({
      link: '/dappOS',
      text: 'DappOS',
      id: 'dappos-page-link',
      isExternal: true,
      target: '_blank',
      externalLink: process?.env?.REACT_APP_DAPPOS_URL || '',
    });
  }

  if (showLending) {
    menuItems.push({
      link: '/lend',
      text: t('lend'),
      id: 'lend-page-link',
      isNew: true,
    });
  }
  if (showAnalytics) {
    menuItems.push({
      link: `/analytics`,
      text: t('analytics'),
      id: 'analytics-page-link',
    });
  }

  const parsedQuery = useParsedQueryString();
  const parsedChain =
    parsedQuery && parsedQuery.chainId
      ? Number(parsedQuery.chainId)
      : undefined;

  useEffect(() => {
    (async () => {
      if (parsedChain && chainId !== parsedChain) {
        switchNetwork(parsedChain);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, parsedChain]);

  const isPerpsPage = history.location.pathname === '/falkor';

  return (
    <Box className='header'>
      {showNewsletter && (
        <Box className='newsletterBar'>
          <small className='text-white'>{t('signupnewsletterTopDesc')}</small>
          <Button onClick={() => history.push('/newsletter')}>
            {t('signup')}
          </Button>
          <Box
            className='cursor-pointer'
            onClick={() => handleShowNewsletter(false)}
          >
            <Close />
          </Box>
        </Box>
      )}
      <Box className={`menuBar ${tabletWindowSize ? '' : headerClass}`}>
        <AccountDetailsModal
          open={showAccountDetailsModal}
          onClose={() => setShowAccountDetailsModal(false)}
        />
        <Box style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to='/'>
            {mobileWindowSize && (
              <img src={QuickIcon} alt='QuickLogo' height={32} />
            )}
            {!mobileWindowSize && (
              <picture>
                <source height={32} srcSet={QuickIcon} type='image/webp' />
                <img src={QuickLogo} alt='QuickLogo' height={32} />
              </picture>
            )}
          </Link>
          {!tabletWindowSize && (
            <Box className='mainMenu'>
              {menuItems.slice(0, menuItemCountToShow).map((val, i) => (
                <HeaderDesktopItem
                  key={`header-desktop-item-${i}`}
                  item={val}
                />
              ))}
              {menuItems.slice(menuItemCountToShow, menuItems.length).length >
                0 && (
                <Box display='flex' className='menuItem subMenuItem'>
                  <ThreeDotIcon />
                  <Box className='subMenuWrapper'>
                    <Box className='subMenu'>
                      {menuItems
                        .slice(menuItemCountToShow, menuItems.length)
                        .map((val, i) => (
                          <HeaderListItem key={'sub-menu' + i} item={val} />
                        ))}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
        <Box>
          {isPerpsPage && !mobileWindowSize && <OrderlyPoints />}
          <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NetworkSelection />
            {!!account ? (
              <Box
                id='web3-status-connected'
                className='accountDetails'
                onClick={() => setShowAccountDetailsModal(true)}
                style={{ gap: '8px' }}
              >
                {walletInfo?.icon && (
                  <img src={walletInfo?.icon} width={24} alt='wallet icon' />
                )}
                <p>{shortenAddress(account)}</p>
                <KeyboardArrowDownIcon />
              </Box>
            ) : (
              <Box
                className='connectButton bg-primary'
                onClick={() => {
                  connectWallet();
                }}
              >
                {t('connectWallet')}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {(mobileWindowSize || tabletWindowSize) && (
        <MobileHeader
          isMobile={mobileWindowSize}
          isTablet={tabletWindowSize}
          menuItems={menuItems}
        />
      )}
    </Box>
  );
};

export default Header;
