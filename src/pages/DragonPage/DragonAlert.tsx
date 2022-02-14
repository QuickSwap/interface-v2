import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@material-ui/core';
import { ReactComponent as AlertIcon } from 'assets/images/AlertIcon.svg';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';

const DragonAlert: React.FC = () => {
  const { palette } = useTheme();
  const [openAlert, setOpenAlert] = useState(true);
  return (
    <>
      {openAlert && (
        <Box
          mb={3}
          display='flex'
          alignItems='center'
          width='100%'
          bgcolor={palette.secondary.dark}
          padding='16px 24px 16px 12px'
          borderRadius={12}
        >
          <AlertIcon />
          <Box mx={2} width='calc(100% - 96px)'>
            <Typography>
              As of January 2022, you can stake QUICK in Syrup Pools. Note that
              there are some Syrup Pools that will still accept dQUICK for
              staking, until they run out of rewards.
            </Typography>
          </Box>
          <CloseIcon
            onClick={() => setOpenAlert(false)}
            style={{ cursor: 'pointer' }}
          />
        </Box>
      )}
    </>
  );
};

export default DragonAlert;
