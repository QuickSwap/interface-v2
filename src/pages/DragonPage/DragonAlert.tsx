import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { ReactComponent as AlertIcon } from 'assets/images/AlertIcon.svg';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';

const DragonAlert: React.FC = () => {
  const [openAlert, setOpenAlert] = useState(true);
  return (
    <>
      {openAlert && (
        <Box
          mb={3}
          display='flex'
          alignItems='center'
          width='100%'
          className='bg-secondary2'
          padding='16px 24px 16px 12px'
          borderRadius={12}
        >
          <AlertIcon />
          <Box mx={2} width='calc(100% - 96px)'>
            <p>
              As of May 2022, you can stake QUICK(NEW) in Syrup Pools. Note that
              there are some Syrup Pools that will still accept QUICK(OLD) for
              staking, until they run out of rewards
            </p>
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
