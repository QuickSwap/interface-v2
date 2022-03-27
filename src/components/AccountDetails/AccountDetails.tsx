import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { AppDispatch } from 'state';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { clearAllTransactions } from 'state/transactions/actions';
import { shortenAddress, getEtherscanLink } from 'utils';
import { SUPPORTED_WALLETS } from 'constants/index';
import { ReactComponent as Close } from 'assets/images/CloseIcon.svg';
import { injected, walletlink, safeApp } from 'connectors';
import { ExternalLink as LinkIcon } from 'react-feather';
import StatusIcon from './StatusIcon';
import Copy from './CopyHelper';
import Transaction from './Transaction';

const useStyles = makeStyles(({ palette }) => ({
  addressLink: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    color: palette.text.primary,
    '& p': {
      marginLeft: 4,
    },
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

function renderTransactions(transactions: string[]) {
  return (
    <>
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />;
      })}
    </>
  );
}

interface AccountDetailsProps {
  toggleWalletModal: () => void;
  pendingTransactions: string[];
  confirmedTransactions: string[];
  ENSName?: string;
  openOptions: () => void;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions,
}) => {
  const { chainId, account, connector } = useActiveWeb3React();
  const classes = useStyles();
  const { palette } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  function formatConnectorName() {
    const { ethereum } = window as any;
    const isMetaMask = !!(
      ethereum &&
      !ethereum.isBitKeep &&
      ethereum.isMetaMask
    );
    const isBitkeep = !!(ethereum && ethereum.isBitKeep);
    const isBlockWallet = !!(ethereum && ethereum.isBlockWallet);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        (k) =>
          SUPPORTED_WALLETS[k].connector === connector &&
          (connector !== injected ||
            (isBlockWallet && k === 'BLOCKWALLET') ||
            (isBitkeep && k === 'BITKEEP') ||
            (isMetaMask && k === 'METAMASK')),
      )
      .map((k) => SUPPORTED_WALLETS[k].name)[0];
    return <Typography variant='body2'>Connected with {name}</Typography>;
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }));
  }, [dispatch, chainId]);

  return (
    <Box paddingX={3} paddingY={4}>
      <Box display='flex' justifyContent='space-between'>
        <Typography variant='h5'>Account</Typography>
        <Close style={{ cursor: 'pointer' }} onClick={toggleWalletModal} />
      </Box>
      <Box
        mt={2}
        padding={2}
        borderRadius={10}
        bgcolor={palette.secondary.dark}
      >
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          {formatConnectorName()}
          <Box display='flex' alignItems='center'>
            {connector !== injected &&
              connector !== walletlink &&
              connector !== safeApp && (
                <Typography
                  style={{ cursor: 'pointer', marginRight: 8 }}
                  onClick={() => {
                    (connector as any).close();
                  }}
                  variant='body2'
                >
                  Disconnect
                </Typography>
              )}
            {connector !== safeApp && (
              <Typography
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  openOptions();
                }}
                variant='body2'
              >
                Change
              </Typography>
            )}
          </Box>
        </Box>
        <Box display='flex' alignItems='center' my={1.5}>
          <StatusIcon />
          <Typography
            variant='h5'
            style={{ marginLeft: 8 }}
            id='web3-account-identifier-row'
          >
            {ENSName ? ENSName : account && shortenAddress(account)}
          </Typography>
        </Box>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          {account && (
            <Copy toCopy={account}>
              <span style={{ marginLeft: '4px' }}>Copy Address</span>
            </Copy>
          )}
          {chainId && account && (
            <a
              className={classes.addressLink}
              href={
                chainId &&
                getEtherscanLink(
                  chainId,
                  ENSName ? ENSName : account,
                  'address',
                )
              }
              target='_blank'
              rel='noreferrer'
            >
              <LinkIcon size={16} />
              <Typography variant='body2'>View on Block Explorer</Typography>
            </a>
          )}
        </Box>
      </Box>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            paddingX={2}
            pt={2}
            mb={1}
          >
            <Typography variant='body2'>Recent Transactions</Typography>
            <Typography
              variant='body2'
              style={{ cursor: 'pointer' }}
              onClick={clearAllTransactionsCallback}
            >
              Clear all
            </Typography>
          </Box>
          <Box paddingX={2} flex={1} overflow='auto'>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </Box>
        </>
      ) : (
        <Box paddingX={2} pt={2}>
          <Typography variant='body2'>
            Your transactions will appear here...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AccountDetails;
