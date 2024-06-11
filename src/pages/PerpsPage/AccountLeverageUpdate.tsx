import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { AccountLeverageSlider } from './AccountLeverageSlider';
import { useLeverage } from '@orderly.network/hooks';

export const AccountLeverageUpdate: React.FC = () => {
  const [showEdit, setShowEdit] = useState(false);
  const [maxLeverage, { update }] = useLeverage();
  const [leverage, setLeverage] = useState<number | undefined>(undefined);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const updateLeverage = async () => {
    setLoadingUpdate(true);
    try {
      await update({ leverage });
      setLoadingUpdate(false);
    } catch (e) {
      setLoadingUpdate(false);
    }
  };

  return (
    <>
      <Box className='flex items-center justify-between'>
        <Box>
          <p className='span text-secondary'>Max account leverage</p>
          <p className='span'>{maxLeverage}x</p>
        </Box>
        <Box className='flex items-center' gridGap={6}>
          {showEdit && (
            <Button
              className='leverageManageButton'
              disabled={
                !leverage || Number(maxLeverage) === leverage || loadingUpdate
              }
              onClick={updateLeverage}
            >
              {loadingUpdate ? 'Updating' : 'Update'}
            </Button>
          )}
          <Box
            p='4px'
            className='cursor-pointer'
            onClick={() => setShowEdit(!showEdit)}
          >
            <p className='text-primary span'>{showEdit ? 'Hide' : 'Edit'}</p>
          </Box>
        </Box>
      </Box>
      {showEdit && (
        <Box mt={1} mb={2}>
          <AccountLeverageSlider
            leverage={leverage}
            setLeverage={setLeverage}
          />
        </Box>
      )}
    </>
  );
};
