import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { KeyboardArrowDown, MoreHoriz } from '@mui/icons-material';
import {
  useIsV2,
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
import Image from 'next/image';
import styles from 'styles/components/Header.module.scss';
import { useTranslation } from 'react-i18next';
import { getConfig } from 'config';
import useDeviceWidth from 'hooks/useDeviceWidth';
import { USDC, USDT } from 'constants/v3/addresses';
import { ChainId } from '@uniswap/sdk';

const QuickIcon = '/assets/images/quickIcon.svg';
const QuickLogo = '/assets/images/quickLogo.png';
const WalletIcon = '/assets/images/WalletIcon.png';
const NewTag = '/assets/images/NewTag.png';
const SparkleLeft = '/assets/images/SparkleLeft.svg';
const SparkleRight = '/assets/images/SparkleRight.svg';
const SparkleTop = '/assets/images/SparkleTop.svg';
const SparkleBottom = '/assets/images/SparkleBottom.svg';

const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => {
  return b.addedTime - a.addedTime;
};

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useRouter();
  const { account } = useActiveWeb3React();
  const isSupportedNetwork = useIsSupportedNetwork();
  const { ENSName } = useENSName(account ?? undefined);
  const { udDomain } = useUDDomain();
  const [openDetailMenu, setOpenDetailMenu] = useState(false);

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
  const toggleNetworkSelectionModal = useNetworkSelectionModalToggle();
  const deviceWidth = useDeviceWidth();
  const [headerClass, setHeaderClass] = useState('');

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
    if (deviceWidth > 1540) {
      return 7;
    } else if (deviceWidth > 1430) {
      return 6;
    } else if (deviceWidth > 1260) {
      return 5;
    } else if (deviceWidth > 1080) {
      return 4;
    }
    return 3;
  }, [deviceWidth]);

  const { chainId } = useActiveWeb3React();
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

  const menuItems = [];

  const swapCurrencyStr = useMemo(() => {
    if (!chainId) return '';
    if (chainId === ChainId.ZKTESTNET)
      return `&currency1=${USDT[chainId].address}`;
    return `&currency1=${USDC[chainId].address}`;
  }, [chainId]);

  if (showSwap) {
    menuItems.push({
      link: `/swap?currency0=ETH${swapCurrencyStr}`,
      text: t('swap'),
      id: 'swap-page-link',
    });
  }
  if (showPool) {
    menuItems.push({
      link: `/pools`,
      text: t('pool'),
      id: 'pools-page-link',
    });
  }
  if (showFarm) {
    menuItems.push({
      link: `/farm`,
      text: t('farm'),
      id: 'farm-page-link',
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
      isNew: true,
    });
  }
  if (showLeaderboard) {
    menuItems.push({
      link: '/leader-board',
      text: 'Leader Board',
      id: 'contest-page-link',
      isNew: true,
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

  const outLinks: any[] = [
    // {
    //   link: '/',
    //   text: 'Governance',
    // },
    // {
    //   link: '/',
    //   text: 'Docs',
    // },
    // {
    //   link: '/',
    //   text: 'For Developers',
    // },
    // {
    //   link: '/',
    //   text: 'Help & Tutorials',
    // },
    // {
    //   link: '/',
    //   text: 'Knowledge Base',
    // },
    // {
    //   link: '/',
    //   text: 'News',
    // },
  ];

  const { updateIsV2 } = useIsV2();

  return (
    <Box className={`${styles.header} ${tabletWindowSize ? '' : headerClass}`}>
      <NetworkSelectionModal />
      <WalletModal
        ENSName={ENSName ?? undefined}
        pendingTransactions={pending}
        confirmedTransactions={confirmed}
      />
      <Link href='/'>
        <Image
          src={mobileWindowSize ? QuickIcon : QuickLogo}
          alt='QuickLogo'
          width={mobileWindowSize ? 40 : 195}
          height={mobileWindowSize ? 40 : 60}
        />
      </Link>
      {!tabletWindowSize && (
        <Box className={styles.mainMenu}>
          {menuItems.slice(0, menuItemCountToShow).map((val, index) => (
            <Link
              href={val.link}
              key={index}
              id={val.id}
              className={`${styles.menuItem} ${
                pathname !== '/' && val.link.includes(pathname)
                  ? styles.activeMenuItem
                  : ''
              }`}
              onClick={() => {
                updateIsV2(false);
              }}
            >
              <small>{val.text}</small>
              {val.isNew && (
                <>
                  <Image src={NewTag} alt='new menu' width={46} height={30} />
                  <Image
                    className={`${styles.menuItemSparkle} ${styles.menuItemSparkleLeft}`}
                    src={SparkleLeft}
                    alt='menuItem sparkle left'
                    width={4}
                    height={5}
                  />
                  <Image
                    className={`${styles.menuItemSparkle} ${styles.menuItemSparkleRight}`}
                    src={SparkleRight}
                    alt='menuItem sparkle right'
                    width={4}
                    height={5}
                  />
                  <Image
                    className={`${styles.menuItemSparkle} ${styles.menuItemSparkleBottom}`}
                    src={SparkleBottom}
                    alt='menuItem sparkle bottom'
                    width={136}
                    height={10}
                  />
                  <Image
                    className={`${styles.menuItemSparkle} ${styles.menuItemSparkleTop}`}
                    src={SparkleTop}
                    alt='menuItem sparkle top'
                    width={133}
                    height={11}
                  />
                </>
              )}
            </Link>
          ))}
          {menuItems.slice(menuItemCountToShow, menuItems.length).length >
            0 && (
            <Box className={`${styles.menuItem} ${styles.subMenuItem}`}>
              <MoreHoriz />
              <Box className={styles.subMenuWrapper}>
                <Box className={styles.subMenu}>
                  {menuItems
                    .slice(menuItemCountToShow, menuItems.length)
                    .map((val, index) => (
                      <Link
                        href={val.link}
                        key={index}
                        onClick={() => {
                          setOpenDetailMenu(false);
                          updateIsV2(false);
                        }}
                      >
                        <small>{val.text}</small>
                      </Link>
                    ))}
                  {outLinks.map((item, ind) => (
                    <a href={item.link} key={ind}>
                      <small>{item.text}</small>
                    </a>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}
      {tabletWindowSize && (
        <Box className={styles.mobileMenuContainer}>
          <Box className={styles.mobileMenu}>
            {menuItems.slice(0, 4).map((val, index) => (
              <Link
                href={val.link}
                key={index}
                className={
                  pathname.indexOf(val.link) > -1 ? 'active' : 'menuItem'
                }
              >
                <small>{val.text}</small>
              </Link>
            ))}
            {menuItems.length > 4 && (
              <Box className={`flex ${styles.menuItem}`}>
                <MoreHoriz onClick={() => setOpenDetailMenu(!openDetailMenu)} />
                {openDetailMenu && (
                  <Box className={styles.subMenuWrapper}>
                    <Box className={styles.subMenu}>
                      {menuItems
                        .slice(4, menuItems.length)
                        .map((val, index) => {
                          return val.isExternal ? (
                            <a
                              href={val.externalLink}
                              target={val?.target ? val.target : '_blank'}
                              key={index}
                              rel='noopener noreferrer'
                            >
                              <small>{val.text}</small>
                            </a>
                          ) : (
                            <Link
                              href={val.link}
                              key={index}
                              onClick={() => {
                                setOpenDetailMenu(false);
                                updateIsV2(false);
                              }}
                            >
                              <small>{val.text}</small>
                            </Link>
                          );
                        })}
                      {outLinks.map((item, ind) => (
                        <a
                          href={item.link}
                          key={ind}
                          onClick={() => setOpenDetailMenu(false)}
                        >
                          <small>{item.text}</small>
                        </a>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}
      <Box>
        <Box
          className={styles.networkSelection}
          onClick={toggleNetworkSelectionModal}
        >
          {isSupportedNetwork && (
            <Box className={styles.networkSelectionImage}>
              {chainId && <Box className={styles.styledPollingDot} />}
              <Image
                src={config['nativeCurrencyImage']}
                alt='network Image'
                width={18}
                height={18}
              />
            </Box>
          )}
          <small className='weight-600'>
            {isSupportedNetwork ? config['networkName'] : t('wrongNetwork')}
          </small>
          <KeyboardArrowDown />
        </Box>

        {account ? (
          <Box
            id='web3-status-connected'
            className={styles.accountDetails}
            onClick={toggleWalletModal}
          >
            <p>{udDomain ?? shortenAddress(account)}</p>
            <Image src={WalletIcon} alt='Wallet' width={20} height={20} />
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
  );
};

export default Header;
