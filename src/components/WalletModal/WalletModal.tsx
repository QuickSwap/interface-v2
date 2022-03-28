import { AbstractConnector } from '@web3-react/abstract-connector';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import ReactGA from 'react-ga';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MetamaskIcon from 'assets/images/metamask.png';
import { ReactComponent as Close } from 'assets/images/CloseIcon.svg';
import { fortmatic, injected, portis, safeApp } from 'connectors';
import { OVERLAY_READY } from 'connectors/Fortmatic';
import { GlobalConst, SUPPORTED_WALLETS } from 'constants/index';
import usePrevious from 'hooks/usePrevious';
import { ApplicationModal } from 'state/application/actions';
import { useModalOpen, useWalletModalToggle } from 'state/application/hooks';
import { AccountDetails, CustomModal } from 'components';

import Option from './Option';
import PendingView from './PendingView';

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
    },
  },
  blurb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& a': {
      marginLeft: 8,
      color: palette.primary.main,
      textDecoration: 'none',
    },
  },
}));

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
};

interface WalletModalProps {
  pendingTransactions: string[]; // hashes of pending
  confirmedTransactions: string[]; // hashes of confirmed
  ENSName?: string;
}

const WalletModal: React.FC<WalletModalProps> = ({
  pendingTransactions,
  confirmedTransactions,
  ENSName,
}) => {
  const classes = useStyles();
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error } = useWeb3React();

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

  const [pendingWallet, setPendingWallet] = useState<
    AbstractConnector | undefined
  >();

  const [pendingError, setPendingError] = useState<boolean>();

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET);
  const toggleWalletModal = useWalletModalToggle();

  const previousAccount = usePrevious(account);

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal();
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen]);

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [walletModalOpen]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);
  useEffect(() => {
    if (
      walletModalOpen &&
      ((active && !activePrevious) ||
        (connector && connector !== connectorPrevious && !error))
    ) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [
    setWalletView,
    active,
    error,
    connector,
    walletModalOpen,
    activePrevious,
    connectorPrevious,
  ]);

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = '';
    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name);
      }
      return true;
    });
    // log selected wallet
    ReactGA.event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: name,
    });
    setPendingWallet(connector); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      connector.walletConnectProvider = undefined;
    }

    connector &&
      activate(connector, undefined, true).catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector); // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true);
        }
      });
  };

  // close wallet modal if fortmatic modal is active
  useEffect(() => {
    fortmatic.on(OVERLAY_READY, () => {
      toggleWalletModal();
    });
  }, [toggleWalletModal]);

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const { ethereum, web3 } = window as any;
    const isMetamask = ethereum && !ethereum.isBitKeep && ethereum.isMetaMask;
    const isBlockWallet = ethereum && ethereum.isBlockWallet;
    const isBitKeep = ethereum && ethereum.isBitKeep;
    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key];
      //disable safe app by in the list
      if (option.connector === safeApp) {
        return null;
      }
      // check for mobile options
      if (isMobile) {
        //disable portis on mobile for now
        if (option.connector === portis) {
          return null;
        }

        if (!web3 && !ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector &&
                  !option.href &&
                  tryActivation(option.connector);
              }}
              id={`connect-${key}`}
              key={key}
              active={
                option.connector === connector &&
                (connector !== injected ||
                  isBlockWallet ===
                    (option.name === GlobalConst.walletName.BLOCKWALLET) ||
                  isBitKeep ===
                    (option.name === GlobalConst.walletName.BITKEEP) ||
                  isMetamask ===
                    (option.name === GlobalConst.walletName.METAMASK))
              }
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={option.iconName}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(web3 || ethereum)) {
          if (option.name === GlobalConst.walletName.METAMASK) {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Metamask'}
                subheader={null}
                link={'https://metamask.io/'}
                icon={MetamaskIcon}
              />
            );
          } else {
            return null; //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (
          option.name === GlobalConst.walletName.METAMASK &&
          !isMetamask
        ) {
          return null;
        } else if (
          option.name === GlobalConst.walletName.BITKEEP &&
          !isBitKeep
        ) {
          return null;
        } else if (
          option.name === GlobalConst.walletName.BLOCKWALLET &&
          !isBlockWallet
        ) {
          return null;
        }
        // likewise for generic
        else if (
          option.name === GlobalConst.walletName.INJECTED &&
          (isMetamask || isBitKeep || isBlockWallet)
        ) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector);
            }}
            key={key}
            active={
              option.connector === connector &&
              (connector !== injected ||
                isBlockWallet ===
                  (option.name === GlobalConst.walletName.BLOCKWALLET) ||
                isBitKeep ===
                  (option.name === GlobalConst.walletName.BITKEEP) ||
                isMetamask ===
                  (option.name === GlobalConst.walletName.METAMASK))
            }
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={option.iconName}
          />
        )
      );
    });
  }

  function getModalContent() {
    if (error) {
      return (
        <Box position='relative'>
          <Box position='absolute' top='16px' right='16px' display='flex'>
            <Close style={{ cursor: 'pointer' }} onClick={toggleWalletModal} />
          </Box>
          <Box mt={2} textAlign='center'>
            <Typography variant='subtitle2'>
              {error instanceof UnsupportedChainIdError
                ? 'Wrong Network'
                : 'Error connecting'}
            </Typography>
          </Box>
          <Box mt={3} mb={2} textAlign='center'>
            <Typography variant='body2'>
              {error instanceof UnsupportedChainIdError
                ? 'Please connect to the appropriate Polygon network.'
                : 'Error connecting. Try refreshing the page.'}
            </Typography>
          </Box>
        </Box>
      );
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pendingTransactions}
          confirmedTransactions={confirmedTransactions}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      );
    }
    return (
      <Box paddingX={3} paddingY={4}>
        <Box display='flex' justifyContent='space-between'>
          <Typography variant='h5'>Connect wallet</Typography>
          <Close style={{ cursor: 'pointer' }} onClick={toggleWalletModal} />
        </Box>
        <Box mt={4}>
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            getOptions()
          )}
          {walletView !== WALLET_VIEWS.PENDING && (
            <Box className={classes.blurb}>
              <Typography variant='body2'>New to Matic?</Typography>
              <a
                href='https://docs.matic.network/docs/develop/wallets/getting-started'
                target='_blank'
                rel='noreferrer'
              >
                <Typography variant='body2'>Learn about Wallets ↗</Typography>
              </a>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <CustomModal open={walletModalOpen} onClose={toggleWalletModal}>
      <Box
        maxHeight='80vh'
        display='flex'
        flexDirection='column'
        overflow='auto'
      >
        {getModalContent()}
      </Box>
    </CustomModal>
  );
};

export default WalletModal;
