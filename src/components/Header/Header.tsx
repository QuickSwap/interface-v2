import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box } from 'theme/components';
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
import QuickIcon from 'assets/images/quickIcon.svg';
import QuickLogo from 'assets/images/quickLogo.png';
import { ReactComponent as ThreeDotIcon } from 'assets/images/ThreeDot.svg';
import { ReactComponent as LightIcon } from 'assets/images/LightIcon.svg';
import WalletIcon from 'assets/images/WalletIcon.png';
import NewTag from 'assets/images/NewTag.png';
import SparkleLeft from 'assets/images/SparkleLeft.svg';
import SparkleRight from 'assets/images/SparkleRight.svg';
import SparkleTop from 'assets/images/SparkleTop.svg';
import SparkleBottom from 'assets/images/SparkleBottom.svg';
import 'components/styles/Header.scss';
import { useTranslation } from 'react-i18next';
import useDeviceWidth from 'hooks/useDeviceWidth';
import { useIsSM, useIsXS } from 'hooks/useMediaQuery';

const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => {
  return b.addedTime - a.addedTime;
};

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { account } = useActiveWeb3React();
  const { ethereum } = window as any;
  const { ENSName } = useENSName(account ?? undefined);
  const { udDomain } = useUDDomain();
  const [openDetailMenu, setOpenDetailMenu] = useState(false);
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
  const tabletWindowSize = useIsSM();
  const mobileWindowSize = useIsXS();
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
      link: '/swap',
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
      isNew: true,
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
    <Box className={`header ${tabletWindowSize ? '' : headerClass}`}>
      <WalletModal
        ENSName={ENSName ?? undefined}
        pendingTransactions={pending}
        confirmedTransactions={confirmed}
      />
      <Link to='/'>
        <img
          src={mobileWindowSize ? QuickIcon : QuickLogo}
          alt='QuickLogo'
          height={60}
        />
      </Link>
      {!tabletWindowSize && (
        <Box className='mainMenu'>
          {menuItems.slice(0, menuItemCountToShow).map((val, index) => (
            <Link
              to={val.link}
              key={index}
              id={val.id}
              className={`menuItem ${
                pathname !== '/' && val.link.includes(pathname) ? 'active' : ''
              }`}
              onClick={() => {
                updateIsV2(false);
              }}
            >
              <small>{val.text}</small>
              {val.isNew && (
                <>
                  <img src={NewTag} alt='new menu' width={46} />
                  <img
                    className='menuItemSparkle menuItemSparkleLeft'
                    src={SparkleLeft}
                    alt='menuItem sparkle left'
                  />
                  <img
                    className='menuItemSparkle menuItemSparkleRight'
                    src={SparkleRight}
                    alt='menuItem sparkle right'
                  />
                  <img
                    className='menuItemSparkle menuItemSparkleBottom'
                    src={SparkleBottom}
                    alt='menuItem sparkle bottom'
                  />
                  <img
                    className='menuItemSparkle menuItemSparkleTop'
                    src={SparkleTop}
                    alt='menuItem sparkle top'
                  />
                </>
              )}
            </Link>
          ))}
          {menuItems.slice(menuItemCountToShow, menuItems.length).length >
            0 && (
            <Box className='flex menuItem subMenuItem'>
              <ThreeDotIcon />
              <Box className='subMenuWrapper'>
                <Box className='subMenu'>
                  {menuItems
                    .slice(menuItemCountToShow, menuItems.length)
                    .map((val, index) => (
                      <Link
                        to={val.link}
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
        <Box className='mobileMenuContainer'>
          <Box className='mobileMenu'>
            {menuItems.slice(0, 4).map((val, index) => (
              <Link
                to={val.link}
                key={index}
                className={
                  pathname.indexOf(val.link) > -1 ? 'active' : 'menuItem'
                }
              >
                <small>{val.text}</small>
              </Link>
            ))}
            <Box className='flex menuItem'>
              <ThreeDotIcon
                onClick={() => setOpenDetailMenu(!openDetailMenu)}
              />
              {openDetailMenu && (
                <Box className='subMenuWrapper'>
                  <Box className='subMenu'>
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
                          to={val.link}
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
        <Box className='headerIconWrapper'>
          <Box className='styledPollingDot' />
          <LightIcon />
        </Box>
        {account && (!ethereum || isSupportedNetwork(ethereum)) ? (
          <Box
            id='web3-status-connected'
            className='accountDetails'
            onClick={toggleWalletModal}
          >
            <p>{udDomain ?? shortenAddress(account)}</p>
            <img src={WalletIcon} alt='Wallet' />
          </Box>
        ) : (
          <Box
            className={`connectButton ${
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
              <Box className='wrongNetworkWrapper'>
                <Box className='wrongNetworkContent'>
                  <small>{t('switchWalletToPolygon')}</small>
                  <Box margin='20px 0 0' onClick={addMaticToMetamask}>
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
