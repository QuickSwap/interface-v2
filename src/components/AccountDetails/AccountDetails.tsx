import { useArcxAnalytics } from '@arcxmoney/analytics';
import { Box, Snackbar, Typography } from '@material-ui/core';
import ReplayIcon from '@material-ui/icons/Replay';
import 'components/styles/AccountDetails.scss';
import { useActiveWeb3React } from 'hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'state';
import { useUDDomain } from 'state/application/hooks';
import { clearAllTransactions } from 'state/transactions/actions';
import { useSelectedWallet } from 'state/user/hooks';
import { getEtherscanLink, getWalletKeys, shortenAddress } from 'utils';
import StatusIcon from './StatusIcon';
import Transaction from './Transaction';
import swapIcon from 'assets/images/icons/swap.svg';
import globalIcon from 'assets/images/icons/global.webp';
import logout from 'assets/images/icons/logout.svg';
import copyIcon from 'assets/images/icons/copy.svg';
import cogIcon from 'assets/images/icons/cog.png';
import walletIcon from 'assets/images/icons/wallet.png';
import {
  currencyEquals,
  Token,
  CurrencyAmount,
  ChainId,
  WETH,
} from '@uniswap/sdk';
import { Link } from 'react-router-dom';
import {
  useAllTokenBalances,
  useCurrencyBalance,
  useETHBalances,
} from 'state/wallet/hooks';
import { networkConnection } from 'connectors';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';
import { Currency } from '@uniswap/sdk';
import { useDefaultCurrencies } from 'state/zap/hooks';
import { ethers } from 'ethers';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import {
  DLQUICK,
  ETHER,
  nativeTokenSymbols,
  wrappedTokenAddresses,
} from 'constants/v3/addresses';
import useCopyClipboard from 'hooks/useCopyClipboard';
import MeldModal from 'components/MeldModal';
import { Alert } from '@material-ui/lab';
import SettingsModal from 'components/SettingsModal';

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
  const { chainId, account, connector, provider } = useActiveWeb3React();
  const { udDomain, updateUDDomain } = useUDDomain();
  const [isC, staticCopy] = useCopyClipboard();
  const { updateSelectedWallet } = useSelectedWallet();
  const [showMeldWidget, setShowMeldWidgetWidget] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const arcxSdk = useArcxAnalytics();
  const [balance, setBalance] = useState<string | null>(null);
  const tokenAddress =
    wrappedTokenAddresses[chainId as keyof typeof wrappedTokenAddresses];

  const price = useUSDCPriceFromAddress(tokenAddress);

  const getCurrentBalance = async () => {
    if (!account || !provider) return null;
    const balance = await provider?.getBalance(account || '');

    setBalance(ethers.utils.formatEther(balance || '0'));
  };

  useEffect(() => {
    getCurrentBalance();
  }, [account, provider]);

  function formatConnectorName() {
    const name = getWalletKeys(connector, chainId).map(
      (connection) => connection.name,
    )[0];
    return (
      <small>
        {t('connectedWith')} {name}
      </small>
    );
  }

  const handleClose = () => {
    setOpen(false);
  };

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }));
  }, [dispatch, chainId]);

  const links = [
    {
      icon: <img src={swapIcon} alt='swap icon' />,
      name: 'View transactions',
      url: '#',
    },
    {
      icon: <img src={copyIcon} alt='copy icon' />,
      name: 'Copy address',
      url: '#',
      onClick: () => {
        staticCopy(account || '');
        setOpen(true);
      },
    },
    {
      icon: (
        <img
          src={globalIcon}
          alt='global icon'
          width={'24px'}
          height={'24px'}
        />
      ),
      name: 'View on explorer',
      url: getEtherscanLink(
        chainId,
        ENSName ? ENSName : account || '',
        'address',
      ),
    },
    {
      icon: (
        <img
          src={cogIcon}
          alt='cog icon'
          width='20px'
          height='20px'
          style={{ marginLeft: '2px' }}
        />
      ),
      name: 'Settings',
      url: '#',
      onClick: () => {
        setIsSettingOpen(true);
      },
    },
    {
      icon: <img src={walletIcon} alt='wallet icon' />,
      name: 'Buy crypto with fiat',
      url: '#',
      onClick: () => {
        setShowMeldWidgetWidget(true);
      },
    },
    {
      icon: <img src={logout} alt='logout icon' />,
      name: t('disconnect'),
      url: '#',
      onClick: async () => {
        if (arcxSdk) {
          await arcxSdk.disconnection({ account, chainId });
        }
        if (connector && connector.deactivate) {
          await connector.deactivate();
        }
        await connector.resetState();
        updateSelectedWallet(undefined);

        const localChainId = localStorage.getItem('localChainId');
        await networkConnection.connector.activate(Number(localChainId));
      },
    },
  ];

  const handleCloseSettingModal = () => {
    setIsSettingOpen(false);
  };

  return (
    <Box sx={{ padding: '16px', border: 'solid 1px #282d3d' }}>
      {/* <Box className='flex justify-between'>
        <h5 className='text-bold'>{t('account')}</h5>
        <Close className='cursor-pointer' onClick={toggleWalletModal} />
      </Box> */}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity='success'>
          Copy to clipboard
        </Alert>
      </Snackbar>
      <SettingsModal open={isSettingOpen} onClose={handleCloseSettingModal} />
      {showMeldWidget && (
        <MeldModal
          open={showMeldWidget}
          onClose={() => setShowMeldWidgetWidget(false)}
        />
      )}
      <Box className='flex items-center justify-between'>
        <Box className='flex items-center' style={{ gap: '14px' }}>
          <StatusIcon />
          <Typography
            style={{ fontSize: '16px' }}
            id='web3-account-identifier-row'
          >
            {udDomain
              ? udDomain
              : ENSName
              ? ENSName
              : account && shortenAddress(account)}
          </Typography>
        </Box>
        <Box
          className='flex items-center cursor-pointer'
          gridGap={4}
          sx={{ color: '#448aff' }}
          onClick={openOptions}
        >
          <ReplayIcon style={{ fontSize: '18px' }} /> Change
        </Box>
      </Box>
      <Box
        mt={2}
        padding={2}
        mb={3}
        borderRadius={10}
        className='bg-secondary2'
      >
        <Box className=''>
          <Typography
            style={{
              color: '#c7cad9',
              fontSize: '24px',
              marginBottom: '8px',
            }}
          >
            {balance ?? '-'}{' '}
            {nativeTokenSymbols?.[chainId as keyof typeof nativeTokenSymbols] ||
              ''}
          </Typography>
          <Typography style={{ color: '#696c80', fontSize: '14px' }}>
            ${(+price.price * +(balance || 0) || 0)?.toFixed(2)}
          </Typography>
        </Box>
      </Box>
      <Box>
        {links?.map((item, index) => {
          return item.onClick ? (
            <div
              onClick={item.onClick}
              style={{
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                textDecoration: 'none',
                fontSize: '16px',
                color: '#c7cad9',
                cursor: 'pointer',
              }}
            >
              {item.icon}
              {item.name}
            </div>
          ) : (
            <a
              key={index}
              href={item.url}
              style={{
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                textDecoration: 'none',
                fontSize: '16px',
                color: '#c7cad9',
              }}
              target='_blank'
              rel='noopener noreferrer'
            >
              {item.icon}
              {item.name}
            </a>
          );
        })}
      </Box>
      {/* {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <>
          <Box
            className='flex justify-between items-center'
            px={2}
            pt={2}
            mb={1}
          >
            <small>{t('recentTransactions')}</small>
            <small
              className='cursor-pointer'
              onClick={clearAllTransactionsCallback}
            >
              {t('clearAll')}
            </small>
          </Box>
          <Box paddingX={2} flex={1} overflow='auto'>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </Box>
        </>
      ) : (
        <Box paddingX={2} pt={2}>
          <p>{t('transactionsWillAppear')}...</p>
        </Box>
      )} */}
    </Box>
  );
};

export default AccountDetails;
