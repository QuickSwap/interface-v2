import { Box } from '@mui/material';
import React, { ReactNode } from 'react';
import { AlertTriangle } from 'react-feather';

export default function SwapCallbackError({ error }: { error: ReactNode }) {
  return (
    <Box className='flex items-center justify-center'>
      <Box mr='6px'>
        <AlertTriangle size={24} />
      </Box>
      <p style={{ wordBreak: 'break-word' }}>{error}</p>
    </Box>
  );
}
