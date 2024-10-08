import React from 'react';
import { Typography, styled } from '@material-ui/core';
import { WarningOutlined } from '@material-ui/icons';

export function LowSrcAmountWarning() {
  return (
    <StyledWarning>
      <WarningOutlined /> Trade size must be at least 100$
    </StyledWarning>
  );
}

const StyledWarning = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  marginTop: '20px',
  color: theme.palette.error.main,
  '& .MuiSvgIcon-root': {
    width: 12,
    height: 12,
    position: 'relative',
    top: '-1px',
  },
}));
