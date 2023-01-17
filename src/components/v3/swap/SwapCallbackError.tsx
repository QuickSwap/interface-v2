import React, { ReactNode } from 'react';
import { Box } from 'theme/components';
import { AlertTriangle } from 'react-feather';

export default function SwapCallbackError({ error }: { error: ReactNode }) {
  return (
    <Box className='flex items-center justify-center'>
      <Box margin='0 6px 0 0'>
        <AlertTriangle size={24} />
      </Box>
      <p style={{ wordBreak: 'break-word' }}>{error}</p>
    </Box>
  );
}
