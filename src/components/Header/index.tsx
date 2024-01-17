import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { KeyboardArrowDown, MoreHoriz, Close } from '@mui/icons-material';
import {
  useNetworkSelectionModalToggle,
  useUDDomain,
  useWalletModalToggle,
} from 'state/application/hooks';
import {
  isTransactionRecent,
  useAllTransactions,
} from 'state/transactions/hooks';
import { TransactionDetails } from 'state/transactions/reducer';
import { shortenAddress, useIsSupportedNetwork } from 'utils';
import useENSName from 'hooks/useENSName';
import { WalletModal, NetworkSelectionModal } from 'components';
import { useActiveWeb3React } from 'hooks';
import styles from 'styles/components/Header.module.scss';
import { useTranslation } from 'next-i18next';
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
import { HeaderListItem, HeaderMenuItem } from './HeaderListItem';
import { HeaderDesktopItem } from './HeaderDesktopItem';

const QuickIcon = '/assets/images/quickIcon.svg';
const QuickLogo = '/assets/images/quickLogo.png';
const WalletIcon = '/assets/images/WalletIcon.png';

const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => {
  return b.addedTime - a.addedTime;
};

const Header: React.FC<{ onUpdateNewsletter: (val: boolean) => void }> = ({
  onUpdateNewsletter,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { account, chainId, connector } = useActiveWeb3React();
  const isSupportedNetwork = useIsSupportedNetwork();
  const { ENSName } = useENSName(account ?? undefined);
  const { udDomain } = useUDDomain();
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
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('md'));
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('sm'));
  const toggleWalletModal = useWalletModalToggle();
  const toggleNetworkSelectionModal = useNetworkSelectionModalToggle();
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
  const showLair = config['lair']['available'];
  const showConvert = config['convert']['available'];
  const showAnalytics = config['analytics']['available'];
  const showLending = config['lending']['available'];
  const showGamingHub = config['gamingHub']['available'];
  const showLeaderboard = config['leaderboard']['available'];
  const showSafe = config['safe']['available'];
  const showPerps = config['perps']['available'];
  const showBOS = config['bos']['available'];
  const showBonds = config['bonds']['available'];
  const showDappOS = config['dappos']['available'];
  const showEarn = showFarm && showBonds;
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
  if (showPerps) {
    menuItems.push({
      link: '/perps',
      text: 'Perps',
      id: 'perps-page-link',
      isExternal: true,
      externalLink: process?.env?.NEXT_PUBLIC_PERPS_URL || '',
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
        if (process.env.NEXT_PUBLIC_PERPS_URL) {
          window.open(process.env.NEXT_PUBLIC_PERPS_URL, '_self');
        }
      },
    });
  }
  if (showPool) {
    menuItems.push({
      link: `/pools/v3`,
      text: t('pool'),
      id: 'pools-page-link',
    });
  }
  const earnTab: HeaderMenuItem = {
    text: t('Earn'),
    id: 'earn-tab',
    link: '/',
    items: [],
    isNew: true,
  };
  if (showEarn) {
    menuItems.push(earnTab);
  }
  if (showFarm) {
    if (showEarn) {
      earnTab.items?.push({
        link: `/farm/v3`,
        text: t('farm') as string,
        id: 'farm-page-link',
      });
    } else {
      menuItems.push({
        link: `/farm/v3`,
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
      externalLink: process?.env?.NEXT_PUBLIC_SAFE_URL || '',
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
  if (showGamingHub) {
    menuItems.push({
      link: '/gamehub',
      text: 'Gaming Hub',
      id: 'gamehub-page-link',
      isExternal: true,
      target: '_top',
      externalLink: process?.env?.NEXT_PUBLIC_GAMEHUB_URL || '',
    });
  }
  if (showBOS) {
    menuItems.push({
      link: '/bos',
      text: 'BOS',
      id: 'bos-page-link',
      isExternal: true,
      target: '_blank',
      externalLink: process?.env?.NEXT_PUBLIC_BOS_URL || '',
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
  if (showDappOS) {
    menuItems.push({
      link: '/dappos',
      text: 'DappOS',
      id: 'dappos-page-link',
      isExternal: true,
      target: '_blank',
      externalLink: process?.env?.NEXT_PUBLIC_DAPPOS_URL || '',
      isNew: true,
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
      link: `/analytics/total`,
      text: t('analytics'),
      id: 'analytics-page-link',
    });
  }

  const parsedChain =
    router.query && router.query.chainId
      ? Number(router.query.chainId)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, parsedChain]);

  return (
    <Box className={styles.header}>
      {showNewsletter && (
        <Box className={styles.newsletterBar}>
          <small className='text-white'>{t('signupnewsletterTopDesc')}</small>
          <Button onClick={() => router.push('/newsletter')}>
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
      <Box
        className={`${styles.menuBar} ${tabletWindowSize ? '' : headerClass}`}
      >
        <NetworkSelectionModal />
        <WalletModal
          ENSName={ENSName ?? undefined}
          pendingTransactions={pending}
          confirmedTransactions={confirmed}
        />
        <Link href='/'>
          <picture>
            <img
              src={mobileWindowSize ? QuickIcon : QuickLogo}
              alt='QuickLogo'
              height={mobileWindowSize ? 40 : 60}
            />
          </picture>
        </Link>
        {!tabletWindowSize && (
          <Box className='mainMenu'>
            {menuItems.slice(0, menuItemCountToShow).map((val, i) => (
              <HeaderDesktopItem key={`header-desktop-item-${i}`} item={val} />
            ))}
            {menuItems.slice(menuItemCountToShow, menuItems.length).length >
              0 && (
              <Box
                width='36px'
                className={`flex justify-center ${styles.menuItem} ${styles.subMenuItem}`}
              >
                <MoreHoriz />
                <Box className={styles.subMenuWrapper}>
                  <Box className={styles.subMenu}>
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
          {!parsedChain && (
            <Box
              className={styles.networkSelection}
              onClick={toggleNetworkSelectionModal}
            >
              {isSupportedNetwork && (
                <Box className={styles.networkSelectionImage}>
                  {chainId && <Box className={styles.styledPollingDot} />}
                  <picture>
                    <img
                      src={config['nativeCurrencyImage']}
                      alt='network Image'
                    />
                  </picture>
                </Box>
              )}
              <small className={styles.networkName}>
                {isSupportedNetwork ? config['networkName'] : t('wrongNetwork')}
              </small>
              <KeyboardArrowDown />
            </Box>
          )}

          {account ? (
            <Box
              id='web3-status-connected'
              className={styles.accountDetails}
              onClick={toggleWalletModal}
            >
              <p>{udDomain ?? shortenAddress(account)}</p>
              <picture>
                <img src={WalletIcon} alt='Wallet' />
              </picture>
            </Box>
          ) : (
            <Box
              className={`${styles.connectButton} bg-primary`}
              onClick={toggleWalletModal}
            >
              {t('connectWallet')}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
