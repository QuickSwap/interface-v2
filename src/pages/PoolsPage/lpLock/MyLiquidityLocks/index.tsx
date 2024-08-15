import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React, useConnectWallet } from 'hooks';
import { useTranslation } from 'react-i18next';
import ToggleVersion from '../ToggleVersion';
import {
  useUserV2LiquidityLocks,
  useUserV3LiquidityLocks,
} from 'state/data/liquidityLocker';
import { Skeleton } from '@material-ui/lab';
import LockPositionCard from './components';
import { useIsSupportedNetwork } from 'utils';

export default function MyLiquidityLocks() {
  const { t } = useTranslation();
  const [isV3, setIsV3] = useState(false);
  const { account } = useActiveWeb3React();
  const { data: v2Locks, loading: v2LockIsLoading } = useUserV2LiquidityLocks(
    account,
  );
  const { data: v3Locks, loading: v3LockIsLoading } = useUserV3LiquidityLocks(
    account,
  );

  const showConnectAWallet = Boolean(!account);
  const isSupportedNetwork = useIsSupportedNetwork();
  const { connectWallet } = useConnectWallet(isSupportedNetwork);

  return (
    <Box>
      <Box className='flex justify-between items-center'>
        <p className='weight-600'>{t('myLiquidityLocks')}</p>
      </Box>
      <Box mt={2}>
        <ToggleVersion method={setIsV3} checkValue={isV3} />
      </Box>
      <Box textAlign='center'>
        {showConnectAWallet ? (
          <Box maxWidth={250} margin='20px auto 0'>
            <Button fullWidth onClick={connectWallet}>
              {t('connectWallet')}
            </Button>
          </Box>
        ) : isV3 ? (
          <Box mt={3}>
            {v3LockIsLoading ? (
              <Box width={1}>
                <Skeleton width='100%' height={50} />
              </Box>
            ) : v3Locks && v3Locks.length > 0 ? (
              <Box>
                {v3Locks.map((lock) => (
                  <Box
                    key={
                      lock.event.lockContractAddress +
                      '_' +
                      lock.event.lockDepositId +
                      '_' +
                      lock.event.unlockTime
                    }
                    mt={2}
                  >
                    <LockPositionCard
                      key={
                        lock.event.lockContractAddress +
                        '_' +
                        lock.event.lockDepositId +
                        '_' +
                        lock.event.unlockTime
                      }
                      lock={lock}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box textAlign='center'>
                <p>{t('noV3LiquidityLocks')}.</p>
              </Box>
            )}
          </Box>
        ) : (
          <Box mt={3}>
            {v2LockIsLoading ? (
              <Box width={1}>
                <Skeleton width='100%' height={50} />
              </Box>
            ) : v2Locks && v2Locks.length > 0 ? (
              <Box>
                {v2Locks.map((lock) => (
                  <Box
                    key={
                      lock.event.lockContractAddress +
                      '_' +
                      lock.event.lockDepositId +
                      '_' +
                      lock.event.unlockTime
                    }
                    mt={2}
                  >
                    <LockPositionCard
                      key={
                        lock.event.lockContractAddress +
                        '_' +
                        lock.event.lockDepositId +
                        '_' +
                        lock.event.unlockTime
                      }
                      lock={lock}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box textAlign='center'>
                <p>{t('noV2LiquidityLocks')}.</p>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
