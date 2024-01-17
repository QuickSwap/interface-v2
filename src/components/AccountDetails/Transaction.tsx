import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { CheckCircle, Triangle } from 'react-feather';
import { useActiveWeb3React } from 'hooks';
import { getEtherscanLink } from 'utils';
import { useAllTransactions } from 'state/transactions/hooks';
import styles from 'styles/components/AccountDetails.module.scss';

interface TransactionProps {
  hash: string;
}

const Transaction: React.FC<TransactionProps> = ({ hash }) => {
  const { chainId } = useActiveWeb3React();
  const allTransactions = useAllTransactions();

  const tx = allTransactions?.[hash];
  const summary = tx?.summary;
  const pending = !tx?.confirmedTime;
  const success =
    !pending &&
    tx &&
    tx.receipt &&
    (tx.receipt.status === 1 || typeof tx.receipt.status === 'undefined');

  if (!chainId) return null;

  return (
    <Box className={styles.transactionState}>
      <a
        className={styles.transactionStatusText}
        href={getEtherscanLink(chainId, hash, 'transaction')}
        target='_blank'
        rel='noopener noreferrer'
      >
        {summary ?? hash} ↗
      </a>
      <Box className={styles.iconWrapper}>
        {pending ? (
          <CircularProgress size={16} />
        ) : success ? (
          <CheckCircle size='16' />
        ) : (
          <Triangle size='16' />
        )}
      </Box>
    </Box>
  );
};

export default Transaction;
