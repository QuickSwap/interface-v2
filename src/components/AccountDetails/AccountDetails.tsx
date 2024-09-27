import { useArcxAnalytics } from '@arcxmoney/analytics';
import { Box, ButtonBase, Snackbar, Typography } from '@material-ui/core';
import { KeyboardArrowLeft } from '@material-ui/icons';
import ReplayIcon from '@material-ui/icons/Replay';
import { Alert } from '@material-ui/lab';
import { useDisconnect } from '@web3modal/ethers5/react';

import cogIcon from 'assets/images/icons/cog.png';
import copyIcon from 'assets/images/icons/copy.svg';
import globalIcon from 'assets/images/icons/global.webp';
import logout from 'assets/images/icons/logout.svg';
import swapIcon from 'assets/images/icons/swap.svg';
import walletIcon from 'assets/images/icons/wallet.png';
import MeldModal from 'components/MeldModal';
import SettingsModal from 'components/SettingsModal';
import 'components/styles/AccountDetails.scss';
import {
  nativeTokenSymbols,
  wrappedTokenAddresses,
} from 'constants/v3/addresses';
import { ethers } from 'ethers';
import { useActiveWeb3React } from 'hooks';
import useCopyClipboard from 'hooks/useCopyClipboard';
import { TransactionType } from 'models/enums';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'state';
import { clearAllTransactions } from 'state/transactions/actions';
import { getEtherscanLink, shortenAddress } from 'utils';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import StatusIcon from './StatusIcon';
import Transaction from './Transaction';
import TransactionItem from './TransactionItem';
import { useAllTransactions } from 'state/transactions/hooks';

const renderTitle = (type?: string) => {
  switch (type) {
    case TransactionType.SEND:
      return 'Sent';
    case TransactionType.SWAPPED:
      return 'Swapped';
    case TransactionType.APPROVED:
      return 'Approved';
    case TransactionType.RECEIVED:
      return 'Received';
    case TransactionType.ADDED_LIQUIDITY:
      return 'Added Liquidity';
    case TransactionType.CLAIMED_REWARDS:
      return 'Claimed Rewards';
    case TransactionType.BUY_BOND:
      return 'Buy Bond';
    case TransactionType.CLAIM_BOND:
      return 'Claim Bond';
    case TransactionType.DEPOSIT_NFT:
      return 'Deposit NFT';
    case TransactionType.REMOVE_LIQUIDITY:
      return 'Remove Liquidity';
    case TransactionType.STAKE:
      return 'Stake';
    case TransactionType.TRANSFER_BOND:
      return 'Transfer Bond';
    case TransactionType.UNDEPOSIT_NFT:
      return 'Undeposit NFT';
    case TransactionType.UNSTAKE:
      return 'Unstake';
    case TransactionType.UNWRAP:
      return 'Unwrap';
    case TransactionType.WITHDRAW_LIQUIDITY:
      return 'Withdraw Liquidity';
    case TransactionType.WITHDRAW_NFT:
      return 'Withdraw NFT';
    case TransactionType.WRAP:
      return 'Wrap';
    case TransactionType.ZAP:
      return 'Zap';

    default:
      return 'Transaction';
  }
};

const timeDiff = (time: number) => {
  // Time constants in milliseconds
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay; // Approximating 1 month as 30 days

  let timeString = '';

  const now = Date.now(); // Get the current timestamp in milliseconds
  let diff = Math.abs(now - time); // Difference between current time and the given time

  if (diff >= oneMonth) {
    const months = Math.floor(diff / oneMonth);
    timeString += `${months}mo `;
    diff %= oneMonth;
  }

  if (diff >= oneWeek) {
    const weeks = Math.floor(diff / oneWeek);
    timeString += `${weeks}w `;
    diff %= oneWeek;
  }

  if (diff >= oneDay) {
    const days = Math.floor(diff / oneDay);
    timeString += `${days}d `;
    diff %= oneDay;
  }

  if (diff >= oneHour) {
    const hours = Math.floor(diff / oneHour);
    timeString += `${hours}h `;
    diff %= oneHour;
  }

  if (diff >= oneMinute) {
    const minutes = Math.floor(diff / oneMinute);
    timeString += `${minutes}m `;
  }

  return timeString;
};

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
  // toggleWalletModal: () => void;
  pendingTransactions: string[];
  confirmedTransactions: string[];
  ENSName?: string;
  close: () => void;
  // openOptions: () => void;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({
  // toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  close,
  // openOptions,
}) => {
  const transactions = useAllTransactions();
  console.log('transactionstransactions', transactions);
  const updatedTransactions = useMemo(() => {
    return Object.values(transactions)
      .sort(
        (item1, item2) =>
          (item2.confirmedTime || 0) - (item1.confirmedTime || 0),
      )
      .map((item) => ({
        desc: item.summary,
        type: item.type,
        title: renderTitle(item.type || TransactionType.TRANSACTION),
        time: timeDiff(item.confirmedTime || 0),
        approval: item.approval,
        tokens: item?.tokens,
      }));
  }, [transactions]);
  const { chainId, account, provider } = useActiveWeb3React();
  const { disconnect } = useDisconnect();
  const [isC, staticCopy] = useCopyClipboard();
  const [showMeldWidget, setShowMeldWidgetWidget] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const arcxSdk = useArcxAnalytics();
  const [balance, setBalance] = useState<string | null>(null);
  const tokenAddress = wrappedTokenAddresses[chainId];
  const [viewTransaction, setViewTransaction] = useState(false);

  const price = useUSDCPriceFromAddress(tokenAddress);

  const getCurrentBalance = async () => {
    if (!account || !provider) return null;
    const balance = await provider?.getBalance(account || '');

    setBalance(ethers.utils.formatEther(balance || '0'));
  };

  useEffect(() => {
    getCurrentBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

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
      onClick: () => {
        setViewTransaction(true);
        console.log('open transaction');
      },
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
        close();
        disconnect();
      },
    },
  ];

  const handleCloseSettingModal = () => {
    setIsSettingOpen(false);
  };

  return (
    <Box
      sx={{
        padding: '16px',
        border: 'solid 1px #282d3d',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
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
            {ENSName ? ENSName : account && shortenAddress(account)}
          </Typography>
        </Box>
        {/* <Box
          className='flex items-center cursor-pointer'
          gridGap={4}
          sx={{ color: '#448aff' }}
          // onClick={openOptions}
        >
          <ReplayIcon style={{ fontSize: '18px' }} /> Change
        </Box> */}
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
            {balance ?? '-'} {nativeTokenSymbols?.[chainId] || ''}
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
      <Box
        style={{
          height: '100%',
          visibility: viewTransaction ? 'visible' : 'hidden',
          position: 'absolute',
          left: viewTransaction ? 16 : 400,
          right: viewTransaction ? 16 : -400,
          top: 16,
          bottom: 16,
          zIndex: 100,
          backgroundColor: '#1b1e29',
          transition: '0.5s ease-in-out',
        }}
      >
        {/* <button
          onClick={() => {
            setViewTransaction(false);
          }}
        >
          Back
        </button> */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gridGap: '8px',
            paddingBottom: '12px',
            borderBottom: '1px solid #282d3d',
          }}
        >
          <ButtonBase
            onClick={() => {
              setViewTransaction(false);
            }}
          >
            <KeyboardArrowLeft />
          </ButtonBase>
          <Typography>Transaction History</Typography>
        </Box>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            height: '90%',
            overflow: 'scroll',
            paddingTop: '12px',
            position: 'relative',
            paddingBottom: 48,
          }}
        >
          {updatedTransactions.map((item, index) => {
            return <TransactionItem transaction={item} key={index} />;
          })}
        </Box>
        <Box
          style={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            width: '100%',
            height: '64px',
            backgroundImage:
              'linear-gradient(to bottom, rgba(27, 30, 41, 0) 15%, rgba(27, 30, 41, 0.64) 47%, #1b1e29 81%)',
          }}
        />
        {!!pendingTransactions.length || !!confirmedTransactions.length ? (
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
            <Box></Box>
          </>
        ) : (
          <Box paddingX={2} pt={2}>
            <p>{t('transactionsWillAppear')}...</p>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AccountDetails;
