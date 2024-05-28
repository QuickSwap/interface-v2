import { Box } from '@material-ui/core';
import { TransactionType } from 'models/enums';
import React, { useMemo } from 'react';

interface TransactionIconProps {
  type: TransactionType;
}

const TransactionIcon: React.FC<TransactionIconProps> = ({ type }) => {
  const renderIcon = useMemo(() => {
    switch (type) {
      case TransactionType.SEND:
        return <img src='' alt='' />;

      default:
        break;
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
