import { Box, Typography } from '@material-ui/core';
import React from 'react';
import TransactionIcon from './TransactionIcon';

interface TransactionItemProps {
  transaction: any;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gridGap: '16px',
      }}
    >
      <TransactionIcon
        type={transaction.type}
        tokens={transaction.tokens}
        approval={transaction?.approval}
      />
      <Box
        sx={{
          width: '100%',
          flex: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}
          >
            {transaction.title}
          </Typography>
          <Typography
            style={{ fontSize: '14px', fontWeight: 500, color: '#696c80' }}
          >
            {transaction.time}
          </Typography>
        </Box>
        <Typography
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#696c80',
          }}
        >
          {transaction.desc}
        </Typography>
      </Box>
    </Box>
  );
};
export default TransactionItem;
