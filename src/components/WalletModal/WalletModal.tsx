import { useWeb3React } from '@web3-react/core';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import ReactGA from 'react-ga';
import { Box } from '@material-ui/core';
import { ReactComponent as Close } from 'assets/images/CloseIcon.svg';
import { GlobalConst } from 'constants/index';
import { ApplicationModal } from 'state/application/actions';
import {
  useModalOpen,
  useUDDomain,
  useWalletModalToggle,
} from 'state/application/hooks';
import { AccountDetails, CustomModal } from 'components';
import { useTranslation } from 'react-i18next';
import WalletOption from './options';
import PendingView from './PendingView';
import 'components/styles/WalletModal.scss';
import {
  Connection,
  coinbaseWalletConnection,
  getConnections,
  metamaskConnection,
  trustWalletConnection,
  cypherDConnection,
  // phantomConnection,
} from 'connectors';
import {
  getIsBitgetWallet,
  getIsMetaMaskWallet,
  getIsTrustWallet,
} from 'connectors/utils';
import { useSelectedWallet } from 'state/user/hooks';
import { WalletConnect } from 'connectors/WalletConnect';
import { useGetConnection, useMasaAnalytics } from 'hooks';
import { UAuthConnector } from '@uauth/web3-react';
import UAuth from '@uauth/js';
import { useArcxAnalytics } from '@arcxmoney/analytics';

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
  const { t } = useTranslation();
  // important that these are destructed from the account-specific web3-react context
  const { chainId, account, connector, isActive } = useWeb3React();

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);
  const [error, setError] = useState<Error | string | undefined>(undefined);
  const { updateUDDomain } = useUDDomain();
  const { selectedWallet, updateSelectedWallet } = useSelectedWallet();

  const [pendingWallet, setPendingWallet] = useState<Connection | undefined>();

  const [pendingError, setPendingError] = useState<boolean>();

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET);
  const toggleWalletModal = useWalletModalToggle();

  const connections = getConnections();

  const iconify = true;

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setError(undefined);
      setPendingError(false);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [walletModalOpen]);

  const { fireConnectWalletEvent } = useMasaAnalytics();
  const getConnection = useGetConnection();
  useEffect(() => {
    if (account && selectedWallet) {
      const connection = getConnection(selectedWallet);
      fireConnectWalletEvent({
        user_address: account,
        wallet_type: connection.name,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, selectedWallet]);

  const arcxSdk = useArcxAnalytics();
  useEffect(() => {
    if (arcxSdk && account && chainId) {
      arcxSdk.wallet({ chainId, account });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, arcxSdk]);

  const tryActivation = async (connection: Connection) => {
    // log selected wallet
    ReactGA.event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: connection.name,
    });
    setPendingWallet(connection); // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING);

    if (
      chainId &&
      (connection.name === GlobalConst.walletName.WALLET_CONNECT ||
        connection.name === GlobalConst.walletName.ZENGO_CONNECT)
    ) {
      (connection.connector as WalletConnect).setRequiredChains([chainId]);
    }

    try {
      if (connector.deactivate) {
        await connector.deactivate();
      }
      await connector.resetState();
      await connection.connector.activate();
      updateSelectedWallet(connection.type);

      if (
        connection.connector instanceof UAuthConnector &&
        process.env.REACT_APP_UNSTOPPABLE_DOMAIN_CLIENT_ID &&
        process.env.REACT_APP_UNSTOPPABLE_DOMAIN_REDIRECT_URI
      ) {
        const uauth = new UAuth({
          clientID: process.env.REACT_APP_UNSTOPPABLE_DOMAIN_CLIENT_ID,
          redirectUri: process.env.REACT_APP_UNSTOPPABLE_DOMAIN_REDIRECT_URI,
          scope: 'openid wallet',
        });

        try {
          const user = await uauth.user();
          updateUDDomain(user.sub);
          setWalletView(WALLET_VIEWS.ACCOUNT);
        } catch {
          setError('User does not exist.');
        }
      } else {
        updateUDDomain(undefined);
        setWalletView(WALLET_VIEWS.ACCOUNT);
      }
    } catch (e) {
      setPendingError(true);
    }
  };

  // close wallet modal if fortmatic modal is active
  // useEffect(() => {
  //   fortmatic.on(OVERLAY_READY, () => {
  //     toggleWalletModal();
  //   });
  // }, [toggleWalletModal]);

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const { ethereum, web3, phantom } = window as any;
    const isMetamask = getIsMetaMaskWallet();
    const isBlockWallet = ethereum && ethereum.isBlockWallet;
    const isCypherD = ethereum && ethereum.isCypherD;
    const isBitget = getIsBitgetWallet();
    const isTrustWallet = getIsTrustWallet();
    // const isBraveWallet = ethereum && ethereum.isBraveWallet;
    // const isPhantomWallet =
    //   (ethereum && ethereum.isPhantom) || (phantom && phantom.ethereum);
    const isCoinbaseWallet = ethereum && ethereum.isCoinbaseWallet;
    // const isOkxwallet = (window as any).okxwallet;
    const isDefiConnectProvider = (window as any).deficonnectProvider;

    return connections.map((option) => {
      // if (
      //   option.name === GlobalConst.walletName.PHANTOM_WALLET &&
      //   !isPhantomWallet
      // ) {
      //   return (
      //     <WalletOption
      //       id={`connect-${option.key}`}
      //       key={option.key}
      //       color={option.color}
      //       header={t('installPhantom')}
      //       subheader={null}
      //       link={'https://phantom.app/download'}
      //       icon={option.iconName}
      //       iconify={iconify}
      //     />
      //   );
      // } else
      if (
        option.name === GlobalConst.walletName.BLOCKWALLET &&
        !isBlockWallet
      ) {
        return (
          <WalletOption
            id={`connect-${option.name}`}
            key={option.name}
            color={option.color}
            header={t('installBlock')}
            subheader={null}
            link={
              'https://chrome.google.com/webstore/detail/blockwallet/bopcbmipnjdcdfflfgjdgdjejmgpoaab'
            }
            icon={option.iconName}
            iconify={iconify}
          />
        );
        // } else if (
        //   option.name === GlobalConst.walletName.BRAVEWALLET &&
        //   !isBraveWallet
        // ) {
        //   return (
        //     <WalletOption
        //       id={`connect-${option.name}`}
        //       key={option.name}
        //       color={'#E8831D'}
        //       header={t('installBrave')}
        //       subheader={t('installBraveDesc')}
        //       link={'https://brave.com/wallet'}
        //       icon={option.iconName}
        //       iconify={iconify}
        //     />
        //   );
      } else if (option.name === GlobalConst.walletName.BITGET && !isBitget) {
        return (
          <WalletOption
            id={`connect-${option.name}`}
            key={option.name}
            color={'#E8831D'}
            header={t('installBitget')}
            subheader={null}
            link={'https://bitkeep.com/en/download'}
            icon={option.iconName}
            iconify={iconify}
          />
        );
      } else if (
        option.name === GlobalConst.walletName.TRUST_WALLET &&
        !isTrustWallet
      ) {
        return (
          <WalletOption
            id={`connect-${option.name}`}
            key={option.name}
            color={'#E8831D'}
            header={t('installTrustWallet')}
            subheader={null}
            link={'https://trustwallet.com/'}
            icon={option.iconName}
            iconify={iconify}
          />
        );
      } else if (
        option.name === GlobalConst.walletName.METAMASK &&
        !isMetamask
      ) {
        return (
          <WalletOption
            id={`connect-${option.name}`}
            key={option.name}
            color={'#E8831D'}
            header={t('installMetamask')}
            subheader={null}
            link={'https://metamask.io/'}
            icon={option.iconName}
            iconify={iconify}
          />
        );
        // } else if (
        //   option.name === GlobalConst.walletName.OKXWALLET &&
        //   !isOkxwallet
        // ) {
        //   return (
        //     <WalletOption
        //       id={`connect-${option.name}`}
        //       key={option.name}
        //       color={'#E8831D'}
        //       header={t('installOkxWallet')}
        //       subheader={null}
        //       link={'https://www.okx.com/web3'}
        //       icon={option.iconName}
        //       iconify={iconify}
        //     />
        //   );
      } else if (
        option.name === GlobalConst.walletName.CRYPTOCOM &&
        !isDefiConnectProvider
      ) {
        return (
          <WalletOption
            id={`connect-${option.name}`}
            key={option.name}
            color={'#E8831D'}
            header={t('installCryptocom')}
            subheader={null}
            link={
              'https://chrome.google.com/webstore/detail/cryptocom-wallet-extensio/hifafgmccdpekplomjjkcfgodnhcellj'
            }
            icon={option.iconName}
            iconify={iconify}
          />
        );
      }

      // check for mobile options
      if (isMobile) {
        if (!web3 && !ethereum && option.mobile) {
          return (
            <WalletOption
              onClick={() => {
                option.connector !== connector &&
                  !option.href &&
                  tryActivation(option);
              }}
              id={`connect-${option.key}`}
              key={option.key}
              active={isActive && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={option.iconName}
              installLink={option.installLink}
              iconify={iconify}
            />
          );
        } else if (
          ethereum &&
          (option.mobile ||
            (isCypherD && option.connector === cypherDConnection.connector) ||
            (isMetamask && option.connector === metamaskConnection.connector) ||
            // (isPhantomWallet &&
            //   option.connector === phantomConnection.connector) ||
            (isTrustWallet &&
              option.connector === trustWalletConnection.connector) ||
            (isCoinbaseWallet &&
              option.connector === coinbaseWalletConnection.connector))
        ) {
          return (
            <WalletOption
              onClick={() => {
                if (option.connector === connector && account) {
                  setWalletView(WALLET_VIEWS.ACCOUNT);
                } else {
                  if (!option.href) {
                    tryActivation(option);
                  }
                }
              }}
              id={`connect-${option.key}`}
              key={option.key}
              active={isActive && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={option.iconName}
              installLink={option.installLink}
              iconify={iconify}
            />
          );
        }
        return null;
      }

      if (option.name === GlobalConst.walletName.CYPHERD && !isCypherD) {
        return null;
      } else if (
        option.name === GlobalConst.walletName.BLOCKWALLET &&
        !isBlockWallet
      ) {
        return null;
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <WalletOption
            id={`connect-${option.key}`}
            onClick={() => {
              isActive && option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option);
            }}
            key={option.key}
            active={isActive && option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={option.iconName}
            installLink={option.installLink}
            iconify={iconify}
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
            <Close className='cursor-pointer' onClick={toggleWalletModal} />
          </Box>
          <Box mt={2} textAlign='center'>
            <h6>{t('errorConnect')}</h6>
          </Box>
          <Box mt={3} mb={2} textAlign='center'>
            <small>{t('errorConnectRefresh')}</small>
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
      <Box paddingTop={4}>
        <Box paddingX={3}>
          <Box className='flex justify-between'>
            <h6>{t('connectWallet')}</h6>
            <Close className='cursor-pointer' onClick={toggleWalletModal} />
          </Box>
          <Box my={1} className='walletDescriptionContainer'>
            <p className='small text-secondary'>{t('walletDescription')}</p>
            <p className='small text-secondary'>
              {t('installedMetamaskNotDisplayedWarning')}
            </p>
          </Box>
          <Box>
            {walletView === WALLET_VIEWS.PENDING ? (
              <PendingView
                connection={pendingWallet}
                error={pendingError}
                setPendingError={setPendingError}
                tryActivation={tryActivation}
              />
            ) : (
              <Box
                className={
                  iconify ? 'option-container-iconify' : 'option-container'
                }
              >
                {getOptions()}
              </Box>
            )}
          </Box>
        </Box>
        {walletView !== WALLET_VIEWS.PENDING && (
          <Box paddingY={2.5} className={iconify ? 'blurb-iconify' : 'blurb'}>
            <small>{t('newToMatic')}</small>
            <a
              href='https://wiki.polygon.technology/docs/tools/wallets/getting-started'
              target='_blank'
              rel='noopener noreferrer'
            >
              <small>{t('learnWallet')} ↗</small>
            </a>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <CustomModal
      modalWrapper='walletModalWrapper'
      open={walletModalOpen}
      onClose={toggleWalletModal}
    >
      <Box>{getModalContent()}</Box>
    </CustomModal>
  );
};

export default WalletModal;
