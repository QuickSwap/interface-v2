import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  useMediaQuery
} from '@material-ui/core';
import cx from 'classnames';
import Hamburger from 'hamburger-react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useWalletModalToggle } from 'state/application/hooks';
import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks';
import { TransactionDetails } from 'state/transactions/reducer'
import { shortenAddress, addMaticToMetamask } from 'utils';
import useENSName from 'hooks/useENSName';
import { WalletModal } from 'components';
import { useActiveWeb3React, useInitTransak } from 'hooks';
import StatusIcon from 'components/AccountDetails/StatusIcon';
import QuickLogo from 'assets/images/quickLogo.svg';
import { ReactComponent as PolygonIcon } from 'assets/images/Currency/Polygon.svg';
import { ReactComponent as QuickIcon } from 'assets/images/quickIcon.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  header: {
    padding: '0 40px',
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    minHeight: 88,
    zIndex: 3,
    justifyContent: 'space-between',
    '& a': {
      display: 'flex'
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
              marginRight: 8
            }
          },
          '&:last-child': {
            padding: '0 32px'
          },
          '& p': {
            fontSize: 16
          }
        }
      }
    },
    [breakpoints.down('xs')]: {
      padding: '0 16px'
    }
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
      color: 'rgba(255, 255, 255, 0.87)'
    },
    [breakpoints.down('xs')]: {
      display: 'none'
    }
  },
  mainMenu: {
    display: 'flex',
    alignItems: 'center',
    '& a': {
      textDecoration: 'none',
      color: 'white',
      marginRight: 20,
      '&:last-child': {
        marginRight: 0
      }
    }
  },
  accountDetails: {
    border: `1px solid ${palette.divider}`,
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    '& > div': {
      display: 'flex',
      '& button': {
        display: 'none'
      }
    },
    '& img': {
      width: 20,
      marginRight: 6
    }
  },
  mobileMenuWrapper: {
    background: 'white',
    position: 'absolute',
    top: 80,
    left: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    '& a': {
      textDecoration: 'none',
    },
    '& button': {
      width: 'calc(100% - 24px)',
      margin: '8px 12px'
    }
  },
  mobileMenuItemWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '4px 0',
    height: 32,
    width: '100%',
    '& p': {
      color: palette.primary.dark,
    },
    '& svg, & img': {
      width: 32,
      height: 32,
      marginRight: 8
    }
  },
  menuTransition: {
    height: 0,
    transition: 'height 0.5s',
    overflow: 'auto'
  },
  menuOpen: {
    height: 'calc(100vh - 80px)',
  }
}));

const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => {
  return b.addedTime - a.addedTime
}

const Header: React.FC = () => {
  const classes = useStyles();
  const { account } = useActiveWeb3React();
  const { ENSName } = useENSName(account ?? undefined)
  const { ethereum } = (window as any);
  const theme = useTheme();
  const { initTransak } = useInitTransak();
  const allTransactions = useAllTransactions();
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions]);

  const pending = sortedRecentTransactions.filter((tx: any) => !tx.receipt).map((tx: any) => tx.hash)
  const confirmed = sortedRecentTransactions.filter((tx: any) => tx.receipt).map((tx: any) => tx.hash)
  const isnotMatic = ethereum && ethereum.isMetaMask && Number(ethereum.chainId) !== 137;
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('sm'));
  const toggleWalletModal = useWalletModalToggle();
  const [ menuOpen, setMenuOpen ] = useState(false);
  const menuItems = [
    {
      link: '/',
      text: 'EXCHANGE'
    },
    {
      link: '/',
      text: 'Rewards',
    },
    {
      link: '/',
      text: 'ANALYTICS',
    },
    {
      link: '/',
      text: 'DEVELOPERS',
    },
    {
      link: 'https://idos.starter.xyz/quickstart',
      text: 'IDO',
      linkOutside: true
    },
    {
      link: '/',
      text: 'ABOUT'
    }
  ]

  return (
    <Box className={classes.header}>
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
      <Box>
        <Link to='/'>
          <img src={QuickLogo} alt='QuickLogo' />
        </Link>
        <Box className={classes.networkWrapper}>
          <PolygonIcon />
          <Typography>Polygon</Typography>
        </Box>
      </Box>
      {
        !mobileWindowSize &&
          <Box className={classes.mainMenu}>
            {
              menuItems.map((val, index) => (
                val.linkOutside ?
                  <a href={val.link} key={index} target='_blank' rel='noreferrer'>
                    <Typography>{ val.text }</Typography>
                  </a>
                :
                  <Link to={val.link} key={index}>
                    <Typography>{ val.text }</Typography>
                  </Link>
              ))
            }
          </Box>
      }
      {
        mobileWindowSize ?
          <Hamburger toggled={menuOpen} toggle={setMenuOpen} />
        :
          <Box>
            <Button variant='contained' color='secondary' onClick={() => initTransak(account, mobileWindowSize, 'QUICK')}>
              <QuickIcon />
              <Typography>Buy Quick</Typography>
            </Button>
            {
              account ? 
                <Box className={classes.accountDetails} onClick={toggleWalletModal}><StatusIcon /><Typography>{ shortenAddress(account) }</Typography></Box>
                :
                <Button color='primary' onClick={() => { isnotMatic ? addMaticToMetamask() : toggleWalletModal() }}>
                  <Typography>{ isnotMatic ? 'Switch to Matic' : 'Connect' }</Typography>
                </Button>
            }
          </Box>
      }
      {
        mobileWindowSize &&
          <Box className={cx(classes.mobileMenuWrapper, classes.menuTransition, menuOpen && classes.menuOpen)}>
            {
              menuItems.map((val, index) => (
                val.linkOutside ?
                  <Box className={classes.mobileMenuItemWrapper}>
                    <a href={val.link} key={index} target='_blank' rel='noreferrer'>
                      <Typography>{ val.text }</Typography>
                    </a>
                  </Box>
                :
                  <Box className={classes.mobileMenuItemWrapper}>
                    <Link to={val.link} key={index}>
                      <Typography>{ val.text }</Typography>
                    </Link>
                  </Box>
              ))
            }
            <Box className={classes.mobileMenuItemWrapper} onClick={() => initTransak(account, mobileWindowSize, 'QUICK')}>
              <QuickIcon />
              <Typography>Buy Quick</Typography>
            </Box>
            {
              account ? 
                <Box className={classes.mobileMenuItemWrapper} onClick={toggleWalletModal}><StatusIcon /><Typography>{ shortenAddress(account) }</Typography></Box>
                :
                <Button color='primary' onClick={() => { isnotMatic ? addMaticToMetamask() : toggleWalletModal() }}>
                  <Typography>{ isnotMatic ? 'Switch to Matic' : 'Connect Wallet' }</Typography>
                </Button>
            }
          </Box>
      }
    </Box>
  );
};

export default Header;
