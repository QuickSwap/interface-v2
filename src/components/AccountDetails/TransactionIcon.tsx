import { Box } from '@material-ui/core';
import { TransactionType } from 'models/enums';
import React, { useMemo } from 'react';
import send from 'assets/images/icons/transactions/arrow-send.svg';
import received from 'assets/images/icons/transactions/arrow-received.svg';
import swap from 'assets/images/icons/transactions/swap-icon.svg';
import liquidity from 'assets/images/icons/transactions/icon-liquidity.svg';
import usdc from 'assets/images/icons/transactions/usdc.svg';
import star from 'assets/images/icons/transactions/icon-star.svg';

interface TransactionIconProps {
  type: TransactionType;
}

const TransactionIcon: React.FC<TransactionIconProps> = ({ type }) => {
  const renderIcon = useMemo(() => {
    switch (type) {
      case TransactionType.SEND:
        return <img src={send} alt='send' />;
      case TransactionType.APPROVED:
        return <img src={usdc} alt='usdc' />;
      case TransactionType.SWAPPED:
        return <img src={swap} alt='swap' />;
      case TransactionType.ADDED_LIQUIDITY:
        return <img src={liquidity} alt='liquidity' />;
      case TransactionType.CLAIMED_REWARDS:
        return <img src={star} alt='claim' />;
      case TransactionType.RECEIVED:
        return <img src={received} alt='received' />;

      case TransactionType.SEND:
        return <img src={send} alt='send' />;
    }
  }, [type]);

  return (
    <Box
      sx={{
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#282d3d',
        borderRadius: '16px',
      }}
    >
      {renderIcon}
    </Box>
  );
};
export default TransactionIcon;
