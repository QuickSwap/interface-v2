import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { AppDispatch } from 'state';
import { Box } from 'theme/components';
import { clearAllTransactions } from 'state/transactions/actions';
import { shortenAddress, getEtherscanLink, getWalletKeys } from 'utils';
import { SUPPORTED_WALLETS } from 'constants/index';
import { ReactComponent as Close } from 'assets/images/CloseIcon.svg';
import {
  injected,
  walletlink,
  safeApp,
  trustconnect,
  unstopabbledomains,
  metamask,
} from 'connectors';
import { ExternalLink as LinkIcon } from 'react-feather';
import 'components/styles/AccountDetails.scss';
import StatusIcon from './StatusIcon';
import Copy from './CopyHelper';
import Transaction from './Transaction';
import { useTranslation } from 'react-i18next';
import { useUDDomain } from 'state/application/hooks';

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
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  function formatConnectorName() {
    const name = getWalletKeys(connector).map(
      (k) => SUPPORTED_WALLETS[k].name,
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
    <Box padding='32px 24px'>
      <Box className='flex justify-between'>
        <h5 className='text-bold'>{t('account')}</h5>
        <Close className='cursor-pointer' onClick={toggleWalletModal} />
      </Box>
      <Box
        margin='16px 0 0'
        padding='16px'
        borderRadius='10px'
        className='bg-secondary2'
      >
        <Box className='flex justify-between items-center'>
          {formatConnectorName()}
          <Box className='flex items-center'>
            {connector !== injected &&
              connector !== metamask &&
              connector !== walletlink &&
              connector !== trustconnect &&
              connector !== safeApp && (
                <small
                  style={{ cursor: 'pointer', marginRight: 8 }}
                  onClick={() => {
                    if (connector === unstopabbledomains) {
                      (connector as any).handleDeactivate();
                    } else {
                      (connector as any).close();
                    }
                  }}
                >
                  {t('disconnect')}
                </small>
              )}
            {connector !== safeApp && (
              <small
                className='cursor-pointer'
                onClick={() => {
                  openOptions();
                }}
              >
                {t('change')}
              </small>
            )}
          </Box>
        </Box>
        <Box className='flex items-center' margin='12px 0'>
          <StatusIcon />
          <h5 style={{ marginLeft: 8 }} id='web3-account-identifier-row'>
            {udDomain
              ? udDomain
              : ENSName
              ? ENSName
              : account && shortenAddress(account)}
          </h5>
        </Box>
        <Box className='flex justify-between items-center'>
          {account && (
            <Box className='flex items-center'>
              <Copy toCopy={account} />
              <small>{t('copyAddress')}</small>
            </Box>
          )}
          {chainId && account && (
            <a
              className='addressLink'
              href={
                chainId &&
                getEtherscanLink(
                  chainId,
                  ENSName ? ENSName : account,
                  'address',
                )
              }
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
            className='flex justify-between items-center'
            padding='16px 16px 0'
            margin='0 0 8px'
          >
            <small>{t('recentTransactions')}</small>
            <small
              className='cursor-pointer'
              onClick={clearAllTransactionsCallback}
            >
              {t('clearAll')}
            </small>
          </Box>
          <Box padding='0 16px' flex={1} overflow='auto'>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </Box>
        </>
      ) : (
        <Box padding='16px 16px 0'>
          <p>{t('transactionsWillAppear')}...</p>
        </Box>
      )}
    </Box>
  );
};

export default AccountDetails;
