import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { ReactComponent as AlertIcon } from 'assets/images/AlertIcon.svg';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';

const DragonAlert: React.FC = () => {
  const [openAlert, setOpenAlert] = useState(true);
  return (
    <>
      {openAlert && (
        <Box className='dragonAlertWrapper bg-secondary2'>
          <AlertIcon />
          <Box mx={2} width='calc(100% - 96px)'>
            <p>
              As of May 2022, you can stake QUICK(NEW) in Syrup Pools. Note that
              there are some Syrup Pools that will still accept QUICK(OLD) for
              staking, until they run out of rewards
            </p>
          </Box>
          <CloseIcon
            className='cursor-pointer'
            onClick={() => setOpenAlert(false)}
          />
        </Box>
      )}
    </>
  );
};

export default DragonAlert;
