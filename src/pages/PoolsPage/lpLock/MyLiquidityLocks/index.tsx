import React, { useMemo, useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { useActiveWeb3React, useV2LiquidityPools } from 'hooks';
import { useTranslation } from 'react-i18next';
import { useWalletModalToggle } from 'state/application/hooks';
import ToggleVersion from '../ToggleVersion';
import { useUserV2LiquidityLocks, useUserV3LiquidityLocks } from 'state/data/liquidityLocker';
import { Skeleton } from '@material-ui/lab';
import LockPositionCard from './components';

export default function MyLiquidityLocks() {
  const { t } = useTranslation();
  const [isV3, setIsV3] = useState(false);
  const { account } = useActiveWeb3React();
  //const account ="0x43affF626834561253C0fE4AC6B8B7dD44eEe68D"
  const {
    loading: v2IsLoading,
    pairs: allV2PairsWithLiquidity,
  } = useV2LiquidityPools(account ?? undefined);
  const pairs = useMemo(() => allV2PairsWithLiquidity, [allV2PairsWithLiquidity.length]);
  const { data: v2Locks, loading: v2LockIsLoading } = useUserV2LiquidityLocks(account, pairs)
  const { data: v3Locks, loading: v3LockIsLoading } = useUserV3LiquidityLocks(account)

  const showConnectAWallet = Boolean(!account);
  const toggleWalletModal = useWalletModalToggle();  

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
            <Button fullWidth onClick={toggleWalletModal}>
              {t('connectWallet')}
            </Button>
          </Box>
        ) : isV3 ? (
          <Box mt={3}>
            {(v3LockIsLoading) ? (
              <Box width={1}>
                <Skeleton width='100%' height={50} />
              </Box>
            ) : v3Locks && v3Locks.length > 0 ? (
              <Box>
                {v3Locks.map((lock) => (
                  <Box key={lock.pair.tokenAddress} mt={2}>
                    <LockPositionCard
                      key={lock.pair.tokenAddress}
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
            {(v2LockIsLoading || v2IsLoading) ? (
              <Box width={1}>
                <Skeleton width='100%' height={50} />
              </Box>
            ) : v2Locks && v2Locks.length > 0 ? (
              <Box>
                {v2Locks.map((lock) => (
                  <Box key={lock.pair.tokenAddress} mt={2}>
                    <LockPositionCard
                      key={lock.pair.tokenAddress}
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
