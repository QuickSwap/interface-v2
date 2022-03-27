import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import cx from 'classnames';
import { makeStyles, useTheme } from '@material-ui/core/styles';
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

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  header: {
    padding: '0 24px',
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    minHeight: 88,
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'space-between',
    '& a': {
      display: 'flex',
    },
    '& > div': {
      display: 'flex',
      alignItems: 'center',
      zIndex: 2,
      '&:last-child': {
        '& button': {
          height: 40,
          borderRadius: 20,
          '&:first-child': {
            padding: '0 16px',
            marginRight: 16,
            '& svg': {
              width: 20,
              height: 20,
              marginRight: 8,
            },
          },
          '&:last-child': {
            padding: '0 32px',
          },
          '& p': {
            fontSize: 16,
          },
        },
      },
    },
    [breakpoints.down('sm')]: {
      alignItems: 'center',
    },
    [breakpoints.down('xs')]: {
      padding: '0 16px',
    },
  },
  networkWrapper: {
    marginLeft: 16,
    padding: '0 12px',
    height: 26,
    borderRadius: 13,
    display: 'flex',
    alignItems: 'center',
    background: palette.primary.dark,
    '& p': {
      marginLeft: 6,
      textTransform: 'uppercase',
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.87)',
    },
    [breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  mainMenu: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    '& .menuItem': {
      borderRadius: 10,
      cursor: 'pointer',
      position: 'relative',
      '& .subMenu': {
        display: 'none',
        position: 'absolute',
        left: 0,
        top: 14,
        background: palette.background.paper,
        borderRadius: 10,
        padding: '14px 0',
        '& > a': {
          padding: '10px 24px',
          '&:hover': {
            color: 'white',
          },
        },
      },
      '&:hover': {
        background: palette.secondary.dark,
        '& .subMenu': {
          display: 'block',
        },
      },
    },
    '& a': {
      textDecoration: 'none',
      padding: '7.5px 24px',
      marginRight: 12,
      color: palette.text.secondary,
      borderRadius: 10,
      '& p': {
        letterSpacing: 'normal',
      },
      '&.active': {
        color: palette.text.primary,
        background: palette.secondary.dark,
      },
      '&:last-child': {
        marginRight: 0,
      },
    },
  },
  accountDetails: {
    border: `solid 1px ${palette.grey.A400}`,
    padding: '0 16px',
    height: 36,
    cursor: 'pointer',
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& p': {
      fontSize: 14,
      fontWeight: 600,
    },
    '& img': {
      width: 20,
      marginLeft: 8,
    },
  },
  connectButton: {
    width: 152,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    color: 'white',
    cursor: 'pointer',
    position: 'relative',
    '&:hover $wrongNetworkContent': {
      display: 'block',
    },
  },
  primary: {
    backgroundColor: '#004ce6',
  },
  danger: {
    backgroundColor: palette.error.main,
  },
  wrongNetworkContent: {
    background: palette.background.paper,
    borderRadius: 10,
    padding: 24,
    display: 'none',
    '& p': {
      color: '#b6b9cc',
      fontSize: 14,
      lineHeight: 1.57,
      marginBottom: 20,
    },
    '& div': {
      width: '100%',
      height: 36,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      border: `solid 1px ${palette.primary.main}`,
      color: palette.primary.main,
      fontSize: 14,
      fontWeight: 600,
    },
  },
  mobileMenuContainer: {
    background: palette.secondary.dark,
    position: 'fixed',
    left: 0,
    bottom: 0,
    height: 64,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: '0 16px',
    justifyContent: 'center',
  },
  mobileMenu: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 375,
    width: '100%',
    '& a': {
      textDecoration: 'none',
      padding: '8px 12px',
      color: palette.text.secondary,
      fontWeight: 'bold',
      '&.active': {
        color: palette.primary.main,
      },
    },
  },
}));

const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => {
  return b.addedTime - a.addedTime;
};

const Header: React.FC = () => {
  const classes = useStyles();
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
  const menuItems = [
    {
      link: '/swap',
      text: 'Swap',
      id: 'swap-page-link',
    },
    {
      link: '/pools',
      text: 'Pool',
      id: 'pools-page-link',
    },
    {
      link: '/farm',
      text: 'Farm',
      id: 'farm-page-link',
    },
    {
      link: '/dragons',
      text: 'Dragon’s Lair',
      id: 'dragons-page-link',
    },
    {
      link: '/analytics',
      text: 'Analytics',
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

  return (
    <Box className={classes.header}>
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
        <Box className={classes.mainMenu}>
          {menuItems.map((val, index) => (
            <Link
              to={val.link}
              key={index}
              id={val.id}
              className={
                pathname.indexOf(val.link) > -1 ? 'active' : 'menuItem'
              }
            >
              <Typography variant='body2'>{val.text}</Typography>
            </Link>
          ))}
          {/* <Box display='flex' className='menuItem'>
            <ThreeDotIcon />
            <Box
              position='absolute'
              top={32}
              left={0}
              width={209}
              paddingTop={10}
            >
              <Box className='subMenu'>
                {outLinks.map((item, ind) => (
                  <a href={item.link} key={ind}>
                    <Typography variant='body2'>{item.text}</Typography>
                  </a>
                ))}
              </Box>
            </Box>
          </Box> */}
        </Box>
      )}
      {tabletWindowSize && (
        <Box className={classes.mobileMenuContainer}>
          <Box className={classes.mobileMenu}>
            {menuItems.slice(0, 4).map((val, index) => (
              <Link
                to={val.link}
                key={index}
                className={
                  pathname.indexOf(val.link) > -1 ? 'active' : 'menuItem'
                }
              >
                <Typography variant='body2'>{val.text}</Typography>
              </Link>
            ))}
            <Box display='flex' className='menuItem'>
              <ThreeDotIcon
                onClick={() => setOpenDetailMenu(!openDetailMenu)}
              />
              {openDetailMenu && (
                <Box
                  position='absolute'
                  bottom={72}
                  right={12}
                  width={209}
                  bgcolor={theme.palette.secondary.dark}
                  borderRadius={20}
                  py={1}
                  border={`1px solid ${theme.palette.divider}`}
                >
                  <Box className='subMenu'>
                    {menuItems.slice(4, menuItems.length).map((val, index) => (
                      <Link
                        to={val.link}
                        key={index}
                        className='menuItem'
                        onClick={() => setOpenDetailMenu(false)}
                      >
                        <Typography variant='body2'>{val.text}</Typography>
                      </Link>
                    ))}
                    {outLinks.map((item, ind) => (
                      <a
                        href={item.link}
                        key={ind}
                        onClick={() => setOpenDetailMenu(false)}
                      >
                        <Typography variant='body2'>{item.text}</Typography>
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
        <Box
          width={36}
          height={36}
          display='flex'
          alignItems='center'
          justifyContent='center'
          marginRight={1}
        >
          <LightIcon />
        </Box>
        {account && (!ethereum || isSupportedNetwork(ethereum)) ? (
          <Box
            id='web3-status-connected'
            className={classes.accountDetails}
            onClick={toggleWalletModal}
          >
            <Typography>{shortenAddress(account)}</Typography>
            <img src={WalletIcon} alt='Wallet' />
          </Box>
        ) : (
          <Box
            className={cx(
              classes.connectButton,
              ethereum && !isSupportedNetwork(ethereum)
                ? classes.danger
                : classes.primary,
            )}
            onClick={() => {
              if (!ethereum || isSupportedNetwork(ethereum)) {
                toggleWalletModal();
              }
            }}
          >
            {ethereum && !isSupportedNetwork(ethereum)
              ? 'Wrong Network'
              : 'Connect Wallet'}
            {ethereum && !isSupportedNetwork(ethereum) && (
              <Box
                position='absolute'
                top={36}
                width={272}
                right={0}
                paddingTop='18px'
              >
                <Box className={classes.wrongNetworkContent}>
                  <Typography variant='body2'>
                    Please switch your wallet to Polygon Network.
                  </Typography>
                  <Box onClick={addMaticToMetamask}>Switch to Polygon</Box>
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
