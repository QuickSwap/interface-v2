import React from 'react'
import { Box, CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { CheckCircle, Triangle } from 'react-feather'

import { useActiveWeb3React } from 'hooks'
import { getEtherscanLink } from 'utils'
import { useAllTransactions } from 'state/transactions/hooks'

const useStyles = makeStyles(({ palette }) => ({
  transactionState: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '0.5rem',
    padding: '0.25rem 0rem',
    fontWeight: 500,
    fontSize: '0.825rem',
    color: palette.text.primary
  },
  iconWrapper: {
    color: palette.primary.main
  },
  transactionStatusText: {
    color: palette.primary.main,
    textDecoration: 'none',
    fontSize: 14,
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}));

interface TransactionProps {
  hash: string;
}

const Transaction: React.FC<TransactionProps> = ({ hash }) => {
  const classes = useStyles();
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()

  const tx = allTransactions?.[hash]
  const summary = tx?.summary
  const pending = !tx?.receipt
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')

  if (!chainId) return null

  return (
    <Box className={classes.transactionState}>
      <a className={classes.transactionStatusText} href={getEtherscanLink(chainId, hash, 'transaction')} target='_blank' rel='noreferrer'>{summary ?? hash} ↗</a>
      <Box className={classes.iconWrapper}>
        {pending ? <CircularProgress size='16' /> : success ? <CheckCircle size="16" /> : <Triangle size="16" />}
      </Box>
    </Box>
  )
}

export default Transaction
