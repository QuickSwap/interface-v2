import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { Box, Button, useMediaQuery } from '@material-ui/core';
import { KeyboardArrowDown, Close, KeyboardArrowUp } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import { useUDDomain, useWalletModalToggle } from 'state/application/hooks';
import {
  isTransactionRecent,
  useAllTransactions,
} from 'state/transactions/hooks';
import { TransactionDetails } from 'state/transactions/reducer';
import { shortenAddress } from 'utils';
import useENSName from 'hooks/useENSName';
import { WalletModal } from 'components';
import { useActiveWeb3React } from 'hooks';
import QuickIcon from 'assets/images/quickIcon.svg';
import QuickLogo from 'assets/images/quickLogo.png';
import QuickLogoWebP from 'assets/images/quickLogo.webp';
import { ReactComponent as ThreeDotIcon } from 'assets/images/ThreeDot.svg';
import WalletIcon from 'assets/images/WalletIcon.png';
import 'components/styles/HeaderHomepage.scss';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'config/index';
import useDeviceWidth from 'hooks/useDeviceWidth';
import { USDC, USDT } from 'constants/v3/addresses';
import { ChainId } from '@uniswap/sdk';
import {
  networkConnection,
  walletConnectConnection,
  zengoConnectConnection,
} from 'connectors';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { HeaderListItem, HeaderMenuItem } from './HeaderListItem';
import { HeaderDesktopItem } from './HeaderDesktopItem';
import { NetworkSelection } from './NetworkSelection';

const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => {
  return b.addedTime - a.addedTime;
};

const HeaderHomepage: React.FC<{
  onUpdateNewsletter: (val: boolean) => void;
}> = ({ onUpdateNewsletter }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { account, chainId, connector } = useActiveWeb3React();
  const { ENSName } = useENSName(account ?? undefined);
  const { udDomain } = useUDDomain();
  const [openDetailMenu, setOpenDetailMenu] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);

  const theme = useTheme();
  const allTransactions = useAllTransactions();
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const pending = sortedRecentTransactions
    .filter((tx: any) => !tx.receipt)
    .map((tx: any) => tx.hash);
  const confirmed = sortedRecentTransactions
    .filter((tx: any) => tx.receipt)
    .map((tx: any) => tx.hash);
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('sm'));
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('xs'));
  const toggleWalletModal = useWalletModalToggle();
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
      return 7;
    } else if (deviceWidth > 1500) {
      return 6;
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
  const showBridge = config['bridge']['available'];
  const showLair = config['lair']['available'];
  const showConvert = config['convert']['available'];
  const showAnalytics = config['analytics']['available'];
  const showLending = config['lending']['available'];
  const showGamingHub = config['gamingHub']['available'];
  const showLeaderboard = config['leaderboard']['available'];
  const showSafe = config['safe']['available'];
  const showPerpsV1 = config['perps']['available'];
  const showBOS = config['bos']['available'];
  const showBonds = config['bonds']['available'];
  const showDappOS = config['dappos']['available'];
  const showPerpsFalkor = config['perpsFalkor']['available'];
  const showPerps = showPerpsV1 && showPerpsFalkor;
  const showEarn = showFarm && showBonds;
  const showPartners = showDappOS && showBridge;
  const menuItems: Array<HeaderMenuItem> = [];

  const swapCurrencyStr = useMemo(() => {
    if (!chainId) return '';
    if (chainId === ChainId.ZKTESTNET)
      return `&currency1=${USDT[chainId].address}`;
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
    text: 'Perps',
    id: 'perps-tab',
    link: '/',
    items: [],
  };
  if (showPerps) {
    menuItems.push(perpsTab);
  }
  if (showPerpsV1) {
    if (showPerps) {
      perpsTab.items?.push({
        link: '/perps',
        text: 'Perps V1',
        id: 'perps-page-link',
        isExternal: true,
        externalLink: process?.env?.REACT_APP_PERPS_URL || '',
        onClick: async () => {
          if (chainId !== ChainId.ZKEVM) {
            const zkEVMconfig = getConfig(ChainId.ZKEVM);
            const chainParam = {
              chainId: ChainId.ZKEVM,
              chainName: `${zkEVMconfig['networkName']} Network`,
              rpcUrls: [zkEVMconfig['rpc']],
              nativeCurrency: zkEVMconfig['nativeCurrency'],
              blockExplorerUrls: [zkEVMconfig['blockExplorer']],
            };
            if (
              connector === walletConnectConnection.connector ||
              connector === networkConnection.connector
            ) {
              await connector.activate(ChainId.ZKEVM);
            } else {
              await connector.activate(chainParam);
            }
          }
          if (process.env.REACT_APP_PERPS_URL) {
            window.open(process.env.REACT_APP_PERPS_URL, '_self');
          }
        },
      });
    } else {
      menuItems.push({
        link: '/perps',
        text: 'Perps',
        id: 'perps-page-link',
        isExternal: true,
        externalLink: process?.env?.REACT_APP_PERPS_URL || '',
        onClick: async () => {
          if (chainId !== ChainId.ZKEVM) {
            const zkEVMconfig = getConfig(ChainId.ZKEVM);
            const chainParam = {
              chainId: ChainId.ZKEVM,
              chainName: `${zkEVMconfig['networkName']} Network`,
              rpcUrls: [zkEVMconfig['rpc']],
              nativeCurrency: zkEVMconfig['nativeCurrency'],
              blockExplorerUrls: [zkEVMconfig['blockExplorer']],
            };
            if (
              connector === walletConnectConnection.connector ||
              connector === networkConnection.connector
            ) {
              await connector.activate(ChainId.ZKEVM);
            } else {
              await connector.activate(chainParam);
            }
          }
          if (process.env.REACT_APP_PERPS_URL) {
            window.open(process.env.REACT_APP_PERPS_URL, '_self');
          }
        },
      });
    }
  }
  if (showPerpsFalkor) {
    if (showPerps) {
      perpsTab.items?.push({
        link: `/perps-falkor`,
        text: 'Perps: Falkor',
        id: 'perpsFalkor-page-link',
        isNew: true,
      });
    } else {
      menuItems.push({
        link: `/perps-falkor`,
        text: 'Perps: Falkor',
        id: 'perpsFalkor-page-link',
      });
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
  if (showSafe) {
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
  const partnersTab: HeaderMenuItem = {
    text: t('partners'),
    id: 'partners-tab',
    link: '/',
    items: [],
  };
  if (showPartners) {
    menuItems.push(partnersTab);
  }
  if (showDappOS) {
    if (showPartners) {
      partnersTab.items?.push({
        link: `/dappos`,
        text: 'dappOS',
        id: 'dappos-page-link',
        isExternal: true,
        target: '_blank',
        externalLink: process?.env?.REACT_APP_DAPPOS_URL || '',
      });
    } else {
      menuItems.push({
        link: `/dappos`,
        text: 'dappOS',
        id: 'dappos-page-link',
        isExternal: true,
        target: '_blank',
        externalLink: process?.env?.REACT_APP_DAPPOS_URL || '',
      });
    }
  }
  if (showBridge) {
    if (showEarn) {
      partnersTab.items?.push({
        link: `/bridge`,
        text: 'Bridge',
        id: 'bridge-page-link',
      });
    } else {
      menuItems.push({
        link: `/bridge`,
        text: 'Bridge',
        id: 'bridge-page-link',
      });
    }
  }
  if (showLair) {
    menuItems.push({
      link: '/dragons',
      text: t('dragonLair'),
      id: 'dragons-page-link',
    });
  }
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
  if (showBOS) {
    menuItems.push({
      link: '/bos',
      text: 'BOS',
      id: 'bos-page-link',
      isExternal: true,
      target: '_blank',
      externalLink: process?.env?.REACT_APP_BOS_URL || '',
      isNew: true,
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
        const config = getConfig(parsedChain);
        const chainParam = {
          chainId: parsedChain,
          chainName: `${config['networkName']} Network`,
          rpcUrls: [config['rpc']],
          nativeCurrency: config['nativeCurrency'],
          blockExplorerUrls: [config['blockExplorer']],
        };
        if (
          connector === walletConnectConnection.connector ||
          connector === zengoConnectConnection.connector ||
          connector === networkConnection.connector
        ) {
          await connector.activate(parsedChain);
        } else {
          await connector.activate(chainParam);
        }
      }
    })();
  }, [chainId, parsedChain]);

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
        <WalletModal
          ENSName={ENSName ?? undefined}
          pendingTransactions={pending}
          confirmedTransactions={confirmed}
        />
        <Link to='/' className='header_logo'>
          <img src={QuickIcon} alt='QuickLogo' height={40} />
        </Link>
        {!tabletWindowSize && (
          <Box className='mainMenu'>
            {menuItems.slice(0, menuItemCountToShow).map((val, i) => (
              <HeaderDesktopItem key={`header-desktop-item-${i}`} item={val} />
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
        {tabletWindowSize && <MobileMenuDrawer menuItems={menuItems} />}
        <Box>
          {!parsedChain && <NetworkSelection />}

          <Box className='launchApp'>
            <a href='/#/swap'>
              <button>{t('launchApp')}</button>
            </a>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HeaderHomepage;
