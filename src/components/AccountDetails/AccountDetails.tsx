import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { AppDispatch } from 'state';
import { Box, Typography } from '@material-ui/core';
import { clearAllTransactions } from 'state/transactions/actions';
import { shortenAddress, getEtherscanLink, getWalletKeys } from 'utils';
import { ReactComponent as Close } from 'assets/images/CloseIcon.svg';
import { ExternalLink as LinkIcon } from 'react-feather';
import 'components/styles/AccountDetails.scss';
import StatusIcon from './StatusIcon';
import Copy from './CopyHelper';
import Transaction from './Transaction';
import { useTranslation } from 'react-i18next';
import { useUDDomain } from 'state/application/hooks';
import { useSelectedWallet } from 'state/user/hooks';
import { useArcxAnalytics } from '@arcxmoney/analytics';
import { networkConnection } from 'connectors';
import ReplayIcon from '@material-ui/icons/Replay';
import { VscArrowSwap } from 'react-icons/vsc';
import { TbCopy, TbLogout } from 'react-icons/tb';
import { AiOutlineGlobal } from 'react-icons/ai';
import { FaCog } from 'react-icons/fa';
import { MdWallet } from 'react-icons/md';
import { Link } from 'react-router-dom';

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
  const { udDomain, updateUDDomain } = useUDDomain();
  const { updateSelectedWallet } = useSelectedWallet();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const arcxSdk = useArcxAnalytics();

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

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }));
  }, [dispatch, chainId]);

  const links = [
    {
      icon: <VscArrowSwap />,
      name: 'View transactions',
      url: '#',
    },
    {
      icon: <TbCopy />,
      name: 'Copy address',
      url: '#',
    },
    {
      icon: <AiOutlineGlobal />,
      name: 'View on explorer',
      url: '#',
    },
    {
      icon: <FaCog />,
      name: 'Settings',
      url: '#',
    },
    {
      icon: <MdWallet />,
      name: 'Buy crypto with fiat',
      url: '#',
    },
    {
      icon: <TbLogout />,
      name: 'Disconnect',
      url: '#',
    },
  ];

  return (
    <Box sx={{ padding: '16px', border: 'solid 1px #282d3d' }}>
      {/* <Box className='flex justify-between'>
        <h5 className='text-bold'>{t('account')}</h5>
        <Close className='cursor-pointer' onClick={toggleWalletModal} />
      </Box> */}
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
          className='flex items-center'
<<<<<<< HEAD
          sx={{ color: '#448aff', gap: '4px' }}
=======
          gridGap={4}
          sx={{ color: '#448aff' }}
>>>>>>> 5ed462415c8091e8566e830d03ee7ff057e5f69f
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
            style={{ color: '#c7cad9', fontSize: '24px', marginBottom: '8px' }}
          >
            52.24 MATIC
          </Typography>
          <Typography style={{ color: '#696c80', fontSize: '14px' }}>
            $26.59
          </Typography>
        </Box>
      </Box>
      <Box>
        {links.map((item, index) => {
          return (
            <Link
              key={index}
              to={item.url}
              style={{
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                textDecoration: 'none',
                fontSize: '16px',
                color: '#c7cad9',
              }}
            >
              {item.icon}
              {item.name}
            </Link>
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
