import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import {
  useIsV2,
  useUDDomain,
  useWalletModalToggle,
} from 'state/application/hooks';
import {
  isTransactionRecent,
  useAllTransactions,
} from 'state/transactions/hooks';
import { TransactionDetails } from 'state/transactions/reducer';
import { shortenAddress, addMaticToMetamask, isSupportedNetwork } from 'utils';
import useENSName from 'hooks/useENSName';
import { WalletModal } from 'components';
import { useActiveWeb3React } from 'hooks';
import { MoreHoriz } from '@mui/icons-material';
import LightIcon from 'svgs/LightIcon.svg';
import styles from 'styles/components/Header.module.scss';
import { useTranslation } from 'react-i18next';
import useDeviceWidth from 'hooks/useDeviceWidth';
import { GlobalValue } from 'constants/index';

const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => {
  return b.addedTime - a.addedTime;
};

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useRouter();
  const { account } = useActiveWeb3React();
  const { ethereum } = window as any;
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
    if (deviceWidth > 1370) {
      return 7;
    } else if (deviceWidth > 1270) {
      return 6;
    } else if (deviceWidth > 1092) {
      return 5;
    } else {
      return 4;
    }
  }, [deviceWidth]);

  const menuItems = [
    {
      link: `/swap?swapIndex=0&currency0=ETH&currency1=${GlobalValue.tokens.COMMON.USDC.address}`,
      text: t('swap'),
      id: 'swap-page-link',
    },
    {
      link: `/pools`,
      text: t('pool'),
      id: 'pools-page-link',
    },
    {
      link: `/farm`,
      text: t('farm'),
      id: 'farm-page-link',
    },
    {
      link: '/dragons',
      text: t('dragonLair'),
      id: 'dragons-page-link',
    },
    {
      link: '/gamehub',
      text: 'Gaming Hub',
      id: 'gamehub-page-link',
      isExternal: true,
      externalLink: process?.env?.REACT_APP_GAMEHUB_URL || '',
      isNew: true,
    },
    {
      link: '/predictions',
      text: 'Predictions',
      id: 'predictions-page-link',
      isExternal: true,
      externalLink: process?.env?.REACT_APP_PREDICTIONS_URL || '',
    },
    // {
    //   link: '/lend',
    //   text: t('lend'),
    //   id: 'lend-page-link',
    //   isNew: true,
    // },
    {
      link: '/convert',
      text: t('convert'),
      id: 'convert-quick',
    },
    {
      link: `/analytics`,
      text: t('analytics'),
      id: 'analytics-page-link',
    },
  ];

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
      <WalletModal
        ENSName={ENSName ?? undefined}
        pendingTransactions={pending}
        confirmedTransactions={confirmed}
      />
      <Link href='/'>
        <Image
          src={
            mobileWindowSize ? '/images/quickIcon.svg' : '/images/quickLogo.png'
          }
          alt='QuickLogo'
          height={60}
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
                pathname !== '/' && val.link.includes(pathname) ? 'active' : ''
              }`}
              onClick={() => {
                updateIsV2(false);
              }}
            >
              <small>{val.text}</small>
              {val.isNew && (
                <>
                  <Image src='/images/NewTag.png' alt='new menu' width={46} />
                  <Image
                    className={`${styles.menuItemSparkle} ${styles.menuItemSparkleLeft}`}
                    src='/images/SparkleLeft.svg'
                    alt='menuItem sparkle left'
                  />
                  <img
                    className={`${styles.menuItemSparkle} ${styles.menuItemSparkleRight}`}
                    src='/images/SparkleRight.svg'
                    alt='menuItem sparkle right'
                  />
                  <img
                    className={`${styles.menuItemSparkle} ${styles.menuItemSparkleBottom}`}
                    src='/images/SparkleBottom.svg'
                    alt='menuItem sparkle bottom'
                  />
                  <img
                    className={`${styles.menuItemSparkle} ${styles.menuItemSparkleTop}`}
                    src='/images/SparkleTop.svg'
                    alt='menuItem sparkle top'
                  />
                </>
              )}
            </Link>
          ))}
          {menuItems.slice(menuItemCountToShow, menuItems.length).length >
            0 && (
            <Box
              display='flex'
              className={`${styles.menuItem} ${styles.subMenuItem}`}
            >
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
                  pathname.indexOf(val.link) > -1 ? 'active' : styles.menuItem
                }
              >
                <small>{val.text}</small>
              </Link>
            ))}
            <Box className={`flex ${styles.menuItem}`}>
              <MoreHoriz onClick={() => setOpenDetailMenu(!openDetailMenu)} />
              {openDetailMenu && (
                <Box className={styles.subMenuWrapper}>
                  <Box className={styles.subMenu}>
                    {menuItems.slice(4, menuItems.length).map((val, index) => {
                      return val.isExternal ? (
                        <a
                          href={val.externalLink}
                          target='_blank'
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
          </Box>
        </Box>
      )}
      <Box>
        <Box className={styles.headerIconWrapper}>
          <Box className={styles.styledPollingDot} />
          <LightIcon />
        </Box>
        {account && (!ethereum || isSupportedNetwork(ethereum)) ? (
          <Box
            id='web3-status-connected'
            className={styles.accountDetails}
            onClick={toggleWalletModal}
          >
            <p>{udDomain ?? shortenAddress(account)}</p>
            <Image src='/images/WalletIcon.png' alt='Wallet' />
          </Box>
        ) : (
          <Box
            className={`${styles.connectButton} ${
              ethereum && !isSupportedNetwork(ethereum)
                ? 'bg-error'
                : 'bg-primary'
            }`}
            onClick={() => {
              if (!ethereum || isSupportedNetwork(ethereum)) {
                toggleWalletModal();
              }
            }}
          >
            {ethereum && !isSupportedNetwork(ethereum)
              ? t('wrongNetwork')
              : t('connectWallet')}
            {ethereum && !isSupportedNetwork(ethereum) && (
              <Box className={styles.wrongNetworkWrapper}>
                <Box className={styles.wrongNetworkContent}>
                  <small>{t('switchWalletToPolygon')}</small>
                  <Box mt={2.5} onClick={addMaticToMetamask}>
                    {t('switchPolygon')}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Header;
