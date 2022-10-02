import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useWalletModalToggle } from 'state/application/hooks';
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
import { useIsV3 } from 'state/application/hooks';
import { getConfig } from 'config/index';
const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => {
  return b.addedTime - a.addedTime;
};

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { account } = useActiveWeb3React();
  const { ethereum } = window as any;
  const { ENSName } = useENSName(account ?? undefined);
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

  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  const showSwap = config['swap']['available'];
  const showPool = config['pools']['available'];
  const showFarm = config['farm']['available'];
  const showLair = config['lair']['available'];
  const showConvert = config['convert']['available'];
  const showPredictions = config['predictions']['available'];
  const showAnalytics = config['analytics']['available'];
  const showLending = config['lending']['available'];

  const { isV3 } = useIsV3();

  const menuItems = [];

  if (showSwap) {
    menuItems.push({
      link: '/swap',
      text: t('swap'),
      id: 'swap-page-link',
    });
  }
  if (showPool) {
    menuItems.push({
      link: `/pools${isV3 ? '/v3' : ''}`,
      text: t('pool'),
      id: 'pools-page-link',
    });
  }
  if (showFarm) {
    menuItems.push({
      link: `/farm${isV3 ? '/v3' : ''}`,
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
  if (showConvert) {
    menuItems.push({
      link: '/convert',
      text: t('convert'),
      id: 'convert-quick',
    });
  }
  if (showPredictions) {
    menuItems.push({
      link: '/predictions',
      text: 'Predictions',
      id: 'predictions-page-link',
      isExternal: true,
      externalLink: process?.env?.REACT_APP_PREDICTIONS_URL || '',
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
      link: `/analytics${isV3 ? '/v3' : ''}`,
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

  return (
    <Box className='header'>
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
          {menuItems.slice(0, 7).map((val, index) => (
            <Link
              to={val.link}
              key={index}
              id={val.id}
              className={`menuItem ${
                pathname !== '/' && val.link.includes(pathname) ? 'active' : ''
              }`}
            >
              <small>{val.text}</small>
              {val.isNew && (
                <>
                  <img src={NewTag} alt='new menu' width={46} />
                  <img
                    className='menuItemSparkle menuItemSparkleLeft'
                    src={SparkleLeft}
                  />
                  <img
                    className='menuItemSparkle menuItemSparkleRight'
                    src={SparkleRight}
                  />
                  <img
                    className='menuItemSparkle menuItemSparkleBottom'
                    src={SparkleBottom}
                  />
                  <img
                    className='menuItemSparkle menuItemSparkleTop'
                    src={SparkleTop}
                  />
                </>
              )}
            </Link>
          ))}
          <Box display='flex' className='menuItem subMenuItem'>
            <ThreeDotIcon />
            <Box className='subMenuWrapper'>
              <Box className='subMenu'>
                {menuItems.slice(7, menuItems.length).map((val, index) => (
                  <Link
                    to={val.link}
                    key={index}
                    onClick={() => setOpenDetailMenu(false)}
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
                          onClick={() => setOpenDetailMenu(false)}
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
            <p>{shortenAddress(account)}</p>
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
