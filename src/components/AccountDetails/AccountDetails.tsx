import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { AppDispatch } from 'state';
import { Box, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { clearAllTransactions } from 'state/transactions/actions';
import { shortenAddress, getEtherscanLink } from 'utils';
import { SUPPORTED_WALLETS } from 'constants/index';
import { ReactComponent as Close } from 'assets/images/x.svg';
import { injected, walletconnect, walletlink, fortmatic, portis, safeApp } from 'connectors';
import MetamaskIcon from 'assets/images/metamask.png';
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg';
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg';
import FortmaticIcon from 'assets/images/fortmaticIcon.png';
import PortisIcon from 'assets/images/portisIcon.png';
import { ExternalLink as LinkIcon } from 'react-feather';
import Copy from './CopyHelper';
import Transaction from './Transaction';

const useStyles = makeStyles(({ palette }) => ({
  closeIcon: {
    position: 'absolute',
    right: '1rem',
    top: 14,
    '& svg': {
      stroke: palette.primary.dark,
    },
    '&:hover': {
      cursor: 'pointer',
      opacity: 0.6,
    }
  },
  headerRow: {
    padding: '1rem',
    fontSize: '1.25rem',
    fontWeight: 500,
    color: palette.primary.dark,
  },
  infoCard: {
    padding: '1rem',
    border: `1px solid ${palette.divider}`,
    borderRadius: 20,
    position: 'relative',
  },
  accountGroupingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 400,
    color: palette.text.primary,
    '& div': {
      display: 'flex',
      alignItems: 'center'
    }
  },
  accountSection: {
    padding: '0rem 1rem'
  },
  yourAccount: {
    '& h5': {
      margin: '0 0 1rem 0',
      fontWeight: 400
    },  
    '& h4': {
      margin: 0,
      fontWeight: 500
    }
  },
  accountControl: {
    display: 'flex',
    justifyContent: 'space-between',
    minWidth: 0,
    width: '100%',
    fontWeight: 500,
    fontSize: '1.25rem',

    '& a:hover': {
      textDecoration: 'underline'
    },

    '& img': {
      width: 20
    },

    '& p': {
      color: palette.primary.dark,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      margin: '8px'
    }
  },
  addressLink: {
    fontSize: '0.825rem',
    color: palette.primary.dark,
    marginLeft: '1rem',
    display: 'flex',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  walletName: {
    width: 'initial',
    fontSize: '0.825rem',
    fontWeight: 500,
    color: palette.primary.dark
  },
  walletAction: {
    width: 'fit-content',
    fontWeight: 400,
    marginLeft: 8,
    fontSize: '0.825rem',
    padding: '4px 6px',
    '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  },
  upperSection: {
    position: 'relative',
    background: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    '& h5': {
      margin: 0,
      marginBottom: '0.5rem',
      fontSize: '1rem',
      fontWeight: 400,
      '&:last-child': {
        marginBottom: 0        
      }
    },
    '& h4': {
      marginTop: 0,
      fontWeight: 500
    }
  },
  lowerSection: {
    padding: '1.5rem',
    flexGrow: 1,
    overflow: 'auto',
    backgroundColor: palette.background.paper,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 20,
    '& p': {
      margin: 0,
      fontWeight: 400,
      color: palette.primary.dark
    }
  }
}));

function renderTransactions(transactions: string[]) {
  return (
    <Box>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />
      })}
    </Box>
  )
}

interface AccountDetailsProps {
  toggleWalletModal: () => void
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  openOptions: () => void
}

const AccountDetails: React.FC<AccountDetailsProps> = ({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions
}) => {
  const { chainId, account, connector } = useActiveWeb3React()
  const classes = useStyles();
  const dispatch = useDispatch<AppDispatch>()

  function formatConnectorName() {
    const { ethereum } = (window as any)
    const isMetaMask = !!(ethereum && ethereum.isMetaMask)
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        k =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
      )
      .map(k => SUPPORTED_WALLETS[k].name)[0]
    return <Box className={classes.walletName}>Connected with {name}</Box>
  }

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <Box>
          <img src={MetamaskIcon} alt={'metamask logo'} />
        </Box>
      )
    } else if (connector === walletconnect) {
      return (
        <Box>
          <img src={WalletConnectIcon} alt={'wallet connect logo'} />
        </Box>
      )
    } else if (connector === walletlink) {
      return (
        <Box>
          <img src={CoinbaseWalletIcon} alt={'coinbase wallet logo'} />
        </Box>
      )
    } else if (connector === fortmatic) {
      return (
        <Box>
          <img src={FortmaticIcon} alt={'fortmatic logo'} />
        </Box>
      )
    } else if (connector === portis) {
      return (
        <Box>
          <img src={PortisIcon} alt={'portis logo'} />
          <Button className={classes.walletAction}
            onClick={() => {
              portis.portis.showPortis()
            }}
          >
            Show Portis
          </Button>
        </Box>
      )
    }
    return null
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }))
  }, [dispatch, chainId])

  return (
    <>
      <Box className={classes.upperSection}>
        <Box className={classes.closeIcon} onClick={toggleWalletModal}>
          <Close />
        </Box>
        <Box className={classes.headerRow}>Account</Box>
        <Box className={classes.accountSection}>
          <Box className={classes.yourAccount}>
            <Box className={classes.infoCard}>
              <Box className={classes.accountGroupingRow}>
                {formatConnectorName()}
                <div>
                  {connector !== injected && connector !== walletlink && connector !== safeApp && (
                    <Button className={classes.walletAction}
                      style={{ fontSize: '.825rem', fontWeight: 400, marginRight: '8px' }}
                      onClick={() => {
                        ;(connector as any).close()
                      }}
                    >
                      Disconnect
                    </Button>
                  )}
                  {connector !== safeApp && (
                    <Button className={classes.walletAction}
                      onClick={() => {
                        openOptions()
                      }}
                    >
                      Change
                    </Button>
                  )}
                </div>
              </Box>
              <Box className={classes.accountGroupingRow} id="web3-account-identifier-row">
                <Box className={classes.accountControl}>
                  {ENSName ? (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p> {ENSName}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        {getStatusIcon()}
                        <p> {account && shortenAddress(account)}</p>
                      </div>
                    </>
                  )}
                </Box>
              </Box>
              <Box className={classes.accountGroupingRow}>
                {ENSName ? (
                  <>
                    <Box className={classes.accountControl}>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span style={{ marginLeft: '4px' }}>Copy Address</span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <a className={classes.addressLink} href={chainId && getEtherscanLink(chainId, ENSName, 'address')}>
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: '4px' }}>View on Block Explorer</span>
                          </a>
                        )}
                      </div>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box className={classes.accountControl}>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span style={{ marginLeft: '4px' }}>Copy Address</span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <a className={classes.addressLink} href={getEtherscanLink(chainId, account, 'address')}>
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: '4px' }}>View on Block Explorer</span>
                          </a>
                        )}
                      </div>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <Box className={classes.lowerSection}>
          <Box>
            <Typography>Recent Transactions</Typography>
            <Button onClick={clearAllTransactionsCallback}>(clear all)</Button>
          </Box>
          {renderTransactions(pendingTransactions)}
          {renderTransactions(confirmedTransactions)}
        </Box>
      ) : (
        <Box className={classes.lowerSection}>
          <Typography>Your transactions will appear here...</Typography>
        </Box>
      )}
    </>
  )
}

export default AccountDetails;
