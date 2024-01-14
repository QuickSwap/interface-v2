import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { AppDispatch } from 'state';
import { Box } from '@mui/material';
import { clearAllTransactions } from 'state/transactions/actions';
import { shortenAddress, getEtherscanLink, getWalletKeys } from 'utils';
import { Close } from '@mui/icons-material';
import { ExternalLink as LinkIcon } from 'react-feather';
import styles from 'styles/components/AccountDetails.module.scss';
import StatusIcon from './StatusIcon';
import Copy from './CopyHelper';
import Transaction from './Transaction';
import { useTranslation } from 'next-i18next';
import { useUDDomain } from 'state/application/hooks';
import { useSelectedWallet } from 'state/user/hooks';
import { useArcxAnalytics } from '@arcxmoney/analytics';
import { networkConnection } from 'connectors';

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
  const { udDomain } = useUDDomain();
  const { updateSelectedWallet } = useSelectedWallet();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const arcxSdk = useArcxAnalytics();

  function formatConnectorName() {
    const name = getWalletKeys(connector).map(
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

  return (
    <Box paddingX={3} paddingY={4}>
      <Box className='flex justify-between'>
        <h5 className='text-bold'>{t('account')}</h5>
        <Close className='cursor-pointer' onClick={toggleWalletModal} />
      </Box>
      <Box mt={2} padding={2} borderRadius='10px' className='bg-secondary2'>
        <Box className='flex items-center justify-between'>
          {formatConnectorName()}
          <Box className='flex items-center'>
            <small
              style={{ cursor: 'pointer', marginRight: 8 }}
              onClick={async () => {
                if (arcxSdk) {
                  await arcxSdk.disconnection({ account, chainId });
                }
                if (connector && connector.deactivate) {
                  await connector.deactivate();
                }
                await connector.resetState();
                updateSelectedWallet(undefined);

                const localChainId = localStorage.getItem('localChainId');
                await networkConnection.connector.activate(
                  Number(localChainId),
                );
              }}
            >
              {t('disconnect')}
            </small>
            <small
              className='cursor-pointer'
              onClick={() => {
                openOptions();
              }}
            >
              {t('change')}
            </small>
          </Box>
        </Box>
        <Box className='flex items-center' my={1.5}>
          <StatusIcon />
          <h5 style={{ marginLeft: 8 }} id='web3-account-identifier-row'>
            {udDomain
              ? udDomain
              : ENSName
              ? ENSName
              : account && shortenAddress(account)}
          </h5>
        </Box>
        <Box className='flex items-center justify-between'>
          {account && (
            <Box className='flex items-center'>
              <Copy toCopy={account} />
              <small>{t('copyAddress')}</small>
            </Box>
          )}
          {chainId && account && (
            <a
              className={styles.addressLink}
              href={getEtherscanLink(
                chainId,
                ENSName ? ENSName : account,
                'address',
              )}
              target='_blank'
              rel='noopener noreferrer'
            >
              <LinkIcon size={16} />
              <small>{t('viewonBlockExplorer')}</small>
            </a>
          )}
        </Box>
      </Box>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <>
          <Box
            className='flex items-center justify-between'
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
      )}
    </Box>
  );
};

export default AccountDetails;
