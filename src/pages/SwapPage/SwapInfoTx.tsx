import React, { useState } from 'react';
import { Box, Typography, Divider } from '@material-ui/core';
import { ButtonSwitch } from 'components';

const SwapInfoTx: React.FC<{
  token1Address?: string;
  token2Address?: string;
}> = ({ token1Address, token2Address }) => {
  const [txFilter, setTxFilter] = useState('5m');

  return (
    <>
      <ButtonSwitch
        height={32}
        value={txFilter}
        onChange={setTxFilter}
        items={[
          { label: '5m', value: '5m' },
          { label: '1h', value: '1h' },
          { label: '6h', value: '6h' },
          { label: '24h', value: '24h' },
        ]}
      />
      <Box pt={1} px={1}>
        <Box py={1} display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Transactions:
          </Typography>
          <Typography variant='body2'>12</Typography>
        </Box>
        <Divider />
        <Box py={1} display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Buys:
          </Typography>
          <Typography variant='body2'>8</Typography>
        </Box>
        <Divider />
        <Box py={1} display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Sells:
          </Typography>
          <Typography variant='body2'>4</Typography>
        </Box>
        <Divider />
        <Box pt={1} display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Volume:
          </Typography>
          <Typography variant='body2'>$3.44K</Typography>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(SwapInfoTx);
