import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { LockInterface } from 'state/data/liquidityLocker';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { utils } from 'ethers';
dayjs.extend(utc);

const LockPositionCardDetails: React.FC<{ lock: LockInterface }> = ({
  lock,
}) => {
  const { t } = useTranslation();

  const liquidityLocked = utils.formatUnits(
    lock.event.lockAmount,
    (lock.liquidityContract ?? lock.token).tokenDecimals,
  );

  const isLocked = dayjs.unix(lock.event.unlockTime) > dayjs();
  const withdrawn = lock?.event?.isWithdrawn;

  return (
    <>
      <Box className='lockPositionCardDetails'>
        <Box className='cardRow'>
          <small>{t('lockedLiquidity')}:</small>
          <small>{liquidityLocked}</small>
        </Box>
        <Box className='cardRow'>
          <small>{t('lockupPeriod')}:</small>
          <small>{`${dayjs
            .unix(lock.event.timeStamp)
            .format('DD MMM YYYY')} - ${dayjs
            .unix(lock.event.unlockTime)
            .format('DD MMM YYYY')}, ${dayjs
            .unix(lock.event.timeStamp)
            .format('h:mm a')}`}</small>
        </Box>

        <Box className='lockButtonRow'>
          <Button
            variant='outlined'
            onClick={() => console.log('Click "See more details"')}
          >
            <small>{t('seeMoreDetails')}</small>
          </Button>
          <Button
            variant='contained'
            disabled={withdrawn}
            onClick={() => console.log('Click "Extend"')}
          >
            <small>{t('extend')}</small>
          </Button>
          <Button
            variant='contained'
            disabled={isLocked}
            onClick={() => console.log('Click "Claim Tokens"')}
          >
            <small>{t('claimTokens')}</small>
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default LockPositionCardDetails;
